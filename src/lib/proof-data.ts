/**
 * Proof strip — typed stats contract + static fallbacks.
 *
 * The strip mixes two kinds of numbers:
 *   resume metrics — static facts from production work; never fetched
 *   live stats     — LeetCode solved/beats (+ per-difficulty ring) and
 *                    GitHub contribution calendar, fetched at
 *                    build/revalidate time with these fallbacks
 *
 * The fallback IS the contract: if every API call fails, the strip still
 * renders truthful June-2026 figures. Live data is a bonus, never a
 * dependency.
 */

import type { LeetcodeLive } from "@/lib/live/leetcode";
import type { ContributionDay } from "@/lib/live/github";

export type ProofSource = "live" | "fallback";

export type ProofStats = {
  source: ProofSource;
  /** ISO timestamp of the successful fetch (or the fallback vintage). */
  fetchedAt: string;
  leetcode: {
    solved: number;
    /** "Beats x%" on the strongest difficulty tier, per LeetCode. */
    beatsPercent: number;
    /** Per-difficulty breakdown for the ring widget; null = hide ring. */
    byDifficulty: LeetcodeLive["byDifficulty"];
  };
  github: {
    /** Total contributions in the last year; null until live data lands. */
    totalContributions: number | null;
    /** Trailing daily contributions for the heatmap; null = hide heatmap. */
    days: ContributionDay[] | null;
  };
};

/** Truthful as of the June 2026 resume. */
export const fallbackProof: ProofStats = {
  source: "fallback",
  fetchedAt: "2026-06-08",
  leetcode: { solved: 225, beatsPercent: 93.9, byDifficulty: null },
  github: { totalContributions: null, days: null },
};

/** Static resume metrics — these never change at runtime. */
export const resumeMetrics = [
  { value: "200+", label: "concurrent streams" },
  { value: "+35%", label: "proctoring throughput" },
  { value: "−70%", label: "api latency" },
  { value: "−60%", label: "db round-trips" },
] as const;
