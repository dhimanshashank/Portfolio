/**
 * About / The Story — content.
 *
 * Every body of prose below is marked DRAFT — meaning I wrote a starting
 * point based on what we know (resume, projects, voice from the manifesto).
 * Treat each one as a starting point you EDIT, not a placeholder you replace
 * wholesale. The voice gets sharper the closer it is to yours.
 *
 * Helper `isDraft()` (export at bottom) returns true while a DRAFT marker
 * is still on a string; components use it to render a quiet "draft" chip
 * during dev so it's obvious what hasn't been touched yet.
 *
 * To "approve" a piece of copy: remove the leading "DRAFT · " from the
 * string. The chip disappears, the line stays.
 */

// ─── HERO — editorial opening paragraph ──────────────────────────────────
// One large italic Fraunces paragraph. Sets register. No portrait.
export const aboutHero = {
  eyebrow: "About",
  // Single statement. Italic Fraunces, large. Read once, remember.
  paragraph:
    "DRAFT · I'm Shashank. I work on backends — the kind where the failure modes are the actual problem, and the demo doesn't tell you anything you need to know.",
  // Optional second line, smaller, sits under the main paragraph
  subline:
    "DRAFT · Currently building real-time systems at Masters' Union. Looking for what's next.",
} as const;

// ─── THREE ESSAYS — the spine of the page ────────────────────────────────
// Each: eyebrow + title + body paragraphs. 2–4 short paragraphs each.
// Keep them tight. The page is read, not skimmed.

export const aboutEssays = [
  {
    eyebrow: "01 / Origin",
    title: "Where I started.",
    paragraphs: [
      "DRAFT · I went to Guru Nanak Dev Engineering College in Ludhiana and finished my CS degree in 2025. I started writing code that touched production halfway through — a MERN event platform during an internship: Stripe webhooks, JWT, role-based access. It worked.",
      "DRAFT · It worked the way an exam answer works: complete, untested by anything weird. The weird stuff came later — when actual people showed up, and the architecture I'd written without much thought started telling me what it really thought of my assumptions.",
    ],
  },
  {
    eyebrow: "02 / What Masters' Union taught me",
    title: "Production is a different problem.",
    paragraphs: [
      "DRAFT · A year at Masters' Union, mostly on the proctoring system, taught me that the gap between \"passes the demo\" and \"survives 200 users\" is where the real engineering happens.",
      "DRAFT · The first time the server CPU pinned at 100% with five users on it, I learned an architecture decision can be wrong — not slow, wrong. The rewrite that followed — moving inference to client worker threads, switching to an SFU — was a lesson in the difference between optimization and reconsideration.",
      "DRAFT · The messaging refactor, the analytics pipeline, the event classifier — all variants of the same lesson. Most of my year was spent there. Most of what I now believe about systems came from there.",
    ],
  },
  {
    eyebrow: "03 / What I'm chasing next",
    title: "Distributed systems. LLMs as infrastructure.",
    paragraphs: [
      "DRAFT · Right now I'm pulling apart how people build at the edge of what's possible — the papers, the post-mortems, the boring parts that don't make it into talks.",
      "DRAFT · The thing I find most interesting in 2026 is LLMs as infrastructure problems. Not the chat UI. The queueing, the rate limits, the failure modes when inference takes eight seconds and the user is still typing. I want to work on the systems that hold that up.",
      "DRAFT · If you're building there, I'd like to hear about it.",
    ],
  },
] as const;

// ─── DESK IMAGE BAND — overlaid voice line ───────────────────────────────
// Sits between Origin and MU sections. Single quiet line over the image.
export const aboutImageBand = {
  src: "/about/desk-night.png",
  alt: "Desk at night — keyboard, notebook with system sketches, monitor with code",
  // Short quote rendered as italic Fraunces overlay. Optional — set to null to omit.
  overlay: "DRAFT · The work has always happened at this desk, mostly at night.",
} as const;

// ─── SIDEBAR FACTS — quiet, not featured ─────────────────────────────────
// Skills as a small categorized list. Education as a single line. Contact
// links route through person.ts (already centralized).
export const aboutFacts = {
  // Skills grouped — terse. Not a "showcase grid," just facts.
  skills: [
    { group: "Backend", items: ["Node.js", "Express", "REST", "Microservices"] },
    { group: "Real-time", items: ["WebRTC (Mediasoup)", "Socket.IO", "Redis Pub/Sub"] },
    { group: "Data", items: ["PostgreSQL", "ClickHouse", "Redis", "MongoDB"] },
    { group: "Cloud", items: ["AWS Lambda", "SQS", "S3", "Docker"] },
    { group: "Languages", items: ["TypeScript", "JavaScript", "SQL"] },
    { group: "Frontend (when needed)", items: ["React", "Next.js", "Tailwind"] },
  ],
  education: {
    degree: "B.Tech, Computer Science & Engineering",
    school: "Guru Nanak Dev Engineering College, Ludhiana",
    years: "Aug 2021 – Jun 2025",
    note: "CGPA 8.45",
  },
} as const;

// ─── OUTRO ───────────────────────────────────────────────────────────────
export const aboutOutro = {
  eyebrow: "Working on something real-time?",
  // Editorial closing line + two CTAs (work + contact)
  line: "DRAFT · The interesting stuff lives at the edges. If you're building there, let's talk.",
  primary: { label: "Get in touch", href: "/contact" },
  secondary: { label: "Selected work", href: "/work" },
} as const;

// ─── DRAFT helper ────────────────────────────────────────────────────────
const DRAFT_PREFIX = "DRAFT · ";
export function isDraft(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.trim().startsWith(DRAFT_PREFIX);
}
/** Strip the DRAFT marker for display while still detecting it via isDraft. */
export function stripDraft(value: string): string {
  return value.replace(DRAFT_PREFIX, "");
}
