"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { caseNarrative, isTodo } from "@/lib/proctoring-case-study";
import { cn } from "@/lib/utils";

/**
 * <NarrativeReveal>
 *
 * Pinned section that reveals the blog's opening paragraphs one at a time
 * as the user scrolls. Each paragraph fades in (opacity + slight Y) and
 * the previous one quietly dims back to a low-opacity state so the page
 * always has the most recent thought front and center.
 *
 * This is the voice setter. By paragraph 2 the visitor knows whether to
 * stay or leave.
 *
 * Pin length scales with paragraph count (2 vh per paragraph).
 */
export function NarrativeReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const paragraphs = caseNarrative.paragraphs.filter(Boolean);
  const PIN_VH = Math.max(3, paragraphs.length * 1.6);

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current || !paragraphs.length) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        // Stack and show statically
        gsap.set(paraRefs.current, { autoAlpha: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: pinRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * PIN_VH}`,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const step = 1 / paragraphs.length;
      paragraphs.forEach((_, i) => {
        const el = paraRefs.current[i];
        if (!el) return;
        const enterAt = i * step;
        const peakAt = enterAt + step * 0.35;
        const exitAt = enterAt + step * 0.85;

        // Enter — opacity 0 → 1, slight Y, prominent
        tl.fromTo(
          el,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: step * 0.35, ease: "power2.out" },
          enterAt
        );
        // Dim after peak (unless it's the last paragraph — let it stay)
        if (i < paragraphs.length - 1) {
          tl.to(
            el,
            { autoAlpha: 0.18, duration: step * 0.5, ease: "power1.in" },
            peakAt
          );
        }
      });
    },
    { scope: sectionRef as React.RefObject<HTMLElement>, dependencies: [paragraphs.length] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper"
      style={{ height: `${(PIN_VH + 1) * 100}vh` }}
      aria-label="Opening narrative"
    >
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
        <div className="container-wide absolute inset-0 flex items-center">
          {/* The relative container holds the absolutely-stacked paragraphs.
              CRITICAL: w-full is required — without it the parent collapses to
              0 width (all children are absolute) and each word wraps to a
              separate line inside the dead column. */}
          <div className="relative mx-auto w-full max-w-[64ch]">
            {paragraphs.map((text, i) => (
              <p
                key={i}
                ref={(el) => { paraRefs.current[i] = el; }}
                className={cn(
                  "absolute inset-x-0 font-display text-ink will-change-transform",
                  // First paragraph is the hook — italic for weight
                  i === 0 && "italic",
                  isTodo(text) && "text-ink-4"
                )}
                style={{
                  fontSize:
                    i === 0
                      ? "clamp(22px, 2.6vw, 36px)"
                      : "clamp(18px, 1.9vw, 26px)",
                  lineHeight: 1.45,
                  // Italic glyphs slant right — negative letter-spacing makes
                  // them eat each other. Keep tracking at 0 for italic; the
                  // serif already feels typeset.
                  letterSpacing: i === 0 ? "0" : "-0.005em",
                  wordSpacing: "0.06em",
                  fontWeight: 400,
                  opacity: 0,
                }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>

        {/* Top eyebrow */}
        <p className="absolute top-8 left-6 md:left-10 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
          <span className="text-signal">▍</span> The opening
        </p>
      </div>
    </section>
  );
}
