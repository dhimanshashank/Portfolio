"use client";

import { cn } from "@/lib/utils";

/**
 * <ScrollIndicator>
 *
 * A single vertical 1px line. A thin signal-orange segment travels top→bottom
 * inside it on a 1.2s rhythm — implies cadence without being a "scroll" badge.
 *
 * No text label. The plan is explicit: nothing that says "scroll" in words.
 *
 * The line tracks its own pulse via CSS keyframes; parent controls whether it
 * fades out on scroll (Hero binds opacity to scroll progress via GSAP).
 */
export function ScrollIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "scroll-ind relative h-10 w-px overflow-hidden bg-ink/15",
        className
      )}
      aria-hidden="true"
    >
      <span className="scroll-ind-bead absolute inset-x-0 top-0 h-2 bg-signal" />

      <style>{`
        @keyframes scroll-ind-pulse {
          0%   { transform: translateY(-100%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        .scroll-ind-bead {
          animation: scroll-ind-pulse 1.2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-ind-bead { animation: none; opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
