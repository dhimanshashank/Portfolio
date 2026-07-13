"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  SketchAsterisk,
  SketchArrow,
  SketchCircle,
  SketchUnderline,
} from "./sketch-marks";

const MARKS = {
  asterisk: SketchAsterisk,
  arrow: SketchArrow,
  circle: SketchCircle,
  underline: SketchUnderline,
} as const;

/**
 * <MarginDoodle>
 *
 * A small sketch mark that pencils itself into the page margin the first
 * time it scrolls into view — the working-sketchbook detail: someone was
 * here, annotating. Absolutely positioned by the caller (the parent must
 * be `relative`); stays out of the reading column and off of mobile.
 *
 * Draw-in runs once per mount via IntersectionObserver. Reduced-motion
 * users get the mark instantly (the global CSS kills the stroke animation).
 *
 * Deliberately md+ only: callers position these into gutter coordinates
 * (e.g. right-[4.5%]) that don't exist at phone widths — 24px of container
 * padding means a doodle would sit on top of the text column. Mobile keeps
 * its sketch identity via stamps, hatch dividers and sketch-edge frames.
 */
export function MarginDoodle({
  mark = "asterisk",
  className,
  style,
  size = 22,
  rotate = 0,
  opacity = 0.35,
  drawMs = 700,
}: {
  mark?: keyof typeof MARKS;
  className?: string;
  style?: CSSProperties;
  /** Width of the mark in px (height follows the mark's aspect). */
  size?: number;
  rotate?: number;
  opacity?: number;
  drawMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "-12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const Mark = MARKS[mark];

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute hidden text-ink-3 md:block",
        className
      )}
      style={{
        width: size,
        opacity,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {seen && <Mark drawMs={drawMs} />}
    </div>
  );
}
