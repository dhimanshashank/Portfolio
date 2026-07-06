"use client";

import { useRef } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/motion/use-gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

/**
 * <PaperPlaneFlight> — a hand-drawn paper plane that flies down the homepage,
 * scrubbed to scroll.
 *
 * Vocabulary (per the sketch-marks aesthetic): imperfect Bézier strokes,
 * round caps, ink on paper, one signal-orange tick. The dotted trail draws
 * itself behind the plane (line-drawing reveal via a mask, so the dashes
 * stay hand-placed instead of stretching).
 *
 * Motion design:
 *   - MotionPath + ScrollTrigger scrub(1.4) — the lag IS the glide/inertia.
 *   - autoRotate keeps the nose on the flight line.
 *   - 3D: the plane is an HTML layer (CSS perspective is reliable there,
 *     unlike 3D transforms on SVG children). Scroll velocity pitches it
 *     (rotationX) and heading changes bank it (rotationY) — flick-scroll
 *     and the plane dives into the turn, stop and it settles. Decorative
 *     motion tied to user input, spring-smoothed via short power2 tweens.
 *   - Altitude: scale breathes across the flight (far → near → far).
 *   - Idle float: ±2px sine bob so it never sits dead while you read.
 *
 * Responsive: the path is generated from measured page size (re-measured on
 * every ScrollTrigger refresh, so pinned-section spacers are included).
 * Reduced motion: everything is gated behind a gsap.matchMedia — the layer
 * simply never becomes visible.
 */

