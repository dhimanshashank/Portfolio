/**
 * /now — content scaffold.
 *
 * Inspired by the /now movement (nownownow.com): a page that says, in plain
 * terms, what someone is actively working on RIGHT NOW. Updated quarterly.
 * Signals forward momentum — what's on the mind, not the résumé.
 *
 * Same DRAFT convention as about-content.ts: anything beginning "DRAFT · "
 * renders with a visible chip in the UI. Strip the prefix when you've made
 * a line your own.
 */

export type NowBlock = {
  eyebrow: string;
  /** Heading: the activity itself, short. */
  title: string;
  /** 1–3 short items, each one a sentence. */
  items: string[];
};

// ─── Page intro ────────────────────────────────────────────────────────────
export const nowHeader = {
  eyebrow: "Now",
  // Visible "last updated" — the page is more credible with a date attached.
  // Update this string whenever you change anything below.
  updatedAt: "DRAFT · May 2026",
  title: "What I'm on, right now.",
  lede:
    "DRAFT · A live page. Reads more like a notebook than a portfolio. Updated when the answer to “what are you working on” actually changes.",
} as const;

// ─── Three blocks ──────────────────────────────────────────────────────────
export const nowBlocks: NowBlock[] = [
  {
    eyebrow: "01 / Reading",
    title: "Distributed systems, slowly.",
    items: [
      "DRAFT · Working through Designing Data-Intensive Applications — Kleppmann. The chapter on replication is the one I keep coming back to.",
      "DRAFT · Skimming recent LLM-serving papers when they cross my feed — interested in the queuing and batching side, less the model architecture side.",
    ],
  },
  {
    eyebrow: "02 / Building",
    title: "Small experiments around inference.",
    items: [
      "DRAFT · A toy RAG harness over my own blog content. Mostly an excuse to think about chunking and vector recall at small scale.",
      "DRAFT · Sharpening LeetCode mediums in the background — system-design interviews are where the next conversation lives.",
    ],
  },
  {
    eyebrow: "03 / Curious about",
    title: "Open questions on my desk.",
    items: [
      "DRAFT · How do LLM inference systems handle backpressure when the queue saturates and the user is still typing?",
      "DRAFT · At what concurrency does client-side inference stop being cheaper than centralised? The proctoring rebuild answered it for one workload — is there a general shape?",
    ],
  },
];

// ─── Outro / where to find me ─────────────────────────────────────────────
export const nowOutro = {
  line:
    "DRAFT · If you're working on something in this space, I'd like to hear about it.",
  primary: { label: "Get in touch", href: "/contact" },
  secondary: { label: "Selected work", href: "/work" },
} as const;

// ─── DRAFT helpers (shared shape with about-content) ──────────────────────
export function isNowDraft(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^DRAFT\s·\s/.test(value.trim());
}

export function stripNowDraft(value: string): string {
  return value.replace(/^DRAFT\s·\s/, "");
}
