"use client";

// ─── ViolationPopup ─────────────────────────────────────────────────────────
// Port of ProctoringViolationPopup: a warning toast/modal raised when a flag
// passes its TTL window. Auto-dismisses (handled by the hook) or can be closed.

import {
  VIOLATION_DISPLAY_NAMES,
  VIOLATION_MESSAGES,
  type ViolationFlag,
} from "@/lib/proctoring/violation-tags";

export function ViolationPopup({
  flag,
  timestamp,
  onClose,
}: {
  flag: ViolationFlag;
  timestamp: number;
  onClose: () => void;
}) {
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div className="proctor-pop-in pointer-events-auto w-full max-w-md rounded-xl border border-danger/30 bg-void-deep text-bone shadow-2xl">
        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
            {/* warning glyph */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 9v4m0 4h.01M10.3 3.86l-8.05 13.5A2 2 0 0 0 4 20.4h16a2 2 0 0 0 1.72-3.04l-8.05-13.5a2 2 0 0 0-3.42 0z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-semibold">
                {VIOLATION_DISPLAY_NAMES[flag]}
              </p>
              <span className="font-mono text-[11px] text-bone-3">{time}</span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-bone-2">
              {VIOLATION_MESSAGES[flag]}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Dismiss warning"
            className="shrink-0 rounded-md px-1.5 text-bone-3 transition-colors hover:text-bone"
          >
            ✕
          </button>
        </div>
        <div className="h-1 overflow-hidden rounded-b-xl bg-danger/20">
          <div className="proctor-warning-bar h-full bg-danger" />
        </div>
      </div>
    </div>
  );
}
