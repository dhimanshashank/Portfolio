"use client";

// ─── QuizRunner ─────────────────────────────────────────────────────────────
// The exam stage. A dummy MCQ quiz + countdown on the left; the live webcam
// feed, risk HUD, and warning popup on the right — all driven by the real
// ProctoringEngine via useProctoringEngine. Mirrors how Quiz.js hosts the
// proctoring UI alongside the exam.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WebcamFeed } from "./webcam-feed";
import { ProctoringHUD } from "./proctoring-hud";
import { ViolationPopup } from "./violation-popup";
import { useProctoringEngine, type WarningLogEntry } from "@/hooks/use-proctoring-engine";
import { QUIZ_QUESTIONS, QUIZ_DURATION_SECONDS } from "@/lib/quiz-data";
import { cn } from "@/lib/utils";

export interface QuizResult {
  answers: Record<string, number>;
  warningLog: WarningLogEntry[];
  finalScore: number;
  totalWarnings: number;
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function QuizRunner({
  videoRef,
  stream,
  quizId,
  studentId,
  onComplete,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  quizId: string;
  studentId: string;
  onComplete: (result: QuizResult) => void;
}) {
  const { state, warningLog, totalWarnings, currentPopup, dismissPopup, errorMessage } =
    useProctoringEngine({ videoRef, quizId, studentId, active: true });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);

  // Keep the latest values in refs so the auto-submit timer closes over them.
  const latest = useRef({ answers, warningLog, riskScore: state.riskScore, totalWarnings });
  latest.current = { answers, warningLog, riskScore: state.riskScore, totalWarnings };

  const submit = useCallback(() => {
    const l = latest.current;
    onComplete({
      answers: l.answers,
      warningLog: l.warningLog,
      finalScore: l.riskScore,
      totalWarnings: l.totalWarnings,
    });
  }, [onComplete]);

  // Countdown — auto-submit at zero.
  useEffect(() => {
    if (timeLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submit]);

  const q = QUIZ_QUESTIONS[index];
  const isLast = index === QUIZ_QUESTIONS.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress = useMemo(
    () => Math.round((answeredCount / QUIZ_QUESTIONS.length) * 100),
    [answeredCount],
  );

  return (
    <div className="container-base py-8">
      {currentPopup && (
        <ViolationPopup
          flag={currentPopup.flag}
          timestamp={currentPopup.timestamp}
          onClose={dismissPopup}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-signal">
            Proctored exam · in progress
          </p>
          <h2 className="mt-1 text-[18px] font-medium tracking-[-0.01em]">
            Frontend Engineering — Aptitude
          </h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-4">Time left</p>
          <p
            className={cn(
              "font-display text-2xl font-light tabular-nums",
              timeLeft <= 30 && "text-danger",
            )}
          >
            {fmtTime(timeLeft)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_minmax(0,340px)]">
        {/* Quiz */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[12px] text-ink-4">
              Question {index + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <span className="font-mono text-[12px] text-ink-4">{progress}% answered</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper-deep">
            <div
              className="h-full rounded-full bg-signal transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h3 className="mt-8 text-[22px] font-medium leading-snug tracking-[-0.01em]">
            {q.prompt}
          </h3>

          <div className="mt-6 space-y-3">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-[15px] transition-colors",
                    selected
                      ? "border-signal bg-signal-dim"
                      : "border-hairline hover:border-hairline-strong hover:bg-paper-soft",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-medium",
                      selected
                        ? "border-signal bg-signal text-paper"
                        : "border-hairline-strong text-ink-4",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="rounded-full border border-hairline-strong px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-paper-soft disabled:opacity-40"
            >
              Previous
            </button>
            {isLast ? (
              <button
                onClick={submit}
                className="rounded-full bg-ink px-7 py-2.5 text-[14px] font-medium text-paper transition-colors hover:bg-signal"
              >
                Submit exam
              </button>
            ) : (
              <button
                onClick={() => setIndex((i) => Math.min(QUIZ_QUESTIONS.length - 1, i + 1))}
                className="rounded-full bg-ink px-7 py-2.5 text-[14px] font-medium text-paper transition-colors hover:bg-signal"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Proctoring sidebar */}
        <aside className="order-1 space-y-4 lg:order-2">
          <WebcamFeed
            videoRef={videoRef}
            stream={stream}
            faceCount={state.faceCount}
            activeFlags={state.activeFlags}
            recording={state.status === "running"}
            className="aspect-[4/3] w-full"
          />
          <ProctoringHUD state={state} totalWarnings={totalWarnings} />
          {errorMessage && (
            <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-[12px] text-danger">
              {errorMessage}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
