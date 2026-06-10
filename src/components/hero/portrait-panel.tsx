"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { cn } from "@/lib/utils";

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
  src = "/hero/portrait-halftone2.png",
  alt = "Portrait of Shashank Dhiman",
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);
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

      // Hover distortion — a turbulence ripple passes through the halftone.
      // CSS can't transition SVG filter primitives, so GSAP tweens the
      // displacement scale attribute directly: 0 → ~18 → 0. Pointer-fine
      // devices only; touch never sees it.
      const fine = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
      const card = wrapRef.current?.querySelector("[data-portrait-card]");
      const disp = displaceRef.current;
      if (!fine || !card || !disp) return;

      const ripple = { scale: 0 };
      let tween: gsap.core.Tween | null = null;

      const apply = () => disp.setAttribute("scale", String(ripple.scale));

      const onEnter = () => {
        tween?.kill();
        tween = gsap.to(ripple, {
          scale: 18,
          duration: 0.45,
          ease: "power2.out",
          onUpdate: apply,
        });
      };
      const onLeave = () => {
        tween?.kill();
        tween = gsap.to(ripple, {
          scale: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onUpdate: apply,
        });
      };

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      return () => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        tween?.kill();
      };
    },
    { scope: wrapRef, dependencies: [errored, loaded] }
  );

  return (
    <div
      ref={wrapRef}
      className={cn(
        // No right padding → portrait bleeds to viewport edge.
        // Left padding keeps a small gap from the text column on desktop.
        "relative h-full w-full bg-paper",
        "pl-4 pr-0 pt-4 pb-0 md:pl-6 md:pr-0 md:pt-6 md:pb-0 lg:pl-10 lg:pr-0 lg:pt-8 lg:pb-0",
        className
      )}
    >
      {/* Inner card */}
      <div
        data-portrait-card
        className="relative isolate h-full w-full overflow-hidden rounded-l-sm bg-paper-soft"
      >
        {/* Displacement filter for the hover ripple. scale=0 is identity, so
            the filter is inert until the GSAP tween raises it. */}
        <svg aria-hidden width="0" height="0" className="absolute">
          <filter id="portrait-ripple">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.012 0.02"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              ref={displaceRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>

        {/* Portrait — next/image handles WebP conversion + responsive srcSet */}
        {!errored && (
          <Image
            ref={imgRef as React.Ref<HTMLImageElement>}
            src={src}
            alt={alt}
            fill
            priority          // above-the-fold LCP element — never lazy load
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
              filter: "contrast(1.04) brightness(0.99) url(#portrait-ripple)",
              willChange: "transform",
            }}
          />
        )}

        {/* Signal-orange warmth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-color opacity-[0.08]"
          style={{
            background:
              "radial-gradient(70% 60% at 30% 75%, var(--signal) 0%, transparent 70%)",
          }}
        />

        {/* Left feather — blends into text column */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-32"
          style={{
            background:
              "linear-gradient(to right, var(--paper) 0%, rgba(245,241,232,0.6) 35%, transparent 100%)",
          }}
        />
        {/* Top feather */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16 md:h-24"
          style={{
            background:
              "linear-gradient(to bottom, var(--paper) 0%, rgba(245,241,232,0.45) 50%, transparent 100%)",
          }}
        />
        {/* Bottom feather */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 md:h-44"
          style={{
            background:
              "linear-gradient(to top, var(--paper) 0%, rgba(245,241,232,0.7) 40%, transparent 100%)",
          }}
        />

        {/* Subtle film grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Corner signature */}
        <div className="absolute bottom-5 right-5 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-3 opacity-60">
          sd · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