/** Flight waypoints as fractions of page width/height. */
const WAYPOINTS = [
  { x: 0.80, y: 0.025 },
  { x: 0.14, y: 0.16 },
  { x: 0.86, y: 0.30 },
  { x: 0.12, y: 0.46 },
  { x: 0.80, y: 0.60 },
  { x: 0.16, y: 0.74 },
  { x: 0.84, y: 0.87 },
  { x: 0.32, y: 0.965 },
];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function PaperPlaneFlight() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const trail = trailRef.current;
      const maskPath = maskRef.current;
      const plane = planeRef.current;
      const tilt = tiltRef.current;
      if (!root || !trail || !maskPath || !plane || !tilt) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ── Path layout — regenerated from real page size on every refresh ──
        let pathLength = 0;

        const layoutPath = () => {
          const w = root.clientWidth;
          const h = root.clientHeight;
          if (!w || !h) return;

          // On narrow screens pull waypoints toward center so the plane
          // never hugs the screen edge where thumbs live.
          const squeeze = w < 768 ? 0.72 : 1;
          const pts = WAYPOINTS.map((p) => ({
            x: (0.5 + (p.x - 0.5) * squeeze) * w,
            y: p.y * h,
          }));

          const raw = MotionPathPlugin.arrayToRawPath(pts, { curviness: 1.4 });
          const d = MotionPathPlugin.rawPathToString(raw);
          trail.setAttribute("d", d);
          maskPath.setAttribute("d", d);

          pathLength = trail.getTotalLength();
          // The mask stroke reveals the dotted trail: one dash the length of
          // the whole path, slid from fully-hidden to fully-shown.
          maskPath.style.strokeDasharray = `${pathLength}`;
        };

        layoutPath();

        // ── Reactive 3D — smoothed so it feels sprung, not wired ─────────
        let lastHeading = 0;
        const pitchTo = gsap.quickTo(tilt, "rotationX", {
          duration: 0.55,
          ease: "power2.out",
        });
        const bankTo = gsap.quickTo(tilt, "rotationY", {
          duration: 0.6,
          ease: "power2.out",
        });

        // ── The flight timeline — progress-driven, no ScrollTrigger ─────
        // Deliberately NOT scrubbed via ScrollTrigger: during refresh, other
        // sections' pin spacers are temporarily reverted, so any trigger
        // geometry ("bottom bottom", "max", function values) resolves against
        // the unspaced page and the flight finishes half-way down. Instead a
        // paused timeline is driven from live scrollY / maxScroll each tick —
        // immune to refresh ordering, and the smoothing gap doubles as the
        // velocity signal for the 3D pitch.
        const tl = gsap.timeline({ paused: true });

        // Every child is laid out on a 0→1 duration so the timeline's total
        // is exactly 1 and progress maps 1:1 to scroll fraction. (GSAP's
        // default duration is 0.5 — omitting these once made the flight
        // finish at half-scroll.)
        tl.to(
          plane,
          {
            motionPath: {
              path: trail,
              align: trail,
              alignOrigin: [0.5, 0.5],
              autoRotate: true,
            },
            duration: 1,
            ease: "none",
          },
          0
        )
          // Trail draws itself just behind the plane.
          .fromTo(
            maskPath,
            { strokeDashoffset: () => pathLength },
            { strokeDashoffset: 0, duration: 1, ease: "none" },
            0
          )
          // Appear on the first breath of scroll, bow out at the very end.
          .fromTo(
            root,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.02, ease: "none" },
            0
          )
          .to(root, { autoAlpha: 0, duration: 0.04, ease: "none" }, 0.96)
          // Altitude breathing — the plane swings nearer and farther.
          .to(
            tilt,
            {
              keyframes: [
                { scale: 1.14, duration: 0.22 },
                { scale: 0.86, duration: 0.26 },
                { scale: 1.08, duration: 0.26 },
                { scale: 0.94, duration: 0.26 },
              ],
              ease: "none",
            },
            0
          );

        // ── The hand-rolled scrub — exponential chase toward scroll pos ──
        // Lenis animates the real scrollTop, so reading window.scrollY per
        // tick already yields smoothed values; the extra chase adds glide.
        let target = 0;
        const readScroll = () => {
          const max = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight
          );
          target = clamp(window.scrollY / max, 0, 1);
        };
        readScroll();
        // Snap to the current position on load (mid-page reload) — no fly-in.
        tl.progress(target);
        window.addEventListener("scroll", readScroll, { passive: true });

        // Max progress per 60fps frame. This is the smoothness governor: on
        // a fast flick the eased chase would whip the plane through curves
        // (heading spins, pitch pegged at its clamp — reads as "breaking").
        // Capping speed means the plane GLIDES to catch up — full-page in
        // ~1.5s worst case — and attitude stays continuous.
        const MAX_STEP = 0.011;
        let smoothedBank = 0;

        const tick = () => {
          // deltaRatio spikes after a janky frame or a background-tab pause;
          // uncapped it would scale the speed cap with it and the plane
          // would jump. Clamp to ≤3 frames' worth — stalls become glides.
          const dtr = Math.min(gsap.ticker.deltaRatio(60), 3);
          const p = tl.progress();
          const gap = target - p;
          const settled = Math.abs(gap) < 0.00005;

          let step = 0;
          if (!settled) {
            // Eased chase with a hard speed cap.
            step = clamp(
              gap * Math.min(1, (dtr / 60) * 4.2),
              -MAX_STEP * dtr,
              MAX_STEP * dtr
            );
            tl.progress(p + step);
          }

          // Pitch from ACTUAL per-frame velocity (not the raw gap): ramps
          // smoothly with speed, holds a steady dive at the cap instead of
          // flickering against a clamp, and eases upright as motion ends.
          const speed = clamp(step / dtr / MAX_STEP, -1, 1); // −1..1
          pitchTo(speed * 16);

          // Bank from heading change, low-passed so S-curve direction flips
          // roll the plane over ~150ms instead of snapping frame-to-frame.
          const heading = Number(gsap.getProperty(plane, "rotation"));
          const headingRate = settled ? 0 : (heading - lastHeading) / dtr;
          lastHeading = heading;
          smoothedBank +=
            (clamp(headingRate * 4, -24, 24) - smoothedBank) *
            Math.min(1, 0.14 * dtr);
          bankTo(smoothedBank);
        };
        gsap.ticker.add(tick);

        // ── Idle float — never dead in the air ──────────────────────────
        const float = gsap.to(floatRef.current, {
          y: -2.5,
          rotation: 1.6,
          duration: 1.9,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        // Re-measure AFTER each ScrollTrigger refresh completes (pin spacers
        // applied, so root.clientHeight is the true rendered height), then
        // invalidate so motionPath + dashoffset re-resolve. Covers resize,
        // font/image loads, anything that changes page height.
        const relayout = () => {
          layoutPath();
          tl.invalidate();
          readScroll();
        };
        ScrollTrigger.addEventListener("refresh", relayout);

        return () => {
          ScrollTrigger.removeEventListener("refresh", relayout);
          window.removeEventListener("scroll", readScroll);
          gsap.ticker.remove(tick);
          float.kill();
          tl.kill();
        };
      });
    },
    { scope: rootRef as React.RefObject<HTMLElement> }
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      style={{ opacity: 0 }}
    >
      {/* Dotted pencil trail — revealed progressively by the mask. */}
      <svg className="absolute inset-0 h-full w-full" fill="none">
        <defs>
          <mask id="pp-trail-reveal" maskUnits="userSpaceOnUse">
            <path
              ref={maskRef}
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </mask>
        </defs>
        <path
          ref={trailRef}
          mask="url(#pp-trail-reveal)"
          stroke="var(--ink)"
          strokeOpacity="0.28"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="0.5 9"
          fill="none"
        />
      </svg>

      {/* The plane — HTML layer for trustworthy CSS 3D. */}
      <div
        ref={planeRef}
        className="absolute left-0 top-0 h-[34px] w-[46px] will-change-transform"
        style={{ perspective: "480px" }}
      >
        <div ref={tiltRef} className="h-full w-full [transform-style:preserve-3d]">
          <div ref={floatRef} className="h-full w-full">
            {/* Hand-drawn dart, nose pointing right (autoRotate origin).
                Two translucent fills fake the fold: lit top wing, shadowed
                underside — that's what reads as "folded paper", not flat
                clip-art. Strokes wobble on purpose (see sketch-marks.tsx). */}
            <svg
              viewBox="0 0 48 34"
              className="h-full w-full"
              style={{
                filter: "drop-shadow(0 5px 4px rgba(26,24,21,0.14))",
              }}
              fill="none"
            >
              {/* top wing — lit */}
              <path
                d="M46 17 L5 4.5 Q10.5 11.5 13.6 16.4 Z"
                fill="var(--ink)"
                fillOpacity="0.045"
              />
              {/* bottom wing — underside shadow (the 3D cue) */}
              <path
                d="M46 17 L8 29.5 Q11 22.5 13.6 16.8 Z"
                fill="var(--ink)"
                fillOpacity="0.11"
              />
              {/* outline strokes — slightly imperfect, a person's hand */}
              <path
                d="M46 17 Q 29.5 11.2, 5 4.5"
                stroke="var(--ink)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M5 4.5 Q 10.5 11.5, 13.6 16.4"
                stroke="var(--ink)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <path
                d="M46 17 Q 28.5 23.4, 8 29.5"
                stroke="var(--ink)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M8 29.5 Q 11 22.5, 13.6 16.8"
                stroke="var(--ink)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              {/* center fold — the spine, lighter like a second pencil pass */}
              <path
                d="M45.5 17 Q 30 16.2, 14 16.6"
                stroke="var(--ink)"
                strokeWidth="1"
                strokeOpacity="0.55"
                strokeLinecap="round"
              />
              {/* signal tick near the nose — the brand accent */}
              <path
                d="M39.5 15.4 L43.6 16.5"
                stroke="var(--signal)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
