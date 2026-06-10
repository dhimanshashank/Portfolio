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
};

const QUERY = `
  query proofStats($username: String!) {
    allQuestionsCount { difficulty count }
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
      problemsSolvedBeatsStats { difficulty percentage }
    }
  }
`;

type CountRow = { difficulty: string; count: number };

type ApiResponse = {
  data?: {
    allQuestionsCount?: CountRow[];
    matchedUser?: {
      submitStatsGlobal?: { acSubmissionNum?: CountRow[] };
      problemsSolvedBeatsStats?: { difficulty: string; percentage: number }[];
    };
  };
};

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
    };
  } catch {
    return null;
  }
}
