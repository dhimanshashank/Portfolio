"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/motion/use-gsap";
import { cn } from "@/lib/utils";

/**
 * <HorizontalScroll>
 *
 * Turns vertical scroll into horizontal movement of inner content. The user keeps
 * scrolling down with their mouse/trackpad; the inner track slides left.
 *
 * For the Phase 4 work showcase and Phase 3.5 architecture-evolution section.
 *
 * On mobile (≤768px) the horizontal effect is disabled and content stacks
 * vertically — horizontal scroll is unintuitive on small screens.
 */
export function HorizontalScroll({
  children,
  className,
  trackClassName,
  id,
}: {
  /** Place a flex-row of full-width items inside. Each child = one "screen". */
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  id?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrapperRef.current || !trackRef.current) return;

      // Skip horizontal effect on mobile — vertical stack is better UX.
      const mq = window.matchMedia("(max-width: 768px)");
      if (mq.matches) return;

      const track = trackRef.current;
      const scrollWidth = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -scrollWidth(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: () => `+=${scrollWidth()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: wrapperRef }
  );

  return (
    <section
      ref={wrapperRef}
      id={id}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        ref={trackRef}
        className={cn(
          "flex h-screen w-max items-stretch md:flex-row",
          // Fallback: stack vertically on mobile (no GSAP applied there)
          "max-md:h-auto max-md:w-full max-md:flex-col",
          trackClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
