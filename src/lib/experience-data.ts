/**
 * Experience — homepage timeline data.
 *
 * Sourced from the same facts as the /about page (about-content.ts) so the two
 * never drift. Kept deliberately short: current role first, one prior role,
 * education as a quiet footer. Recruiters skim — this is the "where has he
 * actually shipped" answer in five seconds, replacing the near-empty manifesto.
 */

export type ExperienceEntry = {
  org: string;
  role: string;
  period: string;
  /** Marks the current role — gets the live dot + "now" treatment. */
  current?: boolean;
  summary: string;
  tags: string[];
  href?: string;
};

export const experience: ExperienceEntry[] = [
  {
    org: "Masters' Union",
    role: "Associate Software Developer · EdTech",
    period: "Jan 2025 — Present",
    current: true,
    summary:
      "Own the real-time backbone of the learning platform (LMS) at an MBA-equivalent EdTech institution — AI proctoring at exam scale (WebRTC/SFU, 200+ concurrent streams), a unified messaging layer, and an event-analytics pipeline. Shipped to production, serving live student cohorts.",
    tags: ["EdTech", "LMS", "WebRTC", "Real-time", "LLM infra"],
    href: "https://mastersunion.org",
  },
  {
    org: "Qspider",
    role: "Software Development Intern",
    period: "2024",
    summary:
      "Shipped Eventify — a MERN event platform with Stripe webhook-driven orders, JWT auth, and role-scoped access.",
    tags: ["MERN", "Stripe", "JWT"],
  },
];

export const educationLine = {
  degree: "B.Tech, Computer Science & Engineering",
  school: "Guru Nanak Dev Engineering College, Ludhiana",
  years: "2021 — 2025",
  note: "CGPA 8.45",
};

/* ─── Recognition ─────────────────────────────────────────────────────── */

export type RecognitionAsset = {
  src: string;
  alt: string;
  /** Intrinsic size — the lightbox renders these uncropped, so next/image
   *  needs real dimensions to reserve the right box. */
  width: number;
  height: number;
  /** object-position for the cropped card frame. The lightbox never crops. */
  focus: string;
  /** Caption shown under the image in the lightbox. */
  caption: string;
};

/**
 * The Masters' Union × TETR appreciation award, August 2026.
 *
 * ASSET URLS — the photo object is literally named `director's_award.jpg` in
 * the bucket, so the apostrophe has to stay percent-encoded (%27) at every
 * reference. Renaming the object to `directors-award.jpg` removes the
 * footgun; until that happens, don't "tidy up" the %27 — it will 404.
 *
 * COPY — the certificate is signed by Pratham Mittal, *Founder* of Masters'
 * Union & TETR, and the printed category is "Execution Expert". The wording
 * here is matched to the paper on purpose: a recruiter who zooms in on the
 * image is exactly the reader this block exists for, and "Director's Award"
 * would not match what they read.
 */
export const recognition = {
  award: "Execution Expert",
  kind: "Certificate of Appreciation",
  org: "Masters' Union & TETR",
  issued: "August 2026",
  issuedShort: "Aug 2026",
  signedBy: "Pratham Mittal",
  signedByTitle: "Founder, Masters' Union & TETR",
  /** Deliberately generic. An itemised readout of the slide in the photo
   *  made the block about the ceremony; the number below is what the award
   *  was actually for, so the prose sets it up and then gets out of the way. */
  note:
    "Given for execution across a year of platform work — building the systems the institution runs on, and replacing bought-in infrastructure with our own.",
  /** The one number worth putting in display type. Proctoring was the
   *  clearest case: built in-house instead of licensed per-session. */
  impact: {
    value: "≈ ₹1 lakh",
    unit: "saved per 100 exam sessions",
    detail:
      "Custom proctoring, built in-house — no third-party invigilation licence per session.",
  },
  assets: [
    {
      src: "https://assets.shashankdhiman.in/director%27s_award.jpg",
      alt: "Shashank Dhiman receiving the Execution Expert award at Masters' Union",
      width: 1280,
      height: 853,
      // Subjects sit centre-right; the left third is projector screen.
      focus: "55% 38%",
      caption: "Receiving the award — Masters' Union, August 2026",
    },
    {
      src: "https://assets.shashankdhiman.in/mu_certificate.jpeg",
      alt:
        "Certificate of Appreciation awarded to Shashank for excellence in the Execution Expert category, signed by Pratham Mittal, Founder of Masters' Union and TETR",
      width: 1280,
      height: 927,
      focus: "50% 50%",
      caption:
        "Certificate of Appreciation — \u201cExecution Expert\u201d category, signed by Pratham Mittal, Founder",
    },
  ] satisfies RecognitionAsset[],
};
