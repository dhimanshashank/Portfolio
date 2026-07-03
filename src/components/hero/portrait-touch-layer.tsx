"use client";

import { useEffect, useRef } from "react";

/**
 * <PortraitTouchLayer>
 *
 * Mobile-only touch feedback for the hero portrait: tapping it sends a
 * signal-orange ripple out from the touch point. Purely event-driven (no
 * RAF loop, no React state per ripple — rings are appended to the DOM and
 * self-remove), so it costs nothing at idle.
 *
 * Gated to touch + motion-ok. On desktop / reduced-motion the layer stays
 * pointer-events-none and does nothing. Never blocks scroll (passive
 * listener, no touch-action override).
 */
export function PortraitTouchLayer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ok = window.matchMedia(
      "(hover: none) and (prefers-reduced-motion: no-preference)"
    ).matches;
    if (!ok) return;

    el.style.pointerEvents = "auto";

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const ring = document.createElement("span");
      ring.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:14px;height:14px;margin:-7px 0 0 -7px;border:1.5px solid var(--signal);border-radius:50%;pointer-events:none;`;
      el.appendChild(ring);

      const anim = ring.animate(
        [
          { transform: "scale(0.35)", opacity: 0.85 },
          { transform: "scale(6)", opacity: 0 },
        ],
        { duration: 620, easing: "cubic-bezier(0.16,1,0.3,1)" }
      );
      anim.onfinish = () => ring.remove();
    };

    el.addEventListener("pointerdown", onDown, { passive: true });
    return () => el.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
    />
  );
}
