"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "./gsap";

/**
 * LenisProvider — smooth scroll wired to GSAP's ScrollTrigger, ported from the
 * parent portfolio. GSAP's ticker drives Lenis's RAF so there's one clock for
 * the whole app, and ScrollTrigger reads Lenis's virtual scroll. Respects
 * prefers-reduced-motion (skips Lenis, native scroll still works).
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    let raf: ((time: number) => void) | null = null;

    import("gsap").then(({ gsap }) => {
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        smoothWheel: true,
        // Never swallow touch on form controls — keeps mobile keyboard working.
        prevent: (node: Element) => {
          const tag = node.tagName;
          return (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            (node as HTMLElement).isContentEditable
          );
        },
      });
      lenisRef.current = lenis;

      lenis.on("scroll", () => ScrollTrigger.update());
      raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.refresh();
    });

    return () => {
      if (raf) {
        import("gsap").then(({ gsap }) => gsap.ticker.remove(raf!));
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
