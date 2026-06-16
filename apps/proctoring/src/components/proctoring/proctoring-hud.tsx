"use client";

// ─── ProctoringHUD ──────────────────────────────────────────────────────────
// Live status panel beside the quiz. Shows the 0–100 risk score, its band, the
// per-category breakdown, current signals, and the running warning count.

import type { EngineUpdate } from "@/lib/proctoring/engine";
import { riskBand, RISK_CATEGORY_CAPS } from "@/lib/proctoring/scoring";
import { cn } from "@/lib/utils";

const TONE_BG: Record<"ok" | "warn" | "danger", string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
};
const TONE_TEXT: Record<"ok" | "warn" | "danger", string> = {
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
};

export function ProctoringHUD({
  state,
  totalWarnings,
}: {
  state: EngineUpdate;
  totalWarnings: number;
}) {
  const band = riskBand(state.riskScore);
  const loading = state.status === "loading";

  return (
    <div className="rounded-xl border border-hairline bg-paper-soft p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-4">
          Engine status
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "block h-2 w-2 rounded-full",
              state.status === "running" ? "bg-ok proctor-pulse" : "bg-ink-4",
            )}
          />
          <span className="font-mono text-[11px] text-ink-3">
            {loading ? "loading model…" : state.status}
          </span>
        </span>
      </div>

      {/* Risk score */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-ink-3">Risk score</span>
          <span className={cn("font-mono text-[12px] font-medium", TONE_TEXT[band.tone])}>
            {band.label}
          </span>
        </div>
        <div className="mt-1 flex items-end gap-2">
          <span className="font-display text-5xl font-light tracking-[-0.02em] tabular-nums">
            {state.riskScore}
          </span>
          <span className="mb-1.5 text-[13px] text-ink-4">/ 100</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-deep">
          <div
            className={cn("h-full rounded-full transition-all duration-500", TONE_BG[band.tone])}
            style={{ width: `${state.riskScore}%` }}
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mt-5 space-y-2">
        {(["high", "medium", "low"] as const).map((cat) => (
          <div key={cat} className="flex items-center gap-3">
            <span className="w-14 font-mono text-[11px] uppercase tracking-wide text-ink-4">
              {cat}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
              <div
                className="h-full rounded-full bg-ink-3 transition-all duration-500"
                style={{
                  width: `${(state.categoryScores[cat] / RISK_CATEGORY_CAPS[cat]) * 100}%`,
                }}
              />
            </div>
            <span className="w-10 text-right font-mono text-[11px] tabular-nums text-ink-3">
              {state.categoryScores[cat]}
            </span>
          </div>
        ))}
      </div>

      {/* Signals */}
      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-hairline pt-4 text-center">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-4">Faces</dt>
          <dd className="mt-0.5 font-mono text-[15px] tabular-nums">{state.faceCount}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-4">Light</dt>
          <dd className="mt-0.5 font-mono text-[15px] tabular-nums">
            {Math.round(state.brightness)}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-4">Warnings</dt>
          <dd className="mt-0.5 font-mono text-[15px] tabular-nums text-danger">
            {totalWarnings}
          </dd>
        </div>
      </dl>
    </div>
  );
}
