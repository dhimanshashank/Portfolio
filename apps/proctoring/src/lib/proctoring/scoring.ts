// ─── Risk scoring ───────────────────────────────────────────────────────────
// Simplified port of the weighted, capped, time-decayed scoring in the Masters
// Union analyzer (frontendProctoringAnalyzer.js: SCORE_WEIGHTS,
// RISK_CATEGORY_CAPS, addPassedFlagsToScore, applyCategoryDecay,
// getAccumulatedScore). Each confirmed flag adds its weight into a per-category
// bucket; buckets are capped and bleed off over time, so a clean stretch lowers
// the score and the final number reads 0–100.

import {
  VIOLATION_CATEGORY,
  type RiskCategory,
  type ViolationFlag,
} from "./violation-tags";

export const SCORE_WEIGHTS: Record<ViolationFlag, number> = {
  multiple_faces: 37,
  face_not_detected_long: 30,
  camera_blackout: 33,
  downward_gaze: 5,
  looking_away: 3,
  low_brightness: 3,
};

export const RISK_CATEGORY_CAPS: Record<RiskCategory, number> = {
  high: 55,
  medium: 40,
  low: 5,
};

/**
 * Time for a category to bleed one full cap's worth of points. Kept long on
 * purpose: a violation should keep the score elevated for minutes so it reads
 * as "sticky" risk, not a spike that vanishes a few seconds later. Over a
 * typical 3-minute quiz a high-risk flag only loses a small fraction.
 */
export const RISK_CATEGORY_DECAY_INTERVAL_MS: Record<RiskCategory, number> = {
  high: 1_200_000, // 20 min
  medium: 900_000, // 15 min
  low: 600_000, // 10 min
};

export type CategoryScores = Record<RiskCategory, number>;

const CATEGORIES: RiskCategory[] = ["high", "medium", "low"];

export function emptyCategoryScores(): CategoryScores {
  return { high: 0, medium: 0, low: 0 };
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Mutable accumulator. One instance lives for the duration of a quiz session.
 * Kept as a small class (not a hook) so the engine can drive it off the main
 * React render loop, exactly like the production analyzer.
 */
export class RiskScoreAccumulator {
  private scores: CategoryScores = emptyCategoryScores();
  private lastDecayAt: Record<RiskCategory, number>;

  constructor(now = Date.now()) {
    this.lastDecayAt = { high: now, medium: now, low: now };
  }

  /** Bleed each category toward zero based on elapsed time. */
  private applyDecay(now: number) {
    for (const cat of CATEGORIES) {
      const elapsed = now - this.lastDecayAt[cat];
      if (elapsed <= 0) continue;
      const perMs = RISK_CATEGORY_CAPS[cat] / RISK_CATEGORY_DECAY_INTERVAL_MS[cat];
      this.scores[cat] = Math.max(0, this.scores[cat] - perMs * elapsed);
      this.lastDecayAt[cat] = now;
    }
  }

  /** Add the weights for a set of just-confirmed flags, respecting caps. */
  addFlags(flags: ViolationFlag[], now = Date.now()) {
    this.applyDecay(now);
    for (const flag of flags) {
      const cat = VIOLATION_CATEGORY[flag];
      const next = this.scores[cat] + SCORE_WEIGHTS[flag];
      this.scores[cat] = Math.min(RISK_CATEGORY_CAPS[cat], next);
    }
  }

  /** Current 0–100 risk score after decay. */
  getScore(now = Date.now()): number {
    this.applyDecay(now);
    return clampScore(this.scores.high + this.scores.medium + this.scores.low);
  }

  getCategoryScores(now = Date.now()): CategoryScores {
    this.applyDecay(now);
    return {
      high: Math.round(this.scores.high),
      medium: Math.round(this.scores.medium),
      low: Math.round(this.scores.low),
    };
  }
}

/** Human-readable risk band for the HUD chip. */
export function riskBand(score: number): { label: string; tone: "ok" | "warn" | "danger" } {
  if (score >= 60) return { label: "High risk", tone: "danger" };
  if (score >= 25) return { label: "Elevated", tone: "warn" };
  return { label: "Low risk", tone: "ok" };
}
