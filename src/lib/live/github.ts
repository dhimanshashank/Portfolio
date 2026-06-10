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

export type GithubLive = {
  totalContributions: number;
  /** Last 26 weekly contribution totals, oldest → newest. */
  weeks: number[];
};

type ApiResponse = {
  total?: Record<string, number>;
  contributions?: { date: string; count: number }[];
};

export async function fetchGithubLive(): Promise<GithubLive | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${person.github.user}?y=last`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as ApiResponse;
    const days = data.contributions;
    if (!Array.isArray(days) || days.length === 0) return null;

    const totalContributions = days.reduce(
      (sum, d) => sum + (typeof d.count === "number" ? d.count : 0),
      0
    );

    // Bucket trailing days into 26 weekly totals, oldest → newest.
    const weeks: number[] = [];
    for (let end = days.length; end > 0 && weeks.length < 26; end -= 7) {
      const start = Math.max(0, end - 7);
      weeks.unshift(
        days
          .slice(start, end)
          .reduce((s, d) => s + (typeof d.count === "number" ? d.count : 0), 0)
      );
    }

    return { totalContributions, weeks };
  } catch {
    return null;
  }
}
