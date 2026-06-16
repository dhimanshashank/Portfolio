"use client";

// ─── WebcamFeed ─────────────────────────────────────────────────────────────
// The real <video> preview. Mirrored like a selfie. Optional live overlay shows
// the recording dot, face count, and the flags currently firing.

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  VIOLATION_DISPLAY_NAMES,
  type ViolationFlag,
} from "@/lib/proctoring/violation-tags";

export function WebcamFeed({
  videoRef,
  stream,
  faceCount,
  activeFlags = [],
  recording = false,
  guide = "off",
  guideHint,
  className,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** When provided, the feed attaches this stream itself (survives route changes). */
  stream?: MediaStream | null;
  faceCount?: number;
  activeFlags?: ViolationFlag[];
  recording?: boolean;
  /** Circular face-positioning overlay for the env check. */
  guide?: "off" | "searching" | "ok";
  guideHint?: string;
  className?: string;
}) {
  // Attach the stream to this page's <video>. Runs on mount, so it reliably
  // re-attaches when navigating to a new route with the stream already live.
  useEffect(() => {
    const v = videoRef.current;
    if (v && stream && v.srcObject !== stream) {
      v.srcObject = stream;
      v.play().catch(() => {});
    }
  }, [stream, videoRef]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-void ring-1 ring-hairline-void-strong",
        className,
      )}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className="h-full w-full -scale-x-100 object-cover"
      />

      {/* Circular face-positioning guide */}
      {guide !== "off" && (
        <div className="pointer-events-none absolute inset-0">
          {/* dim everything outside the ring */}
          <div
            className="absolute inset-0 bg-void/45 transition-opacity"
            style={{
              maskImage:
                "radial-gradient(circle at 50% 46%, transparent 39%, black 40%)",
              WebkitMaskImage:
                "radial-gradient(circle at 50% 46%, transparent 39%, black 40%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "rounded-full border-2 transition-colors duration-300",
                guide === "ok"
                  ? "border-ok shadow-[0_0_0_3px_rgba(46,125,92,0.25)]"
                  : "border-dashed border-bone/70",
              )}
              style={{ height: "80%", aspectRatio: "1", transform: "translateY(-4%)" }}
            />
          </div>
          {guideHint && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <span
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[11px] backdrop-blur-sm",
                  guide === "ok"
                    ? "bg-ok/90 text-paper"
                    : "bg-void-deep/80 text-bone-2",
                )}
              >
                {guideHint}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recording / analysing indicator */}
      {recording && (
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-void-deep/80 px-2.5 py-1 backdrop-blur-sm">
          <span className="proctor-pulse block h-2 w-2 rounded-full bg-danger" />
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-bone-2">
            Analysing
          </span>
        </div>
      )}

      {/* Face count */}
      {typeof faceCount === "number" && (
        <div className="absolute right-3 top-3 rounded-full bg-void-deep/80 px-2.5 py-1 font-mono text-[11px] text-bone-2 backdrop-blur-sm">
          {faceCount} face{faceCount === 1 ? "" : "s"}
        </div>
      )}

      {/* Live flags */}
      {activeFlags.length > 0 && (
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
          {activeFlags.map((flag) => (
            <span
              key={flag}
              className="rounded-md bg-danger/90 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-paper"
            >
              {VIOLATION_DISPLAY_NAMES[flag]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
