"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import {
  SketchUnderline,
  SketchAsterisk,
  HatchDivider,
} from "@/components/ui/sketch-marks";
import { LiveTrace } from "./live-trace";

/**
 * <WorksOn> — Phase 3.2 (center + sketch rework)
 *
 *   Replaces the old left-aligned domain bar that wrapped clumsily.
 *   Now a centered closing plate:
 *
 *      ▍ PLATE IV — TERRITORY            (top eyebrow)
 *
 *      THE  TWO  DOMAINS                  (caption above pillar list)
 *
 *      real-time systems    /    ai infrastructure
 *      ──── websockets        ──── inference queues
 *      ──── event pipelines   ──── adversarial robustness
 *
 *               ✱ (small sketch asterisk)
 *
 *           The system is the [portrait].
 *                              ───────── (pencil underline)
 *
 *               [ READ THE STORY → ]
 *
 *   Everything axially centered. The single hand-drawn underline under
 *   "portrait" connects the closing line back to the pencil portrait
 *   shown in the hero. Pages rhyme.
 */
const COLUMNS = [
  {
    title: "Real-time systems",
    items: ["websockets at scale", "event-driven pipelines", "low-latency state"],
  },
  {
    title: "AI infrastructure",
    items: ["inference queues", "adversarial robustness", "model-serving infra"],
  },
] as const;

export function WorksOn() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const eyebrow = sectionRef.current.querySelector<HTMLElement>(
        "[data-works-eyebrow]"
      );
      const columns = sectionRef.current.querySelectorAll<HTMLElement>(
        "[data-works-column]"
      );
      const divider = sectionRef.current.querySelector<HTMLElement>(
        "[data-works-divider]"
      );
      const punchline = sectionRef.current.querySelector<HTMLElement>(
        "[data-works-punchline]"
      );
      const cta = sectionRef.current.querySelector<HTMLElement>(
        "[data-works-cta]"
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });

      if (eyebrow) {
        tl.fromTo(eyebrow, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);
      }
      if (columns.length) {
        tl.fromTo(
          columns,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.12 },
          0.1
        );
      }
      if (divider) {
        tl.fromTo(divider, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, duration: 0.7, ease: "power2.out", transformOrigin: "center" }, 0.45);
      }
      if (punchline) {
        tl.fromTo(punchline, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, 0.55);
      }
      if (cta) {
        tl.fromTo(cta, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.75);
      }
    },
    { scope: sectionRef as React.RefObject<HTMLElement> }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper"
      aria-label="Territory"
    >
      {/* Pencil-hatched section break — replaces the clean border-t rule */}
      <div aria-hidden className="container-wide absolute inset-x-0 top-0 text-ink-2">
        <HatchDivider />
      </div>
      {/* Faint blueprint grid — fills the plate's air without competing
          with the type. Same 40px cell as the architecture diagrams. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full text-ink"
        style={{
          maskImage:
            "radial-gradient(75% 70% at 50% 45%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(75% 70% at 50% 45%, black 30%, transparent 100%)",
        }}
      >
        <defs>
          <pattern id="territory-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.07"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#territory-grid)" />
      </svg>

      <div className="container-wide relative py-20 md:py-28 flex flex-col items-center text-center">
        {/* ─── Eyebrow ────────────────────────────────────────────────── */}
        <p
          data-works-eyebrow
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 mb-10 md:mb-14"
          style={{ opacity: 0 }}
        >
          <span className="text-signal">▍</span> Plate IV — Territory
        </p>

        {/* ─── Two-column discipline list — properly centered ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 w-full max-w-3xl">
          {COLUMNS.map((col) => (
            <div
              key={col.title}
              data-works-column
              className="flex flex-col items-center md:items-start text-center md:text-left"
              style={{ opacity: 0 }}
            >
              {/* Discipline name — italic Fraunces, the heading voice */}
              <h3
                className="font-display italic text-ink mb-5"
                style={{
                  fontSize: "clamp(20px, 2.2vw, 28px)",
                  lineHeight: 1.15,
                  letterSpacing: "0",
                  fontWeight: 400,
                }}
              >
                {col.title}
              </h3>

              {/* Items — mono, with a small sketchy tick prefix */}
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-3 font-mono text-[11px] md:text-[12px] uppercase tracking-[0.18em] text-ink-2"
                  >
                    <span aria-hidden className="text-signal/70">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── Live trace divider — the signal responds to the cursor ── */}
        <div
          data-works-divider
          className="mt-12 md:mt-16 w-full max-w-[560px]"
          style={{ opacity: 0 }}
        >
          <LiveTrace />
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-4">
            fig. 05 — live signal · it notices you
          </p>
        </div>

        {/* ─── Centered punchline — with sketch underline on "portrait" ── */}
        <div
          data-works-punchline
          className="mt-10 md:mt-14 flex flex-col items-center"
          style={{ opacity: 0 }}
        >
          <SketchAsterisk
            className="mb-6 text-ink-3"
            style={{ width: 14, height: 14, opacity: 0.5 }}
          />
          <h2
            className="font-display italic text-ink max-w-[22ch]"
            style={{
              fontSize: "clamp(28px, 3.8vw, 48px)",
              lineHeight: 1.18,
              letterSpacing: "-0.01em",
              fontWeight: 400,
            }}
          >
            The system is the{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="text-signal">portrait</span>
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 right-0"
                style={{ bottom: "-0.06em", color: "var(--signal)" }}
              >
                <SketchUnderline color="currentColor" weight={1.2} drawMs={900} />
              </span>
            </span>
            .
          </h2>
        </div>

        {/* ─── Closing CTA — centered, anchored ──────────────────────── */}
        <div
          data-works-cta
          className="mt-12 md:mt-16"
          style={{ opacity: 0 }}
        >
          <Link
            href="/about"
            className="
              group inline-flex items-center gap-3
              px-7 py-4
              font-mono text-[12px] uppercase tracking-[0.18em] text-ink
              sketch-btn
              transition-colors duration-300
              hover:bg-signal hover:text-paper
            "
          >
            Read the story
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
