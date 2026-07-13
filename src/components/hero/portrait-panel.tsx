"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PortraitTouchLayer } from "./portrait-touch-layer";
import { assetUrl } from "@/lib/assets";

const SHARED_READY_EVENT = "shared-portrait-ready";

/**
 * <PortraitPanel>
 *
 * Right-side visual anchor of the Hero. Uses next/image for:
 *   - Auto WebP/AVIF conversion (396KB PNG → ~40-60KB)
 *   - priority prop = no lazy load penalty on LCP element
 *   - Responsive srcSet = correct size per viewport
 *
 * Right padding removed so portrait bleeds to the viewport edge.
 */
export function PortraitPanel({
  src = assetUrl("/hero/portrait-sketch.webp"),
  alt = "Pencil sketch portrait of Shashank Dhiman",
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [sharedReady, setSharedReady] = useState(false);

  useEffect(() => {
    const sync = () =>
      setSharedReady(document.documentElement.dataset.sharedPortraitReady === "true");
    sync();
    window.addEventListener(SHARED_READY_EVENT, sync as EventListener);
    return () => window.removeEventListener(SHARED_READY_EVENT, sync as EventListener);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        // Mobile: zero padding — the portrait is a full-bleed backdrop.
        // Desktop: left/top padding keeps a small gap from the text column;
        // no right padding so the portrait bleeds to the viewport edge.
        "relative h-full w-full bg-paper",
        "p-0 md:pl-6 md:pr-0 md:pt-6 md:pb-0 lg:pl-10 lg:pr-0 lg:pt-8 lg:pb-0",
        className
      )}
    >
      <div className="relative isolate h-full w-full overflow-hidden rounded-none md:rounded-l-sm bg-paper-soft">
        {/* Hero anchor: the shared portrait layer docks to this rect. The
            inline poster exists only until the shared layer is mounted.
            Mobile fills the whole panel; the desktop inset is unchanged so
            the flight layer measures the exact same rect as before. */}
        <div
          data-hero-portrait-anchor
          className="absolute inset-0 md:inset-[2%_0_6%_0] overflow-hidden rounded-none md:rounded-l-sm"
        >
          {!sharedReady && !errored && (
            <Image
              ref={imgRef as React.Ref<HTMLImageElement>}
              src={src}
              alt={alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
              draggable={false}
              className={cn(
                "object-cover object-top select-none",
                "transition-opacity duration-700 ease-out",
                loaded ? "opacity-100" : "opacity-0"
              )}
              style={{
                filter: "contrast(1.04) brightness(0.99)",
                willChange: "transform",
              }}
            />
          )}
        </div>

        {/* Restored edge shadow mix — gives the portrait shell the older
            framed depth, while the shared portrait still moves independently. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.6] mix-blend-multiply"
          style={{
            background: [
              "radial-gradient(96% 82% at 76% 42%, transparent 58%, rgba(34,29,24,0.12) 84%, rgba(34,29,24,0.18) 100%)",
              "linear-gradient(to left, rgba(24,20,16,0.16) 0%, rgba(24,20,16,0.08) 10%, transparent 24%)",
              "linear-gradient(to bottom, rgba(24,20,16,0.12) 0%, rgba(24,20,16,0.05) 9%, transparent 18%)",
              "linear-gradient(to top, rgba(24,20,16,0.16) 0%, rgba(24,20,16,0.08) 14%, transparent 28%)",
            ].join(", "),
            boxShadow:
              "inset 0 0 0 1px rgba(26,24,21,0.06), inset -42px 0 54px rgba(26,24,21,0.08), inset 0 -38px 52px rgba(26,24,21,0.07)",
          }}
        />

        {/* Signal-orange warmth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 mix-blend-color opacity-[0.08]"
          style={{
            background:
              "radial-gradient(70% 60% at 30% 75%, var(--signal) 0%, transparent 70%)",
          }}
        />

        {/* Left feather — blends into text column (desktop only; the
            mobile full-bleed backdrop has no text column beside it) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-24 md:block md:w-32"
          style={{
            background:
              "linear-gradient(to right, var(--paper) 0%, rgba(245,241,232,0.6) 35%, transparent 100%)",
          }}
        />
        {/* Top feather */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 md:h-24"
          style={{
            background:
              "linear-gradient(to bottom, var(--paper) 0%, rgba(245,241,232,0.45) 50%, transparent 100%)",
          }}
        />
        {/* Bottom feather — on mobile it reaches ~45% up the portrait so
            the image dissolves into the text overlay's paper gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[45%] md:h-44"
          style={{
            background:
              "linear-gradient(to top, var(--paper) 0%, rgba(245,241,232,0.7) 40%, transparent 100%)",
          }}
        />

        {/* Subtle film grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Corner signature — desktop only; on mobile it would collide
            with the text overlay sitting on the portrait's lower third */}
        <div className="absolute bottom-5 right-5 z-20 hidden font-mono text-[10px] tracking-[0.22em] uppercase text-ink-3 opacity-60 md:block">
          sd · {new Date().getFullYear()}
        </div>

        {/* Mobile-only tap-ripple feedback (no-op on desktop / reduced motion) */}
        <PortraitTouchLayer />
      </div>
    </div>
  );
}
