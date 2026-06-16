"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";

/**
 * <CustomCursor> — ink dot + trailing ring, ported from the parent portfolio.
 * The native cursor stays; this is an annotation layered on top. Gated hard to
 * (pointer: fine) + (hover: hover) + (prefers-reduced-motion: no-preference) so
 * touch / reduced-motion devices get nothing.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ok = window.matchMedia(
      "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)",
    );
    if (!ok.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.38, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.38, ease: "power3.out" });

    let visible = false;

    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25, overwrite: "auto" });
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
    };

    const INTERACTIVE = "a, button, [role='button'], [data-cursor]";

    const onOver = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest(INTERACTIVE)) return;
      gsap.to(ring, {
        scale: 1.8,
        borderColor: "var(--signal)",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onOut = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest(INTERACTIVE)) return;
      const to = e.relatedTarget;
      if (to instanceof Element && to.closest(INTERACTIVE)) return;
      gsap.to(ring, {
        scale: 1,
        borderColor: "var(--cursor-ring)",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div aria-hidden className="hidden md:block">
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] h-[5px] w-[5px] rounded-full bg-ink"
        style={{ opacity: 0 }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] h-[30px] w-[30px] rounded-full border"
        style={
          {
            opacity: 0,
            "--cursor-ring": "color-mix(in srgb, var(--ink) 35%, transparent)",
            borderColor: "var(--cursor-ring)",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
