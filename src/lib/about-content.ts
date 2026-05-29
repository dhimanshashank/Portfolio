/**
 * About / The Story — content.
 *
 * Phase 3.5 — copy finalized. The DRAFT markers are gone; what's here is
 * what ships. The `isDraft()` / `stripDraft()` helpers are kept exported
 * because nothing downstream needs to change to use them — and so future
 * sections can use the same dev-time draft chip pattern if needed.
 */

// ─── HERO — editorial opening paragraph ──────────────────────────────────
// One large italic Fraunces paragraph. Sets register. No portrait.
export const aboutHero = {
  eyebrow: "About",
  paragraph:
    "I'm Shashank. I work on backends — the kind where the failure modes are the actual problem, and the diagram doesn't tell you anything until the second user shows up.",
  subline:
    "One year shipped, four production systems. Currently at Masters' Union; open to what's next.",
} as const;

// ─── THREE ESSAYS — the spine of the page ────────────────────────────────
export const aboutEssays = [
  {
    eyebrow: "01 / Origin",
    title: "Where I started.",
    paragraphs: [
      "I went to Guru Nanak Dev Engineering College in Ludhiana and finished my CS degree in 2025. The first code I shipped to production was during a 2024 internship at Qspider — a MERN event platform with Stripe webhooks, JWT, and role-based access. It worked.",
      "It worked the way an exam answer works: complete, untested by anything weird. The weird stuff arrived later — when real users showed up, and the architecture I'd written without much thought started telling me what it really thought of my assumptions.",
    ],
  },
  {
    eyebrow: "02 / What Masters' Union taught me",
    title: "Production is a different problem.",
    paragraphs: [
      "A year at Masters' Union, mostly on the proctoring system, taught me that the gap between passes the demo and survives 200 concurrent users is where the engineering actually lives. The rest is choreography.",
      "The first time the server CPU pinned at 100% with five users on it, I learned that an architecture decision can be wrong — not slow, wrong. The rewrite that followed (client-worker inference, SFU routing) was a lesson in the difference between optimisation and reconsideration.",
      "The messaging refactor, the analytics pipeline, the event classifier — all variants of the same lesson. Most of my year was spent there. Most of what I now believe about systems came from there.",
    ],
  },
  {
    eyebrow: "03 / What I'm chasing next",
    title: "Distributed systems. LLMs as infrastructure.",
    paragraphs: [
      "Right now I'm pulling apart how people build at the edge of what's possible — the papers, the post-mortems, the boring parts that don't make it into talks.",
      "The thing I find most interesting in 2026 is LLMs as infrastructure problems. Not the chat UI. The queueing, the rate limits, the failure modes when inference takes eight seconds and the user is still typing. I want to work on the systems that hold that up.",
      "If you're building there, I'd like to hear about it.",
    ],
  },
] as const;

// ─── DESK IMAGE BAND — overlaid voice line ───────────────────────────────
export const aboutImageBand = {
  src: "/about/desk-night.png",
  alt: "Desk at night — keyboard, notebook with system sketches, monitor with code",
  overlay: "The work has always happened at this desk. Mostly at night.",
} as const;

// ─── MASTERS' UNION BLOCK — one-line company explainer ──────────────────
// Used by <MastersUnionBlock /> between essays 02 and 03.
export const mastersUnion = {
  name: "Masters' Union",
  logo: "/brands/masters-union.png",
  url: "https://mastersunion.org",
  description:
    "Edtech in India running an MBA-equivalent program. I built and shipped the proctoring, messaging, and analytics systems that hold the operations together.",
  role: "Associate Software Developer",
  period: "Jan 2025 — present",
} as const;

// ─── SIDEBAR FACTS — quiet, not featured ─────────────────────────────────
// Skills as a small categorized list. Education as a single line. Contact
// links route through person.ts (already centralized).
export const aboutFacts = {
  skills: [
    { group: "Backend", items: ["Node.js", "Express", "REST", "Microservices"] },
    { group: "Real-time", items: ["WebRTC (Mediasoup)", "Socket.IO", "Redis Pub/Sub"] },
    { group: "Data", items: ["PostgreSQL", "ClickHouse", "Redis", "MongoDB"] },
    { group: "Cloud", items: ["AWS Lambda", "SQS", "S3", "Docker"] },
    { group: "Languages", items: ["TypeScript", "JavaScript", "SQL"] },
    { group: "Frontend", items: ["React", "Next.js", "Tailwind"] },
  ],
  education: {
    degree: "B.Tech, Computer Science & Engineering",
    school: "Guru Nanak Dev Engineering College, Ludhiana",
    years: "Aug 2021 – Jun 2025",
    note: "CGPA 8.45",
  },
} as const;

// ─── TESTIMONIALS — render only if non-empty ────────────────────────────
// Add 1–2 short quotes from manager / peer when collected. Until then the
// <Testimonials /> component renders nothing — clean absence beats empty
// placeholder.
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  org: string;
};
export const testimonials: Testimonial[] = [];

// ─── OUTRO ───────────────────────────────────────────────────────────────
export const aboutOutro = {
  eyebrow: "Working on something real-time?",
  line:
    "The interesting stuff lives at the edges. If you're building there — backend, real-time, or AI infra — let's talk.",
  primary: { label: "Get in touch", href: "/contact" },
  secondary: { label: "Selected work", href: "/work" },
  // Tertiary — recruiter exit ramp. Filename preserved so the download
  // lands in their folder as `Shashank_Resume.pdf`.
  tertiary: { label: "Download CV", href: "/Shashank_Resume.pdf" },
} as const;

// ─── DRAFT helper ────────────────────────────────────────────────────────
// Retained for future use — currently no string carries the marker.
const DRAFT_PREFIX = "DRAFT · ";
export function isDraft(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.trim().startsWith(DRAFT_PREFIX);
}
/** Strip the DRAFT marker for display while still detecting it via isDraft. */
export function stripDraft(value: string): string {
  return value.replace(DRAFT_PREFIX, "");
}
