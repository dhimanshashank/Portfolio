"use client";

import { CSSProperties } from "react";

/**
 * Hand-drawn SVG primitives that match the pencil-portrait aesthetic.
 *
 * Each mark is rendered with deliberately imperfect Bézier paths and a
 * slightly variable stroke — the kind of line a person draws, not the
 * kind a computer outputs. Pair these with serif type where a flourish
 * is needed without slipping into decoration.
 *
 *   SketchUnderline   — wavy double line under a word
 *   SketchArrow       — curved annotation arrow
 *   SketchCircle      — rough oval around a word
 *   SketchDivider     — wavy horizontal section break
 *   SketchAsterisk    — small drawn asterisk / margin star
 */

type SketchProps = {
  className?: string;
  style?: CSSProperties;
  /** Stroke color — defaults to currentColor so it inherits text color. */
  color?: string;
  /** Stroke width multiplier (1 = default). */
  weight?: number;
  /** Optional draw-in animation duration in ms. 0 = instant. */
  drawMs?: number;
};

// ──────────────────────────────────────────────────────────────────────────
// SketchUnderline — two slightly offset wavy lines, like a hand correcting
// itself. Place inside a `position: relative` parent that already has text.
// ──────────────────────────────────────────────────────────────────────────
export function SketchUnderline({
  className,
  style,
  color = "currentColor",
  weight = 1,
  drawMs = 0,
}: SketchProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "0.34em",
        overflow: "visible",
        ...style,
      }}
    >
      {/* Primary stroke — the main line */}
      <path
        d="M3 7 Q 28 3, 55 6.5 T 110 6 T 165 7 L 197 6"
        stroke={color}
        strokeWidth={1.4 * weight}
        strokeLinecap="round"
        fill="none"
        style={
          drawMs
            ? {
                strokeDasharray: 220,
                strokeDashoffset: 220,
                animation: `sketch-draw ${drawMs}ms cubic-bezier(0.7,0,0.3,1) forwards`,
              }
            : undefined
        }
      />
      {/* Secondary stroke — the "I lifted the pencil" trace */}
      <path
        d="M8 10 Q 50 7.5, 90 10.5 T 160 10 L 192 9.5"
        stroke={color}
        strokeWidth={0.8 * weight}
        strokeLinecap="round"
        fill="none"
        opacity={0.55}
        style={
          drawMs
            ? {
                strokeDasharray: 210,
                strokeDashoffset: 210,
                animation: `sketch-draw ${drawMs}ms ${drawMs * 0.3}ms cubic-bezier(0.7,0,0.3,1) forwards`,
              }
            : undefined
        }
      />
      <style>{`
        @keyframes sketch-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SketchArrow — curved annotation arrow. Default points down-and-left,
// suited for pointing from a margin note to body text. Flip via CSS scale.
// ──────────────────────────────────────────────────────────────────────────
export function SketchArrow({
  className,
  style,
  color = "currentColor",
  weight = 1,
  drawMs = 0,
}: SketchProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 80 80"
      className={className}
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <path
        d="M68 8 Q 50 22, 38 38 Q 26 54, 20 70"
        stroke={color}
        strokeWidth={1.5 * weight}
        strokeLinecap="round"
        fill="none"
        style={
          drawMs
            ? {
                strokeDasharray: 120,
                strokeDashoffset: 120,
                animation: `sketch-draw ${drawMs}ms cubic-bezier(0.7,0,0.3,1) forwards`,
              }
            : undefined
        }
      />
      {/* Arrowhead — two short strokes */}
      <path
        d="M20 70 L 26 60"
        stroke={color}
        strokeWidth={1.5 * weight}
        strokeLinecap="round"
        fill="none"
        style={
          drawMs
            ? {
                strokeDasharray: 16,
                strokeDashoffset: 16,
                animation: `sketch-draw ${drawMs * 0.4}ms ${drawMs * 0.9}ms cubic-bezier(0.7,0,0.3,1) forwards`,
              }
            : undefined
        }
      />
      <path
        d="M20 70 L 12 64"
        stroke={color}
        strokeWidth={1.5 * weight}
        strokeLinecap="round"
        fill="none"
        style={
          drawMs
            ? {
                strokeDasharray: 14,
                strokeDashoffset: 14,
                animation: `sketch-draw ${drawMs * 0.4}ms ${drawMs * 0.9}ms cubic-bezier(0.7,0,0.3,1) forwards`,
              }
            : undefined
        }
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SketchCircle — rough oval, like circling a word in a notebook
// ──────────────────────────────────────────────────────────────────────────
export function SketchCircle({
  className,
  style,
  color = "currentColor",
  weight = 1,
  drawMs = 0,
}: SketchProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <path
        d="M 12 32 Q 6 18, 30 12 Q 80 4, 130 8 Q 188 14, 192 30 Q 196 48, 150 54 Q 80 60, 30 54 Q 8 48, 12 32 Z"
        stroke={color}
        strokeWidth={1.5 * weight}
        strokeLinecap="round"
        fill="none"
        style={
          drawMs
            ? {
                strokeDasharray: 520,
                strokeDashoffset: 520,
                animation: `sketch-draw ${drawMs}ms cubic-bezier(0.7,0,0.3,1) forwards`,
              }
            : undefined
        }
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SketchDivider — wavy horizontal break between sections
// ──────────────────────────────────────────────────────────────────────────
export function SketchDivider({
  className,
  style,
  color = "currentColor",
  weight = 1,
}: Omit<SketchProps, "drawMs">) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 12"
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block", width: "100%", height: "10px", ...style }}
    >
      <path
        d="M2 6 Q 40 2, 80 6 T 160 6 T 240 6 T 320 6 T 398 6"
        stroke={color}
        strokeWidth={0.9 * weight}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SketchAsterisk — small drawn star for margin notes / dividers
// ──────────────────────────────────────────────────────────────────────────
export function SketchAsterisk({
  className,
  style,
  color = "currentColor",
  weight = 1,
}: Omit<SketchProps, "drawMs">) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <path d="M12 3 L 12 21" stroke={color} strokeWidth={1.2 * weight} strokeLinecap="round" fill="none" />
      <path d="M4 8 L 20 16" stroke={color} strokeWidth={1.2 * weight} strokeLinecap="round" fill="none" />
      <path d="M4 16 L 20 8" stroke={color} strokeWidth={1.2 * weight} strokeLinecap="round" fill="none" />
    </svg>
  );
}
