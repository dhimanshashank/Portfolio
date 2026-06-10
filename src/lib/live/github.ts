/**
 * GitHub live stats — contribution calendar via the public
 * jogruber contributions API (no auth, generous limits; one request per
 * ISR revalidation is far under any ceiling).
 *
 * Contract: NEVER throws. Returns null on any failure — timeout, non-200,
 * shape drift — and the caller falls back to static figures. Live data is
 * a bonus, not a dependency; a broken third-party API must not be able to
 * fail a build or a render.
 */

import { person } from "@/lib/person";

export type ContributionDay = {
  date: string; // ISO "YYYY-MM-DD"
  count: number;
};

export type GithubLive = {
  totalContributions: number;
  /** Trailing ~26 weeks of daily contributions, oldest → newest, for the
   *  GitHub-style heatmap calendar. */
  days: ContributionDay[];
};

type ApiResponse = {
  total?: Record<string, number>;
  contributions?: { date: string; count: number }[];
};

const TRAILING_DAYS = 26 * 7;

export async function fetchGithubLive(): Promise<GithubLive | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${person.github.user}?y=last`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as ApiResponse;
    const all = data.contributions;
    if (!Array.isArray(all) || all.length === 0) return null;

    const valid = all.filter(
      (d) => typeof d.date === "string" && typeof d.count === "number"
    );
    if (valid.length === 0) return null;

    const totalContributions = valid.reduce((sum, d) => sum + d.count, 0);
    const days = valid
      .slice(-TRAILING_DAYS)
      .map((d) => ({ date: d.date, count: d.count }));

    return { totalContributions, days };
  } catch {
    return null;
  }
}
