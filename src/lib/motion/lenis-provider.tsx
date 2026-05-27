"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "./gsap";

/**
 * LenisProvider — wires Lenis smooth scroll to the whole document and keeps
 * GSAP's ScrollTrigger in lockstep with it.
 *
 * Why this pattern:
 * - Lenis virtualises the scroll position. If ScrollTrigger reads from window
 *   directly, pinned sections drift. We feed Lenis's `scroll` event into
 *   ScrollTrigger.update() so triggers fire on the right virtual offset.
 * - We use `gsap.ticker` to drive Lenis's RAF loop instead of requestAnimationFrame
 *   directly — GSAP becomes the single clock for everything in the app, which is
 *   the official recommended pattern from the GSAP team.
 * - Respects prefers-reduced-motion: if the user has it on, we hand control back
 *   to native scroll and skip Lenis entirely. ScrollTrigger still works on native.
 */

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Reduced motion → skip Lenis entirely. Native scroll is fine and safer.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    // Lazy import gsap only to grab the ticker — keeps the RAF clock unified.
    let raf: ((time: number) => void) | null = null;

    import("gsap").then(({ gsap }) => {
      const lenis = new Lenis({
        // Curve & duration tuned for cinematic feel without lag. Lower duration
        // = snappier; higher = floatier. 1.1 sits right in the middle.
        duration: 1.1,
        // expo-out: fast start, glides to a stop. Same family as our --ease-out-expo.
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        // smoothWheel only — touch scroll should stay native for feel & accessibility.
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      // 1. Lenis → ScrollTrigger sync.
      lenis.on("scroll", () => ScrollTrigger.update());

      // 2. GSAP ticker → Lenis RAF. Single clock for the app.
      raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      // GSAP's ticker smooths the dt internally; disabling lag-smoothing keeps
      // scroll-pinned things from snapping if a frame hitches.
      gsap.ticker.lagSmoothing(0);

      // 3. ScrollTrigger refresh on resize (Lenis emits its own resize too).
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
