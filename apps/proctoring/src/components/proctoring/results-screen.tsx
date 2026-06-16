"use client";

// ─── ResultsScreen ──────────────────────────────────────────────────────────
// Post-exam summary: final risk score, the full warnings log (newest first),
// and a quick correct/incorrect breakdown of the dummy quiz.

import { useRef } from "react";
import type { QuizResult } from "./quiz-runner";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";
import { riskBand } from "@/lib/proctoring/scoring";
import { VIOLATION_DISPLAY_NAMES } from "@/lib/proctoring/violation-tags";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { Magnetic } from "@/components/ui/magnetic";
import { cn } from "@/lib/utils";

const TONE_TEXT = { ok: "text-ok", warn: "text-warn", danger: "text-danger" } as const;

export function ResultsScreen({
  result,
  onRestart,
}: {
  result: QuizResult;
  onRestart: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const band = riskBand(result.finalScore);
  const correct = QUIZ_QUESTIONS.reduce(
    (n, q) => n + (result.answers[q.id] === q.answer ? 1 : 0),
    0,
  );

  useGSAP(
    () => {
      gsap.from("[data-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.07,
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
        Session complete
      </p>
      <h1
        data-reveal
        className="mt-4 font-display font-light tracking-[-0.02em]"
        style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
      >
        Exam submitted. Here&apos;s the proctoring report.
      </h1>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div data-reveal className="rounded-xl border border-hairline bg-paper-soft p-6">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-4">Final risk</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-display text-5xl font-light tabular-nums">
              {result.finalScore}
            </span>
            <span className="mb-1.5 text-[13px] text-ink-4">/ 100</span>
          </div>
          <p className={cn("mt-1 font-mono text-[12px] font-medium", TONE_TEXT[band.tone])}>
            {band.label}
          </p>
        </div>
        <div data-reveal className="rounded-xl border border-hairline bg-paper-soft p-6">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-4">Warnings</p>
          <span className="mt-2 block font-display text-5xl font-light tabular-nums text-danger">
            {result.totalWarnings}
          </span>
          <p className="mt-1 font-mono text-[12px] text-ink-4">flags raised</p>
        </div>
        <div data-reveal className="rounded-xl border border-hairline bg-paper-soft p-6">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-4">Quiz score</p>
          <span className="mt-2 block font-display text-5xl font-light tabular-nums">
            {correct}
            <span className="text-2xl text-ink-4">/{QUIZ_QUESTIONS.length}</span>
          </span>
          <p className="mt-1 font-mono text-[12px] text-ink-4">correct answers</p>
        </div>
      </div>

      {/* Warnings log */}
      <div data-reveal className="mt-10">
        <h2 className="text-[15px] font-medium">Warnings log</h2>
        {result.warningLog.length === 0 ? (
          <p className="mt-3 rounded-lg border border-hairline bg-paper-soft px-4 py-6 text-center text-[14px] text-ink-3">
            Clean session — no violations were confirmed. 🎯
          </p>
        ) : (
          <ul className="mt-3 max-h-72 divide-y divide-hairline overflow-auto rounded-xl border border-hairline">
            {result.warningLog.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-danger" />
                  <span className="text-[14px]">{VIOLATION_DISPLAY_NAMES[w.flag]}</span>
                </span>
                <span className="font-mono text-[12px] text-ink-4">
                  {new Date(w.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div data-reveal className="mt-10">
        <Magnetic>
          <button
            onClick={onRestart}
            className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-signal"
          >
            Run it again
          </button>
        </Magnetic>
      </div>
    </section>
  );
}
