/**
 * Engineering Log — problem entries.
 *
 * Each entry is one production investigation: the clue that surfaced it,
 * the root cause, and the fix. This data feeds the <EngineeringLog> section
 * on the home page.
 *
 * Adding a new problem = appending one object here. No component changes
 * needed — though the home-page section currently only renders the first
 * entry by design (a single, prominent card).
 *
 * Convention:
 *   - `clue`            multi-line terminal output or evidence snippet (\n separated)
 *   - `clueHighlight`   0-indexed line number to accent in signal orange — the
 *                       "smoking gun" line that made the root cause obvious
 *   - `severity`        P1 = production broken for users, P2 = degraded / data
 *                       wrong, P3 = correctness issue caught before users saw it
 */

export type ProblemSeverity = "P1" | "P2" | "P3";

export type EngineeringProblem = {
  id: string;
  severity: ProblemSeverity;
  date: string;             // ISO "YYYY-MM-DD"
  tags: string[];           // lowercase stack labels
  title: string;            // one punchy line — the hook a recruiter reads first
  hook: string;             // 1–2 sentence expansion: what was broken, who noticed
  clue: string;             // the actual evidence — terminal output, a metric, a trace
  clueHighlight?: number;   // 0-indexed line inside `clue` to render in signal orange
  rootCause: string;        // short, specific explanation of why it happened
  fix: string;              // what was done — concrete, no vague "refactored X"
};

export const problems: EngineeringProblem[] = [
  {
    id: "s3-multipart-orphan",
    severity: "P2",
    date: "2026-05-10",
    tags: ["aws s3", "mediarecorder", "node"],
    title: "Hard reload. Recording gone forever.",
    hook:
      "Proctoring video streamed directly into a single S3 multipart upload. Submit called CompleteMultipartUpload. Any browser crash or hard reload before submit left every uploaded part permanently orphaned — no assembled object, no recovery path.",
    clue:
      "$ aws s3api list-multipart-uploads --bucket proctoring-prod\n  UploadId : a3f9...c2d1   State : in-progress\n  Parts    : 14 uploaded\n  Object   : <does not exist — 404>",
    clueHighlight: 3,
    rootCause:
      "A multipart upload only becomes a readable S3 object after CompleteMultipartUpload fires. Until then the parts exist in S3 storage but produce a 404 on any GET. One missed event = permanent data loss with no server-side recovery hook.",
    fix:
      "Replaced the continuous stream with independent 30-second segments, each uploaded as a standalone PutObject — a complete, immediately readable file the moment it lands. A BullMQ job runs 10 minutes after quiz end time and merges whatever segments arrived, so even a full browser crash leaves an admin-viewable recording.",
  },
];
