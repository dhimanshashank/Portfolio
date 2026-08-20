/**
 * Skills — the single source for every surface that lists them.
 *
 * Three consumers, two shapes:
 *
 *   HOME_SKILL_GROUPS  → the drawn monitor in <Workbench> (desktop/tablet).
 *                        A curated preview: 5 groups × 3 items, using each
 *                        item's `short` name where it has one. The drawn
 *                        screen is budgeted at SCREEN_COLS = 58 characters
 *                        and the scroll-typing track is sized from the total
 *                        character count, so this list is deliberately kept
 *                        under that budget — see the note below.
 *
 *   SKILL_GROUPS       → <SkillsMobile> (phones, no column constraint) and
 *                        the /about sidebar. The complete list, resume
 *                        wording, nothing trimmed.
 *
 * Labels are lowercase because the desktop terminal prints them verbatim in
 * shell style; the mobile terminal and the /about sidebar both uppercase
 * them in CSS, so one field serves all three.
 *
 * Item names match Shashank_Resume.pdf exactly — these are the strings a
 * recruiter or an ATS keyword-matches against, so they are not paraphrased.
 * Where a resume name is too wide for the 58-column monitor, `short` carries
 * a terminal-safe form and the full name still renders everywhere else.
 *
 * Ordering is portfolio logic, not resume logic: the differentiators
 * (real-time, backend) lead, and languages sit further down. A resume opens
 * with Languages for ATS reasons; a portfolio should open with what makes
 * the person worth reading about.
 */

export type Skill = {
  /** Resume wording. Rendered in full on mobile and /about. */
  name: string;
  /** Terminal-safe short form for the 58-column drawn monitor. */
  short?: string;
  /** Include in the curated desktop-monitor preview. */
  home?: boolean;
};

export type SkillGroup = {
  /** Lowercase; uppercased by CSS on the surfaces that want caps. */
  label: string;
  items: Skill[];
};

export const SKILL_PROMPT = "$ skills --list";

export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: "real-time",
    items: [
      { name: "Mediasoup SFU", home: true },
      { name: "WebRTC", home: true },
      { name: "Redis Pub/Sub", home: true },
      { name: "MediaPipe" },
      { name: "Event-Driven Architecture" },
    ],
  },
  {
    label: "back-end",
    items: [
      { name: "Node.js", home: true },
      { name: "Socket.IO", home: true },
      { name: "REST API Design", home: true },
      { name: "Express.js" },
      { name: "Microservices" },
      { name: "Serverless (AWS Lambda)" },
    ],
  },
  {
    label: "databases",
    items: [
      { name: "PostgreSQL", home: true },
      { name: "Redis", home: true },
      { name: "ClickHouse", home: true },
      { name: "MongoDB" },
      { name: "DynamoDB" },
    ],
  },
  {
    label: "devops & ai/llm",
    items: [
      { name: "AWS (Lambda, SQS, S3, DynamoDB)", short: "AWS Lambda", home: true },
      { name: "OpenRouter API", home: true },
      { name: "Docker", home: true },
      { name: "LLM API Integration" },
      { name: "CI/CD" },
      { name: "Git" },
    ],
  },
  {
    label: "languages",
    items: [
      { name: "TypeScript", home: true },
      { name: "JavaScript (ES6+)", short: "JavaScript", home: true },
      { name: "Python", home: true },
      { name: "Java" },
      { name: "SQL" },
    ],
  },
  {
    label: "front-end",
    items: [
      { name: "React.js" },
      { name: "Next.js" },
      { name: "Redux Toolkit" },
      { name: "Tailwind CSS" },
    ],
  },
];

/** Terminal-safe display string for one item. */
export const skillLabel = (s: Skill) => s.short ?? s.name;

/**
 * The desktop monitor's curated preview — only groups with flagged items,
 * only those items, short names applied.
 */
export const HOME_SKILL_GROUPS: { label: string; items: string[] }[] =
  SKILL_GROUPS.map((g) => ({
    label: g.label,
    items: g.items.filter((s) => s.home).map(skillLabel),
  })).filter((g) => g.items.length > 0);
