"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";

/**
 * <Magnetic> — pointer-attraction wrapper for CTAs.
 *
 * Wraps exactly one interactive child. Within hover range the wrapper
 * translates a few pixels toward the pointer; on leave it springs back
 * with an elastic ease. The child renders untouched — layout, focus, and
 * tap targets are unaffected, so on touch / reduced-motion devices this
 * is a no-op passthrough (listeners never attach).
 *
 * `strength` is the max translation in px. Keep it ≤10 — the effect should
 * read as weight, not as the button running away.
 */
export function Magnetic({
  children,
  strength = 8,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ok = window.matchMedia(
      "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)"
    );
    if (!ok.matches) return;

    const el = ref.current;
    if (!el) return;

    const toX = gsap.quickTo(el, "x", { duration: 0.3, ease: "power2.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.3, ease: "power2.out" });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const relX = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const relY = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      toX(gsap.utils.clamp(-1, 1, relX) * strength);
      toY(gsap.utils.clamp(-1, 1, relY) * strength);
    };

    const onLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return (
    <span ref={ref} className={className} style={{ display: "inline-block", willChange: "transform" }}>
      {children}
    </span>
  );
}
