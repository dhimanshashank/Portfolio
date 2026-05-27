"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * <SignalTrace>
 *
 * A continuous horizontal sine-wave path that scrolls slowly left — like an
 * oscilloscope reading a stable signal. Edges are masked with a horizontal
 * gradient so the loop seam is invisible and the trace appears to "come from
 * and go to nowhere."
 *
 * Pure SVG + CSS keyframe animation. No JS animation loop. Pauses under
 * prefers-reduced-motion via the global media query in globals.css.
 *
 * Tuning:
 *   amplitude  — peak height in px (default 4 — very restrained)
 *   frequency  — wavelengths per 1000 viewBox units
 *   density    — sample points per wavelength (higher = smoother curve)
 *   speed      — full-cycle seconds (lower = faster)
 */
export function SignalTrace({
  className,
  amplitude = 4,
  frequency = 3.2,
  density = 24,
  speed = 28,
  opacity = 0.32,
  strokeWidth = 1,
}: {
  className?: string;
  amplitude?: number;
  frequency?: number;
  density?: number;
  speed?: number;
  opacity?: number;
  strokeWidth?: number;
}) {
  // ViewBox is 2000 wide; the visual element is rendered at 200% width so the
  // 50% leftward translate seamlessly loops. The path repeats twice inside.
  const path = useMemo(() => {
    const WIDTH = 2000;
    const HEIGHT = 40;
    const midY = HEIGHT / 2;
    const totalSamples = Math.round(frequency * 2 * density); // 2 full cycles across 2000 wide
    const step = WIDTH / totalSamples;

    let d = "";
    for (let i = 0; i <= totalSamples; i++) {
      const x = i * step;
      // Two superimposed sines give it a less-mechanical "real signal" feel
      // without crossing into busy territory.
      const phase = (i / totalSamples) * frequency * 2 * Math.PI * 2;
      const y =
        midY +
        Math.sin(phase) * amplitude +
        Math.sin(phase * 2.7) * (amplitude * 0.25);
      d += `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(3)} `;
    }
    return d.trim();
  }, [amplitude, frequency, density]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
      style={{
        height: 40,
        // Mask both ends so the scrolling loop's edges fade into nothing.
        maskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
    >
      <svg
        viewBox="0 0 2000 40"
        preserveAspectRatio="none"
        className="signal-trace-svg block h-full"
        style={{
          width: "200%",
          // Custom property consumed by the keyframe — lets us animate from 0 → -25%
          // of the SVG (which equals -50% of the visible loop) for a seamless wrap.
          ["--signal-trace-speed" as string]: `${speed}s`,
        }}
      >
        <path
          d={path}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={opacity}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <style>{`
        @keyframes signal-trace-scroll {
          from { transform: translateX(0%); }
          to   { transform: translateX(-25%); }
        }
        .signal-trace-svg {
          animation: signal-trace-scroll var(--signal-trace-speed) linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .signal-trace-svg { animation: none; }
        }
      `}</style>
    </div>
  );
}
