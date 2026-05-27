/**
 * Selected Work — project metadata.
 *
 * Each project gets one of three visual identities:
 *   - "architecture" : hand-built SVG topology
 *   - "code"         : editor-style code-snippet
 *   - "big-number"   : massive Fraunces metric (reserved; not used yet)
 *
 * The list intentionally mixes employer work (MU systems) with personal
 * work (Eventify). The portfolio is about range, not one job.
 *
 * `slug` matches the route under /work/<slug>. Only projects with a
 * shipped deep-dive page have `caseStudy: true`; the others show a small
 * "case study coming soon" affordance instead of routing to 404.
 */

export type WorkVisualKind = "architecture" | "code" | "big-number";

export type WorkMetric = {
  value: string;
  label: string;
};

export type WorkProject = {
  id: string;
  slug: string;
  num: string;                   // "01", "02" … as eyebrow
  title: string;                 // Card title
  tagline: string;               // One-liner subtitle
  blurb: string;                 // 2–3 sentence body
  stack: string[];               // Stack chips, lowercase
  metrics: WorkMetric[];         // 1–3 max — restraint
  visualKind: WorkVisualKind;
  /** Whether the deep-dive page is shipped. False = "coming soon" treatment. */
  caseStudy: boolean;
  /** Where it lived in production — kept honest. Empty for personal work. */
  context?: string;
  /** Card variant in the grid — only one "featured" allowed. */
  variant: "featured" | "regular";
};

export const projects: WorkProject[] = [
  {
    id: "proctoring",
    slug: "proctoring-system",
    num: "01",
    title: "AI Proctoring Platform",
    tagline: "WebRTC at exam scale",
    blurb:
      "An SFU-based proctoring platform routing 200+ concurrent student streams without decoding a single frame on the server. Behavioral classification (eye-gaze, tab-switch, multi-signal correlation) runs in client worker threads. Sub-200ms alert delivery to admin dashboards.",
    stack: ["webrtc", "mediasoup", "mediapipe", "node", "postgres", "redis", "socket.io"],
    metrics: [
      { value: "200+", label: "concurrent streams" },
      { value: "<200ms", label: "alert latency" },
      { value: "−50%", label: "query time, peak load" },
    ],
    visualKind: "architecture",
    caseStudy: true,
    context: "Masters' Union · production",
    variant: "featured",
  },
  {
    id: "messaging",
    slug: "messaging-system",
    num: "02",
    title: "Real-Time Messaging",
    tagline: "Sub-second chat at scale",
    blurb:
      "End-to-end messaging — DMs, group channels, presence, read receipts. Keyset cursor pagination replaced an O(n) offset scan with an O(log n) index seek. A Redis cache layer covers the hot path so PostgreSQL barely sees it.",
    stack: ["node", "socket.io", "redis", "postgres"],
    metrics: [
      { value: "−70%", label: "API latency" },
      { value: "−60%", label: "DB round-trips" },
    ],
    visualKind: "code",
    caseStudy: false,
    context: "Masters' Union · production",
    variant: "regular",
  },
  {
    id: "analytics",
    slug: "analytics-pipeline",
    num: "03",
    title: "Event Analytics Pipeline",
    tagline: "Serverless ingest, columnar query",
    blurb:
      "Event-driven analytics: thousands of LMS events per day flow through Lambda into ClickHouse with YYYYMM partitioning and composite sort keys. A regex classifier maps raw events into nine categories, configurable without redeploy.",
    stack: ["aws lambda", "sqs", "clickhouse", "node"],
    metrics: [
      { value: "−55%", label: "query time" },
      { value: "9+", label: "event categories" },
    ],
    visualKind: "architecture",
    caseStudy: false,
    context: "Masters' Union · production",
    variant: "regular",
  },
  {
    id: "eventify",
    slug: "eventify",
    num: "04",
    title: "Eventify",
    tagline: "MERN · payments · auth",
    blurb:
      "Full-stack event platform with Stripe payments, JWT auth, and role-based access control. Order state lives in the webhook handler — never trusted to the client confirmation — so a closed browser doesn't lose a paid order.",
    stack: ["react", "node", "mongo", "stripe", "jwt"],
    metrics: [
      { value: "0", label: "lost payments" },
      { value: "3", label: "user roles, scoped" },
    ],
    visualKind: "code",
    caseStudy: false,
    context: "Qspider · internship",
    variant: "regular",
  },
];

export const featured = projects.find((p) => p.variant === "featured")!;
export const regular = projects.filter((p) => p.variant === "regular");
