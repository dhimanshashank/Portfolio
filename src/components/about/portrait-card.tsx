"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { person } from "@/lib/person";

/**
 * <PortraitCard>
 *
 * Small framed portrait — magazine author-bio scale. Reuses the same halftone
 * asset that anchors the hero (kept consistent: one face, one treatment).
 * Sits in the AboutSidebar so the visitor finally sees the person whose
 * essay they've just read.
 *
 * Aspect: portrait (4:5) to match a typical author bio frame. Subtle
 * hairline border + film grain for editorial feel.
 *
 * If the image fails to load, the empty paper-soft frame + caption still
 * feels intentional — no broken-image UI.
 */
export function PortraitCard({
  src = "/hero/portrait-halftone.png",
  className,
}: {
  src?: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Frame ──────────────────────────────────────────────────── */}
      <div className="relative isolate w-full overflow-hidden rounded-sm border border-hairline bg-paper-soft" style={{ aspectRatio: "4 / 5" }}>
        {!errored && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Portrait of ${person.name}`}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            draggable={false}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-top select-none",
              "transition-opacity duration-700 ease-out",
              loaded ? "opacity-100" : "opacity-0"
            )}
            style={{
              filter: "contrast(1.04) brightness(0.99)",
            }}
          />
        )}

        {/* Quiet signal-orange tint on the bottom-left — same brand cue as hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-color opacity-[0.07]"
          style={{
            background:
              "radial-gradient(70% 60% at 30% 80%, var(--signal) 0%, transparent 70%)",
          }}
        />

        {/* Gentle paper feather at the bottom — softens the frame into the page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          style={{
            background:
              "linear-gradient(to top, var(--paper-soft) 0%, rgba(239,234,223,0.5) 50%, transparent 100%)",
          }}
        />

        {/* Film grain — tactile editorial finish */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      {/* ── Caption — magazine author bio register ───────────────────── */}
      <div className="flex flex-col gap-1">
        <p className="font-display text-ink" style={{ fontSize: "17px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
          {person.name}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          {person.role} · {person.location}
        </p>
      </div>
    </div>
  );
}
