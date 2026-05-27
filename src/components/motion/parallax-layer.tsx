"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { cn } from "@/lib/utils";

/**
 * <ParallaxLayer>
 *
 * Translates its content at a fraction (or multiplier) of scroll speed.
 * Negative `speed` moves it opposite to scroll for a deeper-background feel.
 *
 *   speed:  0.0  → static (no motion)
 *           0.2  → background — drifts slowly
 *           0.5  → midground
 *           1.0  → matches scroll (no parallax)
 *          -0.3  → reverse (rises as page scrolls down)
 */
export function ParallaxLayer({
  children,
  speed = 0.3,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      // Calculate the total scroll distance so the element finishes its movement
      // at the bottom of the viewport, not before — feels more natural.
      const yEnd = `${speed * 100}%`;

      gsap.fromTo(
        ref.current,
        { yPercent: -speed * 50 },
        {
          yPercent: speed * 50,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    },
    { scope: ref, dependencies: [speed] }
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
