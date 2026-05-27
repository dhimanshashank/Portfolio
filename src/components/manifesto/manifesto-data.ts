/**
 * Manifesto Scroll — content & sequencing constants.
 *
 * Phase 2 rework: this no longer cycles four Masters'-Union percentages.
 * It tells a breadth story — "one year, four domains, real scale" — and
 * routes the visitor into the Selected Work page (not directly into a
 * single case study).
 *
 * Editable copy lives here; component code never hardcodes text.
 */

// ─── Types ────────────────────────────────────────────────────────────────
export type ManifestoSentence = {
  text: string;
  /** Word indexes (0-based) to render in signal-orange. Optional. */
  highlight?: number[];
};

export type Moment = {
  eyebrow?: string;
  value: string;
  label: string;
};

// ─── The two opening sentences ────────────────────────────────────────────
// Sentence 2 puts the emotional weight on "they're actually used." That's the
// pivot — most demos work in a controlled room; production is what happens
// when actual humans show up.
export const SENTENCES: [ManifestoSentence, ManifestoSentence] = [
  { text: "Most backends pass the demo." },
  {
    text: "Few survive the day they're actually used.",
    // Words: 0=Few 1=survive 2=the 3=day 4=they're 5=actually 6=used.
    highlight: [4, 5, 6],
  },
];

// ─── The centerpiece stat (single big moment after sentence 2) ────────────
// Not a percentage. Not a number-as-trophy. Just the breadth claim made
// concrete: one year, four production systems.
export const CENTERPIECE: Moment = {
  eyebrow: "shipped",
  value: "1 year",
  label: "across four production systems",
};

// ─── Domain cycle (three quick reveals after the centerpiece) ─────────────
// Each is a flash — "here's what kind of systems." The labels are tech-stack
// breadcrumbs so a technical reader knows immediately what scope it covers.
export const DOMAINS_CYCLE: Moment[] = [
  {
    eyebrow: "domain · 01",
    value: "WebRTC",
    label: "real-time video at exam scale",
  },
  {
    eyebrow: "domain · 02",
    value: "Real-time chat",
    label: "sockets · redis · cursor pagination",
  },
  {
    eyebrow: "domain · 03",
    value: "Event analytics",
    label: "lambda · clickhouse · regex pipelines",
  },
];

// ─── The 2×2 settled grid (closing state) ─────────────────────────────────
// Four domains, equal weight. Adds the Payments + Auth domain (from Eventify)
// so the grid feels like a complete map of what's been built, not just the MU work.
export const DOMAINS_GRID: Moment[] = [
  {
    eyebrow: "01",
    value: "WebRTC",
    label: "real-time video at exam scale",
  },
  {
    eyebrow: "02",
    value: "Real-time chat",
    label: "sockets · redis · cursor pagination",
  },
  {
    eyebrow: "03",
    value: "Event analytics",
    label: "lambda · clickhouse · regex pipelines",
  },
  {
    eyebrow: "04",
    value: "Payments + Auth",
    label: "stripe · jwt · rbac middleware",
  },
];

// ─── Closing CTA ──────────────────────────────────────────────────────────
// Routes to the Work index (the showcase), NOT directly to proctoring.
// The portfolio's spine is range; the deep dive lives one click further in.
export const CTA = {
  preLabel: "Range over depth. Both are here.",
  link: "/work",
  linkText: "Selected work",
};

// ─── Timeline ranges (0..1 along the pinned scroll) ───────────────────────
// Each entry: [enter-start, enter-end, exit-start, exit-end]
// Sentences each own ~22% of the timeline (room to read).
// Centerpiece owns ~16% (the solo moment).
// Each domain cycle gets ~8% (a glimpse).
// Grid + CTA own the final ~20% (the closing breath).
export const RANGES = {
  sentence1:  [0.00, 0.08, 0.17, 0.22] as const,
  sentence2:  [0.20, 0.28, 0.36, 0.42] as const,
  centerpiece:[0.40, 0.46, 0.54, 0.58] as const,
  domain1:    [0.57, 0.62, 0.65, 0.68] as const,
  domain2:    [0.67, 0.72, 0.75, 0.78] as const,
  domain3:    [0.77, 0.82, 0.83, 0.84] as const,
  grid:       [0.84, 0.92, 1.00, 1.00] as const,
  cta:        [0.90, 0.97, 1.00, 1.00] as const,
} as const;

/** Total scroll distance the pin holds, in viewport heights. */
export const PIN_VH = 5;
