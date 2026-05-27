"use client";

import { useState } from "react";
import { SignalTrace } from "@/components/hero/signal-trace";
import { cn } from "@/lib/utils";

/**
 * <SignalStrip>
 *
 * Atmospheric divider between major sections. Layers two things:
 *   1. The saved oscilloscope PNG (richer, photographic) — if present
 *   2. The animated SVG signal-trace — always running underneath
 *
 * If the PNG is missing, the SVG carries the moment on its own.
 * If it's there, the PNG sits on top at low opacity with a subtle drift,
 * adding a heavier "image" feel without losing the live motion.
 *
 * Height stays small — this is a transition, not a section.
 */
export function SignalStrip({
  imageSrc = "/atmosphere/signal-trace.png",
  className,
  height = 200,
}: {
  imageSrc?: string;
  className?: string;
  height?: number;
}) {
  const [imgErrored, setImgErrored] = useState(false);

  return (
    <div
      className={cn(
        "relative isolate w-full overflow-hidden bg-void",
        className
      )}
      style={{ height }}
      aria-hidden
    >
      {/* Soft top + bottom paper-to-void feather so the strip blends in */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-8 z-10"
        style={{ background: "linear-gradient(to bottom, var(--paper), transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-10"
        style={{ background: "linear-gradient(to top, var(--paper), transparent)" }}
      />

      {/* Animated SVG signal — always on, the live layer */}
      <div className="absolute inset-0 flex items-center">
        <SignalTrace
          className="!relative !inset-auto"
          amplitude={6}
          frequency={2.4}
          speed={40}
          opacity={0.65}
          strokeWidth={1.25}
        />
      </div>

      {/* Photographic oscilloscope PNG on top — adds bloom/depth when present */}
      {!imgErrored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          onError={() => setImgErrored(true)}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center select-none mix-blend-screen opacity-80 signal-strip-drift"
        />
      )}

      <style>{`
        @keyframes signal-strip-drift {
          from { transform: translateX(0); }
          to   { transform: translateX(-2%); }
        }
        .signal-strip-drift {
          animation: signal-strip-drift 18s ease-in-out infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .signal-strip-drift { animation: none; }
        }
      `}</style>
    </div>
  );
}
