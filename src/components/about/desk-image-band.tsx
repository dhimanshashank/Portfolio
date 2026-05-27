"use client";

import { useRef, useState } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { aboutImageBand, isDraft, stripDraft } from "@/lib/about-content";
import { cn } from "@/lib/utils";

/**
 * <DeskImageBand>
 *
 * Full-bleed atmospheric break between essay sections. The desk-night
 * image sits at ~65vh, slow Y parallax so it drifts as the page scrolls.
 * An optional italic overlay line sits bottom-left in signal-orange.
 *
 * Graceful fallback: if the image fails to load, the band collapses to
 * a dark void panel with just the overlay line, still feels intentional.
 */
export function DeskImageBand() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [errored, setErrored] = useState(false);

  useGSAP(
    () => {
      if (!imgRef.current || errored) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      // Slow Y parallax — image moves -10% over the band's scroll range.
      // Pair with `scale-110` baseline so we never see the image edge.
      gsap.fromTo(
        imgRef.current,
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    },
    { scope: wrapRef, dependencies: [errored] }
  );

  const overlayIsDraft = aboutImageBand.overlay ? isDraft(aboutImageBand.overlay) : false;

  return (
    <section
      ref={wrapRef}
      className="relative isolate w-full overflow-hidden bg-void"
      style={{ height: "clamp(420px, 65vh, 720px)" }}
      aria-label="Workspace photograph"
    >
      {!errored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={aboutImageBand.src}
          alt={aboutImageBand.alt}
          onError={() => setErrored(true)}
          draggable={false}
          className="absolute inset-0 h-[120%] w-full object-cover object-center select-none scale-110"
          style={{ willChange: "transform" }}
        />
      )}

      {/* Vignette — pulls focus toward the centre and edges fade to paper */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Top + bottom paper feathers — softens the rectangle into the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16"
        style={{ background: "linear-gradient(to bottom, var(--paper), transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
        style={{ background: "linear-gradient(to top, var(--paper), transparent)" }}
      />

      {/* Overlay quote — bottom-left, quiet */}
      {aboutImageBand.overlay && (
        <p
          className={cn(
            "absolute bottom-10 left-6 md:left-10 max-w-[28ch] font-display italic text-bone",
            overlayIsDraft && "opacity-70"
          )}
          style={{
            fontSize: "clamp(16px, 1.4vw, 22px)",
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            textShadow: "0 1px 14px rgba(0,0,0,0.55)",
          }}
        >
          {stripDraft(aboutImageBand.overlay)}
        </p>
      )}
    </section>
  );
}
