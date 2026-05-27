"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/motion/use-gsap";
import { cn } from "@/lib/utils";

/**
 * <PinnedSection>
 *
 * Pins itself for `length` × viewport-heights of scroll. The render prop receives
 * a `progress` element ref — wire it to a CSS variable, a counter, anything you
 * want scrub-driven. For multi-step timelines, prefer attaching a gsap.timeline()
 * via useGSAP scoped to the same ref.
 *
 * For the Phase 2 Manifesto Scroll and Phase 3 architecture pin sections.
 */
export function PinnedSection({
  children,
  length = 3,
  className,
  id,
}: {
  /** Children render inside the pinned viewport. */
  children: ReactNode;
  /** How many viewport-heights of scroll the pin lasts. 3 = three screens. */
  length?: number;
  className?: string;
  id?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrapperRef.current || !pinRef.current) return;

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * length}`,
        pin: pinRef.current,
        pinSpacing: true,
        anticipatePin: 1,
      });
    },
    { scope: wrapperRef, dependencies: [length] }
  );

  return (
    <section
      ref={wrapperRef}
      id={id}
      className={cn("relative", className)}
      style={{ height: `${(length + 1) * 100}vh` }}
    >
      <div
        ref={pinRef}
        className="h-screen w-full overflow-hidden"
      >
        {children}
      </div>
    </section>
  );
}
