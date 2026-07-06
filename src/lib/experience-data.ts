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
    org: "Venture Pact · Masters' Union",
    role: "Associate Software Developer",
    period: "Jan 2025 — Present",
    current: true,
    summary:
      "Built and shipped the proctoring, real-time messaging, and event-analytics systems that hold the platform's operations together.",
    tags: ["WebRTC", "Socket.IO", "AWS", "LLM infra"],
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
