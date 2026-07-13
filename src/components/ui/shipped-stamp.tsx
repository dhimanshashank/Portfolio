"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * <ShippedStamp>
 *
 * A rubber-stamp impression — double rounded border, mono caps, ink bleed
 * via a turbulence displacement so no two edges print clean. Thumps in
 * when scrolled into view: starts big and hovering over the paper, slams
 * down to rest with a tiny rotation settle, the way a hand stamps a page.
 *
 * Color defaults to the pressed-signal red-orange; pass any CSS color.
 */
export function ShippedStamp({
  label = "SHIPPED",
  rotate = -8,
  color = "var(--signal-low)",
  className,
}: {
  label?: string;
  rotate?: number;
  color?: string;
  className?: string;
}) {
  const id = useId();
  const filterId = `stamp-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const reduce = useReducedMotion();

  // Width scales with label length so long labels don't squash.
  const w = Math.max(96, 26 + label.length * 11);
  const h = 34;

  return (
    <motion.span
      aria-hidden
      className={cn("pointer-events-none inline-block select-none", className)}
      initial={
        reduce
          ? { opacity: 0.85, rotate }
          : { opacity: 0, scale: 1.45, rotate: rotate - 5 }
      }
      whileInView={{ opacity: 0.85, scale: 1, rotate }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{
        duration: 0.3,
        ease: [0.2, 1.4, 0.4, 1],
      }}
      style={{ width: w, mixBlendMode: "multiply" }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
        <defs>
          {/* Ink bleed — jitters every edge so the print looks pressed */}
          <filter id={filterId} x="-8%" y="-20%" width="116%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.19"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.7" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`} style={{ color }}>
          {/* Outer + inner border — hand-cut rounded rects */}
          <rect
            x="1.5"
            y="1.5"
            width={w - 3}
            height={h - 3}
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="5.5"
            y="5.5"
            width={w - 11}
            height={h - 11}
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.75"
          />
          <text
            x={w / 2}
            y={h / 2 + 0.5}
            textAnchor="middle"
            dominantBaseline="central"
            fill="currentColor"
            style={{
              font: "700 11px var(--font-jetbrains), ui-monospace, monospace",
              letterSpacing: "0.24em",
            }}
          >
            {label}
          </text>
        </g>
      </svg>
    </motion.span>
  );
}
