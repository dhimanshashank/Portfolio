"use client";

import { useEffect, useState } from "react";

/**
 * <ScrollProgress>
 *
 * A 2px signal-orange line fixed to the very bottom of the viewport.
 * Width grows from 0% → 100% as the user scrolls from top → bottom.
 * Works on all screen sizes — not hidden on mobile.
 *
 * Intentionally lightweight: one scroll listener, one RAF guard,
 * no GSAP dependency for something this small.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? scrolled / total : 0);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Set initial value (in case of page reload mid-scroll)
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-0 left-0 right-0 z-50 h-[2px] pointer-events-none"
      style={{ background: "var(--hairline)" }}
    >
      <div
        className="h-full origin-left"
        style={{
          width: `${progress * 100}%`,
          background: "var(--signal)",
          transition: "width 0.08s linear",
        }}
      />
    </div>
  );
}
