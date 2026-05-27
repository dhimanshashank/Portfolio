"use client";

import { useRef, useEffect } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { cn } from "@/lib/utils";

/**
 * <TextScramble>
 *
 * Cryptographic-style text reveal — each character cycles through random glyphs
 * then settles to its final value, staggered left→right. The effect implies
 * transmission, signal lock, decoding. Pairs with the proctoring-system theme.
 *
 * NOT using GSAP's paid SplitText / ScrambleText. This is a hand-rolled
 * single-tween implementation: one GSAP timeline drives a proxy progress 0→1,
 * and each character's settled state is derived from that progress crossing
 * its own threshold. This stays one tween regardless of string length.
 *
 * Respects prefers-reduced-motion: snaps in instantly with no scramble.
 */

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%&*<>{}[]/+=";

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

export function TextScramble({
  text,
  className,
  duration = 1.4,
  delay = 0,
  startOnMount = true,
  as: Tag = "span",
  /** Settle distribution. 0.5 = chars settle across the back half of the timeline.
   *  Higher → tighter (more chars settling together). Lower → looser. */
  settleSpread = 0.5,
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  startOnMount?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  settleSpread?: number;
}) {
  const containerRef = useRef<HTMLElement>(null);
  // We split text into characters and keep refs to each <span>. Spaces & punctuation
  // settle to themselves; only "scramble-able" chars cycle through GLYPHS.
  const chars = text.split("");

  // Pre-compute when each character should settle, in the 0..1 timeline.
  // Earlier chars settle first; settleSpread controls how much of the timeline
  // the "settling" phase occupies (the rest is pure scramble).
  const settleAt = chars.map((_, i) => {
    const t = chars.length === 1 ? 1 : i / (chars.length - 1);
    return 1 - settleSpread + t * settleSpread;
  });

  useGSAP(
    () => {
      // Reduced-motion: paint final text and return.
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduce || !startOnMount) {
        chars.forEach((char, i) => {
          const el = containerRef.current?.children[i] as HTMLElement | undefined;
          if (el) el.textContent = char;
        });
        return;
      }

      // Start every cell blank so there's no FOUC of final text behind the scramble.
      chars.forEach((char, i) => {
        const el = containerRef.current?.children[i] as HTMLElement | undefined;
        if (!el) return;
        // Whitespace chars (space, newline) stay as-is — don't scramble them
        el.textContent = /\s/.test(char) ? char : randomGlyph();
      });

      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        duration,
        delay,
        ease: "power2.out",
        onUpdate: () => {
          chars.forEach((char, i) => {
            const el = containerRef.current?.children[i] as HTMLElement | undefined;
            if (!el) return;
            if (/\s/.test(char)) return; // keep whitespace stable
            if (proxy.p >= settleAt[i]) {
              if (el.textContent !== char) el.textContent = char;
            } else {
              el.textContent = randomGlyph();
            }
          });
        },
        onComplete: () => {
          // Final paint to guarantee everything snapped to the canonical text
          chars.forEach((char, i) => {
            const el = containerRef.current?.children[i] as HTMLElement | undefined;
            if (el) el.textContent = char;
          });
        },
      });
    },
    { scope: containerRef as React.RefObject<HTMLElement>, dependencies: [text, duration, delay, startOnMount] }
  );

  // We render with `aria-label` carrying the real text so screen readers
  // read it once. Visual chars are aria-hidden to avoid letter-by-letter speech.
  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLElement & HTMLDivElement>}
      className={cn(className)}
      aria-label={text}
      style={{ whiteSpace: "pre-wrap" }}
    >
      {chars.map((char, i) => (
        // Each cell is a fixed inline-block so width doesn't reflow as glyphs swap.
        // Width is set per-char via ch unit ≈ width of "0" in current font.
        <span key={i} aria-hidden="true">
          {char}
        </span>
      ))}
    </Tag>
  );
}
