"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { caseNarrative } from "@/lib/proctoring-case-study";
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
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (reduce || isMobile) {
        // Stack and show statically — no pin/scrub on phones.
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

  const sectionStyle: React.CSSProperties & Record<string, string> = {
    "--pin-h": `${(PIN_VH + 1) * 100}vh`,
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper md:h-[var(--pin-h)]"
      style={sectionStyle}
      aria-label="Opening narrative"
    >
      <div ref={pinRef} className="relative w-full md:h-screen md:overflow-hidden">
        {/* Top eyebrow — in flow on mobile, pinned top-left on desktop */}
        <p className="px-6 pt-16 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 md:absolute md:left-10 md:top-8 md:px-0 md:pt-0">
          <span className="text-signal">▍</span> The opening
        </p>

        <div className="container-wide flex items-center py-10 md:absolute md:inset-0 md:py-0">
          {/* On desktop this holds absolutely-stacked paragraphs (scrubbed);
              on mobile they flow normally, spaced and all visible. */}
          <div className="relative mx-auto w-full max-w-[64ch] space-y-8 md:space-y-0">
            {paragraphs.map((text, i) => (
              <p
                key={i}
                ref={(el) => { paraRefs.current[i] = el; }}
                className={cn(
                  "font-display text-ink will-change-transform md:absolute md:inset-x-0",
                  // First paragraph is the hook — italic for weight
                  i === 0 && "italic"
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
      </div>
    </section>
  );
}
