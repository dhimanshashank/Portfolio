"use client";

import { useRef, useState } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { cn } from "@/lib/utils";

/**
 * <PortraitPanel>
 *
 * Right-side visual anchor of the Hero. Displays a black-and-white halftone
 * portrait on a paper-tone background — editorial magazine treatment, NOT
 * a dark cinematic poster (we tried that; it fought the rest of the page).
 *
 * Treatment stack (bottom → top):
 *   1. paper background (matches the rest of the page so the column joins in)
 *   2. the halftone image, slight contrast bump for crispness
 *   3. soft warm signal-orange wash on the left half (where the head sits)
 *   4. faint top/bottom feather into the page color so the rectangle softens
 *   5. small `sd · year` mark in the bottom-right corner
 *
 * Image breathes (slow scale yoyo) so the static portrait doesn't feel dead.
 * If the image fails to load, the paper bg + corner mark still feels intentional.
 */
export function PortraitPanel({
  src = "/hero/portrait-halftone.png",
  alt = "Portrait of Shashank Dhiman",
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

  useGSAP(
    () => {
      if (!imgRef.current || errored) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      gsap.to(imgRef.current, {
        scale: 1.04,
        duration: 9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: wrapRef, dependencies: [errored, loaded] }
  );

  return (
    <div
      ref={wrapRef}
      className={cn(
        // Outer wrap: provides padding so the portrait never kisses the
        // viewport edge. The actual image is in the inner card below.
        "relative h-full w-full bg-paper",
        "pl-0 pr-4 pt-4 pb-4 md:pr-6 md:pt-6 md:pb-6 lg:pr-10 lg:pt-10 lg:pb-10",
        className
      )}
    >
      {/* Inner card — the framed portrait sits inside this. Subtle radius and
          a hairline keep it feeling like an editorial spread, not a poster. */}
      <div className="relative isolate h-full w-full overflow-hidden rounded-sm bg-paper-soft">
        {/* The portrait itself */}
        {!errored && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            draggable={false}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-top select-none",
              "transition-opacity duration-700 ease-out",
              loaded ? "opacity-100" : "opacity-0"
            )}
            style={{
              // Slight contrast — keeps halftone crisp at any scale.
              filter: "contrast(1.04) brightness(0.99)",
              willChange: "transform",
            }}
          />
        )}

        {/* Signal-orange warmth — dialed way back. Repositioned to the
            lower-left so it doesn't darken the face. mix-blend "color"
            tints without darkening (multiply was the culprit before). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-color opacity-[0.08]"
          style={{
            background:
              "radial-gradient(70% 60% at 30% 75%, var(--signal) 0%, transparent 70%)",
          }}
        />

        {/* Soft feathered edges → blend the card into the page color.
            Taller, gentler gradients with an ease-style stop so the fade
            never lands as a visible horizontal line. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-32"
          style={{
            background:
              "linear-gradient(to right, var(--paper) 0%, rgba(245,241,232,0.6) 35%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16 md:h-24"
          style={{
            background:
              "linear-gradient(to bottom, var(--paper) 0%, rgba(245,241,232,0.45) 50%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 md:h-44"
          style={{
            background:
              "linear-gradient(to top, var(--paper) 0%, rgba(245,241,232,0.7) 40%, transparent 100%)",
          }}
        />

        {/* Subtle paper-tone film grain overlay — tactile editorial feel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Hairline mark in the corner — quiet "developer's signature" */}
        <div className="absolute bottom-5 right-5 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-3 opacity-60">
          sd · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
