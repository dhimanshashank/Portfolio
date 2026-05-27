/**
 * Proctoring System — Case Study Content
 *
 * Editorial intent: this page is a TEASER, not a duplicate of the blog.
 * A few quotable anchors, the architecture diagram, the collapse moment,
 * the numbers, three lesson titles — then a strong push to the full piece
 * on GitHub Pages where the long-form lives.
 *
 * Source blog: https://dhimanshashank.github.io/proctoring-system-architecture/
 */

import { person } from "./person";

// ─── HERO ─────────────────────────────────────────────────────────────────
export const caseHero = {
  eyebrow: "Case study · 01",
  context: "Masters' Union · Production",
  title: "The system that survives 200 concurrent students.",
  subtitle:
    "One year. Three architectures. A few near-collapses on the way to one that holds.",
} as const;

// ─── NARRATIVE OPENING ────────────────────────────────────────────────────
// Two short paragraphs. The first is the iconic line from the blog opening
// (the "particular kind of failure" hook). The second is a tight bridge
// that hands off to the architecture section.
export const caseNarrative = {
  paragraphs: [
    "There is a particular kind of failure that only reveals itself under real load.",
    "The architecture looked clean on a whiteboard. The tests passed. The demo went smoothly. Then five students joined an exam at once — and the CPU pinned at one hundred percent, and stayed.",
  ],
} as const;

// ─── ARCHITECTURE SECTION ─────────────────────────────────────────────────
// The diagram from /work card, enlarged. Annotations are tight one-liners —
// just enough to orient a technical reader; the full breakdown lives on the blog.
export const caseArchitecture = {
  sectionEyebrow: "How it routes",
  sectionTitle: "An SFU, not a transcoder.",
  annotations: [
    {
      anchor: "students",
      label: "Clients",
      note: "Each student's browser produces a WebRTC track and runs its own behavioral inference locally. The server never sees raw frames it has to analyze.",
    },
    {
      anchor: "sfu",
      label: "SFU router",
      note: "Mediasoup forwards encoded RTP, never decodes it. Per-stream cost stays roughly flat as concurrency grows — O(1) on the hot path.",
    },
    {
      anchor: "ai",
      label: "Browser inference",
      note: "MediaPipe Tasks (WASM) runs in a student-side worker thread. Suspicion scoring stays under the 2–3 second budget for live alerts.",
    },
    {
      anchor: "redis",
      label: "Server role",
      note: "Validates evidence frames, deduplicates events, fans out scores to admin dashboards over Socket.IO. The server is a referee, not an inference worker.",
    },
  ],
} as const;

// ─── COLLAPSE MOMENT ──────────────────────────────────────────────────────
// The cinematic centerpiece. Counter climbs 1→5, CPU gauge climbs 5→100%,
// the headline lands. Kept tight; the long version lives in the blog.
export const caseCollapse = {
  buildup: "Then five students joined an exam at the same time.",
  headline: "Five users. That was the cliff.",
  cooldown:
    "Not slow. Wrong. The fix wasn't optimization — it was moving inference off the server entirely.",
} as const;

// ─── CODE REVEALS ─────────────────────────────────────────────────────────
// Two snippets, contrasting before and after. The Python hot loop shows the
// bottleneck; the React external store shows the eventual fix on the
// frontend dashboard. Each ~7 lines. Comments preserve voice from the blog.
export const caseCode = [
  {
    filename: "frame_loop.py",
    language: "python",
    context:
      "Why it broke: each analyzed frame blocks the event loop for 50–140ms. At five concurrent streams there isn't enough wall-clock left in a second to do the work.",
    code: `# get_comprehensive_analysis() is BLOCKING — 50–140ms per frame.
# At 5 concurrent streams, the event loop runs out of time.

while not stop_token.is_set():
    frame = await track.recv()
    bgr = _video_frame_to_bgr(frame)

    analysis = await asyncio.to_thread(
        engine.get_comprehensive_analysis, bgr
    )`,
  },
  {
    filename: "scoreStore.ts",
    language: "typescript",
    context:
      "How the admin dashboard survived 80 score updates per second: scores live outside React state. Only the one tile subscribed to a given student re-renders.",
    code: `// External store — writes do not trigger React re-renders.
const useStudentScore = (studentId: string) => {
  const subscribe = useCallback(
    (cb) => scoreStore.subscribeForId(studentId, cb),
    [studentId],
  );
  const getSnapshot = () => scoreStore.getScoreForId(studentId);

  // Only re-renders when THIS student's score changes.
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};`,
  },
] as const;

// ─── BEFORE / AFTER METRICS ───────────────────────────────────────────────
// Real numbers from the blog. Three pairs, chosen to show three different
// axes: scaling, latency, render cost. Don't round or inflate.
export const caseBeforeAfter = {
  sectionEyebrow: "What changed",
  sectionTitle: "Then this. Now this.",
  before: [
    {
      label: "Max concurrent users",
      value: "5",
      sub: "server CPU pinned at 100%",
    },
    {
      label: "End-to-end score latency",
      value: "820ms",
      sub: "naive server-side path",
    },
    {
      label: "Re-renders per score update",
      value: "200",
      sub: "every tile in the grid",
    },
  ],
  after: [
    {
      label: "Concurrent users supported",
      value: "200+",
      sub: "server CPU roughly flat",
    },
    {
      label: "End-to-end score latency",
      value: "110ms",
      sub: "87% reduction",
    },
    {
      label: "Re-renders per score update",
      value: "1",
      sub: "subscribed tile only",
    },
  ],
} as const;

// ─── LESSONS ──────────────────────────────────────────────────────────────
// Editorial restraint: show three lesson titles from the blog (out of six),
// with short summaries written in the same register. The full set lives on
// the blog — the link below the section drives the read.
//
// Titles below are the actual blog headings — short editorial labels.
// Bodies are tight summaries, not full reproductions.
export const caseLessons = [
  {
    num: "01",
    title: "Co-location debt is invisible until load arrives.",
    body:
      "Running the AI worker and the media server on the same instance was fine in development. The architecture had a tripwire we'd never set — by the time concurrency revealed it, the system was already on fire.",
  },
  {
    num: "02",
    title: "Moving compute to the client is architectural, not just an optimisation.",
    body:
      "Shifting inference into the browser didn't just lift CPU off the server — it changed the trust boundary. Every downstream component (evidence, validation, scoring) had to be reasoned about again. Performance was the symptom; topology was the fix.",
  },
  {
    num: "03",
    title: "React's state model is not designed for 80 updates per second.",
    body:
      "useState and useReducer are built for user-driven events. A live proctoring score feed is a continuous stream. useSyncExternalStore exists for exactly this — high-frequency writes that should bypass the render tree entirely.",
  },
] as const;

// ─── OUTRO ────────────────────────────────────────────────────────────────
// The blog link is the page's actual exit. Sub copy positions the full
// piece as the substantive read; this page is the trailer.
export const caseOutro = {
  blogUrl: person.blog.proctoringSystem,
  blogCta: "Read the full piece",
  blogSub:
    "The unabridged 24-minute deep dive on GitHub Pages — three more lessons, the WebRTC race conditions, the dashboard refactor in detail.",
  next: {
    label: "Real-Time Messaging",
    href: "/work",
    sub: "Up next in the queue · case study soon",
  },
} as const;

// ─── HELPER — detects unfilled TODOs at render time ───────────────────────
export function isTodo(value: string | null | undefined): boolean {
  if (!value) return true;
  return /^TODO/.test(value.trim());
}
