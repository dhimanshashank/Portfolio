"use client";

import { useEffect, useState } from "react";

/**
 * <InitialCurtain>
 *
 * Cold-load ceremony. Plays once on every fresh page load (and hard reload).
 * Two ink panels are already closed when the page paints; a signal-orange
 * registration tick + Delhi coordinates fade in across a long hold, then
 * the tick + coordinates fade away, then the panels split apart cleanly.
 *
 * Timeline (≈2360ms):
 *
 *   t = 0       panels already closed, ink + paper grain
 *   t = 200     signal-orange tick fades in at centre
 *   t = 360     coordinates fade in (28°36'N · 77°12'E)
 *   t = 520     place line fades in (New Delhi · IN)
 *   t = 1600    tick + coords + place begin fading out (200ms)
 *   t = 1800    hold ends, panels start splitting (560ms open) — content
 *               already gone so the seam reveals a clean ink field
 *   t = 2360    panels fully off-screen
 *   t = 2460    component unmounts itself
 *
 * Why this lives separate from <RouteTransition>:
 *   - SSR friendliness — panels render closed in the initial HTML so there's
 *     no flash of content before the curtain appears
 *   - Pure CSS animations (no JS state during the ceremony) — works before
 *     hydration, doesn't add to JS execution time
 *   - Reduced-motion handled via @media query so SSR + reduced-motion users
 *     never see the panels at all (no first-paint flash)
 */
export function InitialCurtain() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Total ceremony is 2360ms; add a small buffer so the unmount lands
    // after the open animation visibly completes.
    const t = setTimeout(() => setDone(true), 2460);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  return (
    <div aria-hidden className="initial-curtain-root">
      {/* Top + bottom panels — start at translateY(0), animate off-screen */}
      <div className="initial-curtain-panel initial-curtain-top">
        <span className="initial-curtain-grain" />
      </div>
      <div className="initial-curtain-panel initial-curtain-bottom">
        <span className="initial-curtain-grain" />
      </div>

      {/* Centered content stack — signal tick + coordinates */}
      <div className="initial-curtain-content">
        <span className="initial-curtain-tick" />

        <p className="initial-curtain-coords font-mono">
          28°36&apos;N &nbsp;·&nbsp; 77°12&apos;E
        </p>
        <p className="initial-curtain-place font-mono">
          New Delhi · IN
        </p>
      </div>

      <style>{`
        .initial-curtain-root {
          position: fixed;
          inset: 0;
          z-index: 110;
          pointer-events: none;
        }

        .initial-curtain-panel {
          position: absolute;
          left: 0;
          right: 0;
          height: 50%;
          background: var(--ink);
          will-change: transform;
        }
        .initial-curtain-top {
          top: 0;
          transform: translateY(0);
          animation: initial-curtain-up 560ms 1800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .initial-curtain-bottom {
          bottom: 0;
          transform: translateY(0);
          animation: initial-curtain-down 560ms 1800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .initial-curtain-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        .initial-curtain-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          color: var(--bone);
          /* No unified content-out here — each child owns its own exit so
             the tick can collapse to a dot while the coords just fade. */
        }

        .initial-curtain-tick {
          display: block;
          width: 72px;
          height: 2px;
          background: var(--signal);
          transform-origin: center;
          opacity: 0;
          /* Fade in (320ms @ 200ms) then collapse to a dot + fade out
             (200ms @ 1600ms). Two independent animations on the same
             element — non-overlapping, so they don't fight. */
          animation:
            initial-curtain-tick-in 320ms 200ms ease-out forwards,
            initial-curtain-tick-out 200ms 1600ms ease-out forwards;
        }

        .initial-curtain-coords {
          font-size: 13px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--bone-2);
          margin: 0;
          opacity: 0;
          animation:
            initial-curtain-coords-in 360ms 360ms ease-out forwards,
            initial-curtain-text-out 200ms 1600ms ease-out forwards;
        }
        .initial-curtain-place {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--bone-3);
          margin: 0;
          opacity: 0;
          animation:
            initial-curtain-coords-in 360ms 520ms ease-out forwards,
            initial-curtain-text-out 200ms 1600ms ease-out forwards;
        }

        @keyframes initial-curtain-up {
          to { transform: translateY(-100%); }
        }
        @keyframes initial-curtain-down {
          to { transform: translateY(100%); }
        }
        @keyframes initial-curtain-tick-in {
          to { opacity: 1; }
        }
        @keyframes initial-curtain-tick-out {
          /* Line collapses horizontally to a 2-3px dot first, then fades.
             Using scaleX keeps the element centered on its midpoint. */
          0%   { transform: scaleX(1);    opacity: 1; }
          60%  { transform: scaleX(0.04); opacity: 1; }
          100% { transform: scaleX(0.04); opacity: 0; }
        }
        @keyframes initial-curtain-coords-in {
          to { opacity: 0.92; }
        }
        @keyframes initial-curtain-text-out {
          to { opacity: 0; }
        }

        /* Reduced motion — hide entirely from first paint, no animation.
           Using display: none so the panels aren't briefly visible before
           JS unmounts the component. */
        @media (prefers-reduced-motion: reduce) {
          .initial-curtain-root { display: none; }
        }
      `}</style>
    </div>
  );
}
