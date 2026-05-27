"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { caseBeforeAfter, isTodo } from "@/lib/proctoring-case-study";
import { cn } from "@/lib/utils";

/**
 * <BeforeAfter>
 *
 * Two-column comparison. Left column ("before") parallaxes slower than the
 * right ("after"), so as the user scrolls the right side appears to chase
 * and overtake the left — the visual metaphor of getting better.
 *
 * Inside each column, metric values count up as they enter the viewport.
 * Numbers parsed from the value string (e.g. "100%" → 100), falling back
 * to a simple opacity fade for non-numeric values (e.g. "O(N)").
 */
export function BeforeAfter() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const beforeValueRefs = useRef<HTMLSpanElement[]>([]);
  const afterValueRefs = useRef<HTMLSpanElement[]>([]);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      // Parallax: left column moves slower (yPercent 8), right moves faster (-8).
      // The two cross paths visually as the section scrolls through view.
      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }
      if (rightRef.current) {
        gsap.fromTo(
          rightRef.current,
          { yPercent: 6 },
          {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }

      // Count-up for numeric values when they enter viewport
      const animateCount = (el: HTMLSpanElement) => {
        const raw = el.dataset.value || "";
        const num = parseFloat(raw);
        if (Number.isNaN(num)) {
          gsap.fromTo(el, { autoAlpha: 0.3 }, {
            autoAlpha: 1,
            duration: 0.6,
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
          return;
        }
        const obj = { n: 0 };
        // Detect suffix (%, ms, etc.)
        const match = raw.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
        const suffix = match ? match[2] : "";
        gsap.to(obj, {
          n: num,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${Math.round(obj.n)}${suffix}`;
          },
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      };

      [...beforeValueRefs.current, ...afterValueRefs.current].forEach((el) => {
        if (el) animateCount(el);
      });
    },
    { scope: sectionRef as React.RefObject<HTMLElement> }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper py-32 md:py-40"
      aria-label="Before and after comparison"
    >
      <div className="container-wide mb-16">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          <span aria-hidden>▍</span> {caseBeforeAfter.sectionEyebrow}
        </p>
        <h2
          className="font-display text-ink"
          style={{
            fontSize: "clamp(28px, 3.6vw, 48px)",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            fontWeight: 400,
            maxWidth: "20ch",
          }}
        >
          {caseBeforeAfter.sectionTitle}
        </h2>
      </div>

      <div className="container-wide grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
        {/* BEFORE */}
        <div ref={leftRef} className="will-change-transform">
          <ColumnHeader label="Before" sublabel="Naïve architecture · 1 server doing everything" />
          <ul className="mt-10 flex flex-col gap-10">
            {caseBeforeAfter.before.map((m, i) => (
              <Row
                key={i}
                row={m}
                refSetter={(el) => {
                  if (el) beforeValueRefs.current[i] = el;
                }}
              />
            ))}
          </ul>
        </div>

        {/* AFTER */}
        <div ref={rightRef} className="will-change-transform">
          <ColumnHeader label="After" sublabel="SFU · client inference · O(1) per stream" accent />
          <ul className="mt-10 flex flex-col gap-10">
            {caseBeforeAfter.after.map((m, i) => (
              <Row
                key={i}
                row={m}
                accent
                refSetter={(el) => {
                  if (el) afterValueRefs.current[i] = el;
                }}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── Small subcomponents ──────────────────────────────────────────────────

function ColumnHeader({
  label,
  sublabel,
  accent = false,
}: {
  label: string;
  sublabel: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "font-mono text-[11px] uppercase tracking-[0.22em]",
          accent ? "text-signal" : "text-ink-3"
        )}
      >
        {label}
      </p>
      <p
        className={cn("mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4")}
      >
        {sublabel}
      </p>
    </div>
  );
}

function Row({
  row,
  accent = false,
  refSetter,
}: {
  row: { label: string; value: string; sub: string };
  accent?: boolean;
  refSetter: (el: HTMLSpanElement | null) => void;
}) {
  const valueIsTodo = isTodo(row.value);
  const subIsTodo = isTodo(row.sub);
  return (
    <li className="border-t border-hairline pt-6">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
        {row.label}
      </p>
      <span
        ref={refSetter}
        data-value={row.value}
        className={cn(
          "block font-display tabular-nums",
          accent ? "text-ink" : "text-ink-2",
          valueIsTodo && "text-ink-4 italic"
        )}
        style={{
          fontSize: "clamp(40px, 5vw, 72px)",
          lineHeight: 1,
          letterSpacing: "-0.035em",
          fontWeight: 400,
        }}
      >
        {row.value}
      </span>
      <p
        className={cn(
          "mt-3 max-w-[28ch] text-ink-3",
          subIsTodo && "text-ink-4 italic"
        )}
        style={{ fontSize: "clamp(13px, 1vw, 15px)", lineHeight: 1.5 }}
      >
        {row.sub}
      </p>
    </li>
  );
}
