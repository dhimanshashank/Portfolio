"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  SketchAsterisk,
  SketchDivider,
  SketchUnderline,
} from "@/components/ui/sketch-marks";
import type {
  EngineeringProblem,
  ProblemSeverity,
} from "@/lib/problems-data";

/**
 * <ProblemCard>
 *
 * The full investigation card — meta row, italic title with a hand-drawn
 * underline, evidence terminal block, then a two-column Root cause / Fix
 * split below a SketchDivider.
 *
 * Motion (three layers, all ambient — never theatrical):
 *
 *   1. Scroll-in fade   — opacity + y when the card enters the viewport
 *                         (framer-motion, once: true)
 *   2. Card drift       — pure-CSS keyframe, ~12s loop, ±4px translate +
 *                         tiny rotate. Per-card delay derived from id so
 *                         multiple cards never lock-step.
 *   3. Asterisk drift   — independent slower loop on the corner mark
 *   4. Smoking-gun pulse — the signal-orange "evidence" line breathes
 *                          opacity to anchor the eye there
 *
 * All three respect prefers-reduced-motion.
 */
export function ProblemCard({ problem }: { problem: EngineeringProblem }) {
  const reduce = useReducedMotion();
  const clueLines = problem.clue.split("\n");
  // Mobile: the evidence block collapses to the smoking-gun line; tap to
  // reveal the full trace. Desktop always shows everything (md: overrides).
  const [expanded, setExpanded] = useState(false);

  // Deterministic per-card phase offset so a list of cards desyncs naturally
  // as new entries arrive. id.length is stable, varied, and free.
  const driftDelay = ((problem.id.length % 5) * 0.7).toFixed(2) + "s";
  const asteriskDelay = ((problem.id.length % 4) * 1.1).toFixed(2) + "s";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <article
        className="
          problem-card-drift relative w-full max-w-[820px] mx-auto
          rounded-sm border border-ink/12 bg-paper-soft/60
          px-6 py-8 md:px-10 md:py-12
          overflow-hidden
        "
        style={{
          animation: `problem-card-drift 12s ease-in-out ${driftDelay} infinite`,
          willChange: "transform",
        }}
      >
        {/* Drifting sketch asterisk — independent loop */}
        <span
          aria-hidden
          className="problem-card-asterisk absolute top-5 right-5 md:top-7 md:right-7 text-ink-3"
          style={{
            width: 18,
            height: 18,
            opacity: 0.55,
            display: "inline-block",
            animation: `problem-card-asterisk 16s ease-in-out ${asteriskDelay} infinite`,
            willChange: "transform",
          }}
        >
          <SketchAsterisk
            style={{ width: "100%", height: "100%" }}
            color="currentColor"
            weight={1.1}
          />
        </span>

        {/* ── Meta row: severity · tags · date ─────────────────────────── */}
        <div className="flex items-center justify-between gap-3 flex-wrap pr-[40px]">
          <div className="flex items-center gap-3 flex-wrap">
            <SeverityBadge severity={problem.severity} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
              {problem.tags.join("  ·  ")}
            </span>
          </div>
          <time
            dateTime={problem.date}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4"
          >
            {new Date(problem.date).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </time>
        </div>

        {/* ── Title — italic Fraunces with hand-drawn underline on period ── */}
        <h3
          className="mt-7 font-display italic text-ink"
          style={{
            fontSize: "clamp(22px, 2.6vw, 34px)",
            lineHeight: 1.15,
            letterSpacing: "-0.005em",
            wordSpacing: "0.04em",
            fontWeight: 400,
            maxWidth: "26ch",
          }}
        >
          {problem.title.replace(/\.\s*$/, "")}
          <span className="relative inline-block whitespace-nowrap pl-1">
            <span aria-hidden>.</span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-1 right-0"
              style={{ bottom: "-0.18em", color: "var(--signal)" }}
            >
              <SketchUnderline color="currentColor" weight={1} />
            </span>
          </span>
        </h3>

        {/* ── Hook ─────────────────────────────────────────────────────── */}
        <p
          className="mt-5 text-ink-2 max-w-[60ch]"
          style={{ fontSize: "clamp(13px, 1vw, 15px)", lineHeight: 1.7 }}
        >
          {problem.hook}
        </p>

        {/* ── Evidence — warm-paper terminal block ─────────────────────── */}
        <div className="mt-7">
          {/* Header doubles as a mobile expand toggle; inert on desktop. */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mb-2 flex w-full items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-3 md:pointer-events-none md:cursor-default"
          >
            Evidence
            <span className="text-ink-4 md:hidden">
              {expanded ? "· tap to collapse" : "· tap to expand"}
            </span>
          </button>
          <div
            className="
              relative rounded-sm border border-ink/12
              bg-paper px-4 py-3 md:px-5 md:py-4
              overflow-x-auto
            "
          >
            {/* Window-chrome dots */}
            <div className="flex items-center gap-1.5 mb-3" aria-hidden>
              <span className="block w-[6px] h-[6px] rounded-full bg-ink/15" />
              <span className="block w-[6px] h-[6px] rounded-full bg-ink/15" />
              <span className="block w-[6px] h-[6px] rounded-full bg-ink/15" />
            </div>

            {clueLines.map((line, i) => {
              const isHighlight = i === problem.clueHighlight;
              return (
                <p
                  key={i}
                  className={cn(
                    "font-mono text-[11px] md:text-[12px] leading-relaxed whitespace-pre",
                    // Collapsed on mobile → show only the smoking-gun line.
                    !isHighlight && !expanded && "hidden md:block",
                    isHighlight
                      ? "text-signal problem-card-pulse"
                      : i === 0
                      ? "text-ink-2"
                      : "text-ink-3"
                  )}
                  style={
                    isHighlight
                      ? {
                          animation:
                            "problem-card-pulse 3.4s ease-in-out infinite",
                          willChange: "opacity",
                        }
                      : undefined
                  }
                >
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* ── Sketch divider ───────────────────────────────────────────── */}
        <div className="mt-8 mb-7 w-32 text-ink-3 mx-auto">
          <SketchDivider color="currentColor" weight={1} />
        </div>

        {/* ── Root cause + Fix ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10">
          <div>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-signal mb-2">
              Root cause
            </p>
            <p
              className="text-ink-2"
              style={{ fontSize: "clamp(12.5px, 0.95vw, 14px)", lineHeight: 1.7 }}
            >
              {problem.rootCause}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-3 mb-2">
              Fix
            </p>
            <p
              className="text-ink-2"
              style={{ fontSize: "clamp(12.5px, 0.95vw, 14px)", lineHeight: 1.7 }}
            >
              {problem.fix}
            </p>
          </div>
        </div>
      </article>

      {/* Ambient drift keyframes — same family as the home-page teaser */}
      <style>{`
        @keyframes problem-card-drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50%      { transform: translate(0, -4px) rotate(0.12deg); }
        }
        @keyframes problem-card-asterisk {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50%      { transform: translate(2px, -3px) rotate(8deg); }
        }
        @keyframes problem-card-pulse {
          0%, 100% { opacity: 0.78; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .problem-card-drift,
          .problem-card-asterisk,
          .problem-card-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

// ─── Severity badge (shared) ──────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: ProblemSeverity }) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 border rounded-sm",
        severity === "P1" && "text-signal border-signal/40 bg-signal/5",
        severity === "P2" && "text-warn  border-warn/40  bg-warn/5",
        severity === "P3" && "text-ink-3 border-ink/15"
      )}
    >
      {severity}
    </span>
  );
}
