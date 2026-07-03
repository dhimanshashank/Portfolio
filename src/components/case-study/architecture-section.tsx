"use client";

import { useRef, useState } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { caseArchitecture } from "@/lib/proctoring-case-study";
import { ExplorableArchitecture } from "@/components/work/visuals/explorable-architecture";
import { cn } from "@/lib/utils";

/**
 * <ArchitectureSection>
 *
 * Pinned. The proctoring SVG diagram (reused from /work) sits enlarged
 * on the left; annotations on the right fade in one-by-one as the user
 * scrolls. Each annotation is a tight 1-sentence note paired with an
 * anchor label that maps loosely to the part of the diagram it describes.
 *
 * On mobile, the diagram stacks above the annotation list (no pinning).
 */
export function ArchitectureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const annotRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  const annotations = caseArchitecture.annotations;
  const PIN_VH = Math.max(3, annotations.length * 0.9);

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current || !annotations.length) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      if (reduce || isMobile) {
        gsap.set(annotRefs.current, { autoAlpha: 1, y: 0 });
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

      const step = 1 / annotations.length;
      annotations.forEach((_, i) => {
        const el = annotRefs.current[i];
        if (!el) return;
        tl.fromTo(
          el,
          { autoAlpha: 0.15, y: 16 },
          { autoAlpha: 1, y: 0, duration: step * 0.6, ease: "power2.out" },
          i * step
        );
      });
    },
    { scope: sectionRef as React.RefObject<HTMLElement>, dependencies: [annotations.length] }
  );

  // Tall scroll-distance only where the pin actually runs (desktop). On
  // mobile the section is content-height and the pinRef is a normal block.
  const sectionStyle: React.CSSProperties & Record<string, string> = {
    "--pin-h": `${(PIN_VH + 1) * 100}vh`,
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper md:h-[var(--pin-h)]"
      style={sectionStyle}
      aria-label={caseArchitecture.sectionTitle}
    >
      <div
        ref={pinRef}
        className="relative w-full md:h-screen md:overflow-hidden"
      >
        <div className="container-wide grid grid-cols-1 gap-10 py-20 md:h-full md:grid-cols-[1.4fr_1fr] md:gap-14 md:py-0">
          {/* Diagram column */}
          <div className="flex flex-col justify-center">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
              <span aria-hidden>▍</span> {caseArchitecture.sectionEyebrow}
            </p>
            <h2
              className="mb-10 font-display text-ink"
              style={{
                fontSize: "clamp(28px, 3.6vw, 48px)",
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                fontWeight: 400,
                maxWidth: "20ch",
              }}
            >
              {caseArchitecture.sectionTitle}
            </h2>
            {/* Explorable topology — hover/tap a node to inspect it; the
                matching annotation on the right lights up. "add load" moves
                an honest CPU/latency readout. */}
            <div className="w-full max-w-[680px]">
              <div className="rounded-sm border border-ink/10 bg-paper-soft p-3 md:p-4">
                <ExplorableArchitecture
                  variant="full"
                  activeAnchor={activeAnchor}
                  onActiveAnchor={setActiveAnchor}
                  className="text-ink"
                />
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                FIG. — System architecture · hover a node to inspect
              </p>
            </div>
          </div>

          {/* Annotation column */}
          <div className="flex flex-col justify-center">
            <ol className="flex flex-col gap-7 md:gap-9">
              {annotations.map((a, i) => {
                const on = activeAnchor === a.anchor;
                return (
                  <li
                    key={a.anchor}
                    ref={(el) => { annotRefs.current[i] = el; }}
                    onPointerEnter={() => setActiveAnchor(a.anchor)}
                    onPointerLeave={() => setActiveAnchor(null)}
                    className={cn(
                      "will-change-transform border-l-2 pl-4 transition-colors duration-200",
                      on ? "border-signal" : "border-transparent"
                    )}
                    style={{ opacity: 0 }}
                  >
                    <p className="mb-2 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
                      <span className="text-ink-4">{String(i + 1).padStart(2, "0")}</span>
                      {a.label}
                    </p>
                    <p
                      className={cn(
                        "leading-relaxed transition-colors duration-200",
                        on ? "text-ink" : "text-ink-2"
                      )}
                      style={{ fontSize: "clamp(14px, 1.05vw, 16px)" }}
                    >
                      {a.note}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
