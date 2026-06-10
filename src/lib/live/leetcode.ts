/**
 * LeetCode live stats — solved count + "beats %" via the public GraphQL
 * endpoint. LeetCode is known to 403 datacenter IPs (Vercel included), so
 * the static fallback in proof-data.ts is the contract; this is a bonus.
 *
 * Contract: NEVER throws. Returns null on any failure.
 */

import { person } from "@/lib/person";

export type LeetcodeLive = {
  solved: number;
  beatsPercent: number;
};

const QUERY = `
  query proofStats($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
      problemsSolvedBeatsStats { difficulty percentage }
    }
  }
`;

type ApiResponse = {
  data?: {
    matchedUser?: {
      submitStatsGlobal?: {
        acSubmissionNum?: { difficulty: string; count: number }[];
      };
      problemsSolvedBeatsStats?: { difficulty: string; percentage: number }[];
    };
  };
};

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

    const solved = user.submitStatsGlobal?.acSubmissionNum?.find(
      (e) => e.difficulty === "All"
    )?.count;

    // "Beats %" is reported per difficulty; surface the strongest tier the
    // way the resume does (93.9% comes from the best difficulty mix).
    const beats = user.problemsSolvedBeatsStats
      ?.map((e) => e.percentage)
      .filter((p): p is number => typeof p === "number");
    const beatsPercent = beats?.length ? Math.max(...beats) : undefined;

    if (typeof solved !== "number" || typeof beatsPercent !== "number") {
      return null;
    }

    return { solved, beatsPercent: Math.round(beatsPercent * 10) / 10 };
  } catch {
    return null;
  }
}
