/**
 * /blog — Notes index content.
 *
 * Long-form writing lives elsewhere (GitHub Pages, for now). This page is
 * just a curated index — each entry a card that links out. Adding a new
 * note = adding one object to the `notes` array.
 */

import { person } from "./person";

export type Note = {
  slug: string;
  title: string;
  /** Short preview — one line, the hook. */
  preview: string;
  /** Where the full piece lives. External URL for GitHub Pages, etc. */
  url: string;
  /** Whether the URL is external (renders ↗ instead of →). */
  external: boolean;
  /** ISO date string. Used for sort and label. */
  publishedAt: string;
  /** Reading time, written as a short string ("24 min", "5 min"). */
  readingTime: string;
  /** Quick tags — keep to 1–3 each. */
  tags: string[];
  /** Featured = larger card at top. Only one should be featured at a time. */
  featured?: boolean;
};

// ─── Page intro ────────────────────────────────────────────────────────────
export const notesHeader = {
  eyebrow: "Notes",
  title: "Long-form writing.",
  lede:
    "Pieces I've sat with long enough to argue for. Most live on GitHub Pages while the publishing setup is intentionally simple.",
} as const;

// ─── The list ──────────────────────────────────────────────────────────────
// Order = newest first. `featured` controls layout (one big card on top).
export const notes: Note[] = [
  {
    slug: "proctoring-system-architecture",
    title:
      "How we built a real-time AI proctoring system — and watched it collapse at five users.",
    preview:
      "There is a particular kind of failure that only reveals itself under real load.",
    url: person.blog.proctoringSystem,
    external: true,
    publishedAt: "2025-09-01",
    readingTime: "24 min",
    tags: ["real-time", "webrtc", "architecture"],
    featured: true,
  },
];

// ─── Footnote: more coming ────────────────────────────────────────────────
export const notesFootnote = {
  line: "More notes in draft — published when they say something I actually believe.",
} as const;
