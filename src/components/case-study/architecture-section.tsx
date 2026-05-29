"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { caseArchitecture, isTodo } from "@/lib/proctoring-case-study";
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

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper"
      style={{ height: `${(PIN_VH + 1) * 100}vh` }}
      aria-label={caseArchitecture.sectionTitle}
    >
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
        <div className="container-wide grid h-full grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr] md:gap-14">
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
            {/* Real architecture image — production system diagram.
                Replaces the earlier abstract SVG mock; this is what was
                actually shipped, so peer reviewers get the real artifact. */}
            <div className="w-full max-w-[680px]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-ink/10 bg-paper-soft">
                <Image
                  src="/work/proctoring/architecture-1.png"
                  alt="Proctoring system architecture diagram — production"
                  fill
                  sizes="(max-width: 768px) 100vw, 680px"
                  className="object-contain p-2"
                />
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                FIG. — System architecture, production
              </p>
            </div>
          </div>

          {/* Annotation column */}
          <div className="flex flex-col justify-center">
            <ol className="flex flex-col gap-7 md:gap-9">
              {annotations.map((a, i) => (
                <li
                  key={a.anchor}
                  ref={(el) => { annotRefs.current[i] = el; }}
                  className="will-change-transform"
                  style={{ opacity: 0 }}
                >
                  <p className="mb-2 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
                    <span className="text-ink-4">{String(i + 1).padStart(2, "0")}</span>
                    {a.label}
                  </p>
                  <p
                    className={cn(
                      "text-ink-2 leading-relaxed",
                      isTodo(a.note) && "text-ink-4 italic"
                    )}
                    style={{ fontSize: "clamp(14px, 1.05vw, 16px)" }}
                  >
                    {a.note}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
