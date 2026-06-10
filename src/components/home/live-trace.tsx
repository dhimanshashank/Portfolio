"use client";

import { useEffect, useRef } from "react";

/**
 * <LiveTrace> — interactive oscilloscope divider.
 *
 * A quiet sine trace that breathes on its own; bring a cursor near it and
 * the waveform swells around the pointer while a signal-orange probe dot
 * rides the curve at your x position. One ink stroke + one orange dot —
 * an instrument, not a toy.
 *
 * Touch devices and prefers-reduced-motion get a static gentle wave
 * (drawn once, no rAF). The loop also parks itself while the section is
 * off-screen so it never burns frames in the background.
 */

const VIEW_W = 600;
const VIEW_H = 80;
const MID = VIEW_H / 2;
const STEP = 6; // px between sample points
const BASE_AMP = 6;
const BOOST = 2.4; // extra amplitude multiplier at the pointer
const SIGMA = 70; // spread of the pointer's influence

function wavePath(t: number, px: number | null): string {
  let d = "";
  for (let x = 0; x <= VIEW_W; x += STEP) {
    const env =
      px === null
        ? 1
        : 1 + BOOST * Math.exp(-((x - px) ** 2) / (2 * SIGMA * SIGMA));
    const y =
      MID +
      Math.sin(x * 0.035 + t * 1.4) * BASE_AMP * env +
      Math.sin(x * 0.011 - t * 0.6) * 2;
    d += `${x === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
}

function waveY(t: number, px: number, x: number): number {
  const env = 1 + BOOST * Math.exp(-((x - px) ** 2) / (2 * SIGMA * SIGMA));
  return (
    MID +
    Math.sin(x * 0.035 + t * 1.4) * BASE_AMP * env +
    Math.sin(x * 0.011 - t * 0.6) * 2
  );
}

export function LiveTrace({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const probeRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    const probe = probeRef.current;
    if (!wrap || !path || !probe) return;

    const motionOk = window.matchMedia(
      "(prefers-reduced-motion: no-preference)"
    ).matches;
    if (!motionOk) {
      path.setAttribute("d", wavePath(0, null));
      return;
    }

    let raf = 0;
    let running = false;
    let t = 0;
    let pointerX: number | null = null;

    const frame = () => {
      t += 0.016;
      path.setAttribute("d", wavePath(t, pointerX));
      if (pointerX !== null) {
        probe.setAttribute("cx", String(pointerX));
        probe.setAttribute("cy", String(waveY(t, pointerX, pointerX)));
        probe.setAttribute("opacity", "1");
      } else {
        probe.setAttribute("opacity", "0");
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Map client x → viewBox x (the svg preserves aspect, width-driven).
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = wrap.getBoundingClientRect();
      pointerX = ((e.clientX - r.left) / r.width) * VIEW_W;
    };
    const onLeave = () => {
      pointerX = null;
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.1 }
    );
    io.observe(wrap);

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-16 w-full md:h-20"
        aria-hidden
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          d=""
          fill="none"
          stroke="var(--ink)"
          strokeOpacity="0.35"
          strokeWidth="1.1"
        />
        <circle ref={probeRef} r="3" fill="var(--signal)" opacity="0" />
      </svg>
    </div>
  );
}
