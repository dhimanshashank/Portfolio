/**
 * AI Systems — home page plate content.
 *
 * The resume's strongest 2026 signal: LLMs treated as infrastructure, not
 * chat UI. Three rows, each one production fact from the proctoring
 * platform. Numbers come straight from the resume — don't inflate.
 */

export const aiHeader = {
  eyebrow: "AI · LLM infrastructure",
  title: "LLMs as infrastructure.",
  lede:
    "Not the chat UI — the plumbing. Model calls treated like any other unreliable network dependency: routed, rate-limited, retried, and budgeted.",
} as const;

export type AiRow = {
  num: string;
  title: string;
  body: string;
  /** Mono tag row — lowercase, like stack chips elsewhere. */
  tags: string;
};

export const aiRows: AiRow[] = [
  {
    num: "01",
    title: "OpenRouter as a routing layer",
    body:
      "Third-party LLM APIs integrated as infrastructure across internal services — provider routing, fallback models, and rate-limit handling live in one place instead of scattered fetch calls.",
    tags: "openrouter · llm api · node",
  },
  {
    num: "02",
    title: "AI session summaries from raw events",
    body:
      "Post-session proctoring reports generated from structured event streams — gaze shifts, tab switches, alert timestamps — so a reviewer reads one summary instead of replaying an hour of footage.",
    tags: "prompt over events · postgres · openrouter",
  },
  {
    num: "03",
    title: "Behavioral classification at the edge",
    body:
      "MediaPipe eye-gaze and tab-switch inference runs in client worker threads, with multi-signal correlation preventing false escalations. Moving the models off the server bought +35% proctoring throughput.",
    tags: "mediapipe · web workers · +35% throughput",
  },
];
