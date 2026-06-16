"use client";

// ─── IntroScreen ────────────────────────────────────────────────────────────
// First stage. Explains what the demo is, what it does locally, and kicks off
// the environment check. Staggered GSAP entrance + magnetic CTA, matching the
// parent portfolio's motion language.

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { Magnetic } from "@/components/ui/magnetic";

const FEATURES = [
  {
    k: "01",
    title: "Real webcam, on-device",
    body: "Your camera feed never leaves the browser. No upload, no server, no recording stored.",
  },
  {
    k: "02",
    title: "MediaPipe detection loop",
    body: "A real FaceLandmarker model runs ~once a second; pixel math runs in a Web Worker.",
  },
  {
    k: "03",
    title: "Weighted risk scoring",
    body: "Flags feed a capped, time-decaying 0–100 score — the same model the production engine uses.",
  },
  {
    k: "04",
    title: "TTL de-bounce in localStorage",
    body: "Each violation type is rate-limited by a stored timestamp, so warnings don't spam.",
  },
];

export function IntroScreen({ onStart }: { onStart: () => void }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="container-base flex min-h-screen flex-col justify-center py-20"
    >
      <p
        data-reveal
        className="font-mono text-[12px] uppercase tracking-[0.12em] text-signal"
      >
        Proctoring engine · demonstration
      </p>
      <h1
        data-reveal
        className="mt-4 max-w-3xl font-display font-light tracking-[-0.02em]"
        style={{ fontSize: "var(--text-display)", lineHeight: "var(--leading-tight)" }}
      >
        A browser-side exam proctor you can actually watch work.
      </h1>
      <p
        data-reveal
        className="mt-6 max-w-2xl text-ink-3"
        style={{ fontSize: "var(--text-lead)" }}
      >
        A frontend-only exam-proctoring engine that runs entirely in your browser. Take a short
        dummy quiz while a real computer-vision loop watches your webcam and flags exam violations
        live — multiple faces in frame, looking away, downward gaze, poor lighting, a blocked
        camera, and more. Each flag feeds a weighted risk score with a TTL-debounced warning
        system. No uploads, no server, no recording — everything runs on-device.
      </p>

      <div className="mt-12 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-xl bg-hairline-strong sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.k} data-reveal className="bg-paper p-6">
            <span className="font-mono text-[12px] text-ink-4">{f.k}</span>
            <h3 className="mt-2 text-[17px] font-medium tracking-[-0.01em]">{f.title}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{f.body}</p>
          </div>
        ))}
      </div>

      <div data-reveal className="mt-12 flex flex-wrap items-center gap-4">
        <Magnetic>
          <button
            onClick={onStart}
            className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-signal"
          >
            Start environment check
          </button>
        </Magnetic>
        <span className="font-mono text-[12px] text-ink-4">
          Camera permission required · nothing is uploaded
        </span>
      </div>
    </section>
  );
}
