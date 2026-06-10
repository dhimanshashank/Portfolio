"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { TextScramble } from "@/components/hero/text-scramble";
import { aiHeader, aiRows } from "@/lib/ai-content";

/**
 * <AiSystems> — Plate VI (home page)
 *
 * Editorial plate between Selected Work and the Engineering Log. Three
 * hairline-separated rows, each one production fact about LLM/AI work from
 * the proctoring platform. Typographic on purpose — no cards, no icons,
 * no dashboard creep. Orange appears only in the eyebrow tick and row
 * numerals.
 *
 * Same reveal vocabulary as <EngineeringLog>: header fades up, rows
 * stagger in as they enter the viewport.
 */
export function AiSystems() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const reveal = (
        el: Element | null,
        opts: { y?: number; duration?: number; start?: string; delay?: number } = {}
      ) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: opts.y ?? 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: opts.duration ?? 0.7,
            delay: opts.delay ?? 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: opts.start ?? "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      };

      reveal(sectionRef.current.querySelector("[data-ai-header]"));
      sectionRef.current
        .querySelectorAll("[data-ai-row]")
        .forEach((row, i) => reveal(row, { y: 18, delay: i * 0.06 }));
    },
    { scope: sectionRef as React.RefObject<HTMLElement> }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper border-t border-ink/10"
      aria-label="AI systems"
    >
      <div className="container-wide py-20 md:py-28">
        {/* ─── Section header ───────────────────────────────────────────── */}
        <div data-ai-header style={{ opacity: 0 }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 mb-8">
            <span className="text-signal">▍</span>{" "}
            <TextScramble
              text={aiHeader.eyebrow}
              startOnMount={false}
              startOnView
              duration={1.2}
              as="span"
            />
          </p>

          <h2
            className="font-display italic text-ink max-w-[22ch]"
            style={{
              fontSize: "clamp(28px, 3.6vw, 44px)",
              lineHeight: 1.12,
              letterSpacing: "0",
              wordSpacing: "0.06em",
              fontWeight: 400,
            }}
          >
            {aiHeader.title}
          </h2>

          <p
            className="mt-4 text-ink-2 max-w-[56ch]"
            style={{ fontSize: "clamp(13px, 1.05vw, 15px)", lineHeight: 1.65 }}
          >
            {aiHeader.lede}
          </p>
        </div>

        {/* ─── Rows — hairline-separated, typographic ───────────────────── */}
        <ol className="mt-12 md:mt-16">
          {aiRows.map((row) => (
            <li
              key={row.num}
              data-ai-row
              className="grid grid-cols-1 gap-4 border-t border-ink/10 py-9 md:grid-cols-[88px_1fr_minmax(200px,260px)] md:gap-10 md:py-11 last:border-b last:border-ink/10"
              style={{ opacity: 0 }}
            >
              <span className="font-mono text-[12px] uppercase tracking-[0.24em] text-signal">
                {row.num}
              </span>

              <div className="max-w-[58ch]">
                <h3
                  className="font-display italic text-ink"
                  style={{
                    fontSize: "clamp(20px, 2.2vw, 28px)",
                    lineHeight: 1.18,
                    letterSpacing: "0",
                    wordSpacing: "0.05em",
                    fontWeight: 400,
                  }}
                >
                  {row.title}
                </h3>
                <p
                  className="mt-3 text-ink-2"
                  style={{ fontSize: "clamp(13.5px, 1.05vw, 15.5px)", lineHeight: 1.65 }}
                >
                  {row.body}
                </p>
              </div>

              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4 md:justify-self-end md:text-right md:self-start md:pt-2">
                {row.tags}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
