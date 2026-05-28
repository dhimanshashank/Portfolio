/**
 * Manifesto — content for the auto-cycling centered line.
 *
 * Phase 3.1 rework:
 *   The manifesto is now a single centered line that auto-cycles between
 *   two declarations. No "demo" framing — the contrast is between the
 *   easy path and the moment it gets tested by reality.
 */

// ─── Types ────────────────────────────────────────────────────────────────
export type ManifestoSentence = {
  text: string;
  /** Word indexes (0-based) to render in signal-orange. Optional. */
  highlight?: number[];
};

// ─── The two cycling lines ────────────────────────────────────────────────
// Line 1 sets the easy path. Line 2 is the punchline — what I actually
// optimise for. Avoids "demo" entirely. Works for backend AND AI infra.
export const SENTENCES: [ManifestoSentence, ManifestoSentence] = [
  {
    text: "Anyone can ship the happy path.",
    // Words: 0=Anyone 1=can 2=ship 3=the 4=happy 5=path.
    highlight: [4, 5],
  },
  {
    text: "I build for the day it breaks.",
    // Words: 0=I 1=build 2=for 3=the 4=day 5=it 6=breaks.
    highlight: [5, 6],
  },
];

/** Milliseconds each line dwells before being replaced by the other. */
export const DWELL_MS = 3600;

/** Milliseconds for the fade between lines. */
export const FADE_MS = 700;
