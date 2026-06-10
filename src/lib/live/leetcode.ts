/**
 * LeetCode live stats — solved counts (total + per difficulty), problem
 * totals, and "beats %" via the public GraphQL endpoint. LeetCode is known
 * to 403 datacenter IPs (Vercel included), so the static fallback in
 * proof-data.ts is the contract; this is a bonus.
 *
 * Contract: NEVER throws. Returns null on any failure.
 */

import { person } from "@/lib/person";

export type DifficultySlice = {
  solved: number;
  total: number;
};

export type SubmissionDay = {
  date: string; // ISO "YYYY-MM-DD" (UTC)
  count: number;
};

export type LeetcodeCalendar = {
  /** Trailing ~26 weeks of daily submissions, oldest → newest. */
  days: SubmissionDay[];
  /** Longest streak this year, per LeetCode. */
  streak: number;
  totalActiveDays: number;
};

export type LeetcodeLive = {
  solved: number;
  beatsPercent: number;
  /** Per-difficulty breakdown for the LeetCode-style ring. Null if the
   *  response shape didn't include everything we need. */
  byDifficulty: {
    easy: DifficultySlice;
    medium: DifficultySlice;
    hard: DifficultySlice;
  } | null;
  /** Day-wise submission calendar for the heatmap. Null = hide it. */
  calendar: LeetcodeCalendar | null;
};

const QUERY = `
  query proofStats($username: String!) {
    allQuestionsCount { difficulty count }
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
      problemsSolvedBeatsStats { difficulty percentage }
      userCalendar {
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

const TRAILING_DAYS = 26 * 7;

type CountRow = { difficulty: string; count: number };

type ApiResponse = {
  data?: {
    allQuestionsCount?: CountRow[];
    matchedUser?: {
      submitStatsGlobal?: { acSubmissionNum?: CountRow[] };
      problemsSolvedBeatsStats?: { difficulty: string; percentage: number }[];
      userCalendar?: {
        streak?: number;
        totalActiveDays?: number;
        /** JSON string: { "<unix seconds, UTC midnight>": <count>, ... } */
        submissionCalendar?: string;
      };
    };
  };
};

/** Parse LeetCode's submissionCalendar JSON-string into trailing daily
 *  buckets (UTC days, oldest → newest). Returns null on any shape issue. */
function parseCalendar(
  raw:
    | {
        streak?: number;
        totalActiveDays?: number;
        submissionCalendar?: string;
      }
    | undefined
): LeetcodeCalendar | null {
  try {
    if (
      !raw ||
      typeof raw.submissionCalendar !== "string" ||
      typeof raw.streak !== "number" ||
      typeof raw.totalActiveDays !== "number"
    ) {
      return null;
    }
    const byEpoch = JSON.parse(raw.submissionCalendar) as Record<
      string,
      number
    >;

    const DAY = 86_400_000;
    const todayUtc = Math.floor(Date.now() / DAY) * DAY;
    const days: SubmissionDay[] = [];
    for (let i = TRAILING_DAYS - 1; i >= 0; i--) {
      const ms = todayUtc - i * DAY;
      const count = byEpoch[String(ms / 1000)];
      days.push({
        date: new Date(ms).toISOString().slice(0, 10),
        count: typeof count === "number" ? count : 0,
      });
    }

    return {
      days,
      streak: raw.streak,
      totalActiveDays: raw.totalActiveDays,
    };
  } catch {
    return null;
  }
}

function pick(rows: CountRow[] | undefined, difficulty: string): number | null {
  const v = rows?.find((r) => r.difficulty === difficulty)?.count;
  return typeof v === "number" ? v : null;
}

export async function fetchLeetcodeLive(): Promise<LeetcodeLive | null> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // LeetCode rejects header-less server requests outright.
        Referer: "https://leetcode.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { username: person.leetcode.handle },
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as ApiResponse;
    const user = data.data?.matchedUser;
    if (!user) return null;

    const solvedRows = user.submitStatsGlobal?.acSubmissionNum;
    const totalRows = data.data?.allQuestionsCount;

    const solved = pick(solvedRows, "All");

    // "Beats %" is reported per difficulty; surface the strongest tier the
    // way the resume does.
    const beats = user.problemsSolvedBeatsStats
      ?.map((e) => e.percentage)
      .filter((p): p is number => typeof p === "number");
    const beatsPercent = beats?.length ? Math.max(...beats) : null;

    if (solved === null || beatsPercent === null) return null;

    // Per-difficulty ring data — optional; the headline number stands alone.
    const slices = (["Easy", "Medium", "Hard"] as const).map((d) => ({
      solved: pick(solvedRows, d),
      total: pick(totalRows, d),
    }));
    const byDifficulty = slices.every(
      (s) => s.solved !== null && s.total !== null
    )
      ? {
          easy: { solved: slices[0].solved!, total: slices[0].total! },
          medium: { solved: slices[1].solved!, total: slices[1].total! },
          hard: { solved: slices[2].solved!, total: slices[2].total! },
        }
      : null;

    return {
      solved,
      beatsPercent: Math.round(beatsPercent * 10) / 10,
      byDifficulty,
      calendar: parseCalendar(user.userCalendar),
    };
  } catch {
    return null;
  }
}
