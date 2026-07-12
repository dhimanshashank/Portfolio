"use client";

import { motion, useReducedMotion } from "framer-motion";
import { experience, educationLine } from "@/lib/experience-data";
import { HatchDivider } from "@/components/ui/sketch-marks";
import { MarginDoodle } from "@/components/ui/margin-doodle";

/**
 * <Experience> — Plate II (home page)
 *
 * Replaces the near-empty manifesto scene. A compact, editorial timeline:
 * the current role first (live dot), one prior role, education as a quiet
 * footer line. Same hairline-row vocabulary as <AiSystems>, but content is
 * visible by default — the reveal is a framer whileInView enhancement, never
 * an opacity-0 that depends on a scroll trigger firing (which is what leaves
 * sections blank on mobile elsewhere).
 */
export function Experience() {
  const reduce = useReducedMotion();

  const fade = (i = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-12% 0px" },
          transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            delay: i * 0.08,
          },
        };

  return (
    <section
      className="relative bg-paper"
      aria-label="Experience"
    >
      {/* Pencil-hatched section break — replaces the clean border-t rule */}
      <div aria-hidden className="container-wide absolute inset-x-0 top-0 text-ink-2">
        <HatchDivider />
      </div>
      {/* Margin annotation — pencils itself in on first scroll into view */}
      <MarginDoodle mark="asterisk" className="right-[4.5%] top-28" size={20} rotate={10} />
      <div className="container-wide py-20 md:py-28">
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <motion.div {...fade(0)}>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 mb-6">
            <span className="text-signal">▍</span> Plate II — Experience
          </p>
          <h2
            className="font-display text-ink max-w-[20ch]"
            style={{
              fontSize: "clamp(30px, 4.4vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              fontWeight: 400,
            }}
          >
            Where I&apos;ve <em className="italic text-ink-2">shipped.</em>
          </h2>
          <p
            className="mt-5 text-ink-2 max-w-[52ch]"
            style={{ fontSize: "clamp(14px, 1.05vw, 16px)", lineHeight: 1.65 }}
          >
            One year, four production systems — currently building the real-time
            and AI infrastructure behind Masters&apos; Union&apos;s EdTech
            learning platform (LMS).
          </p>
        </motion.div>

        {/* ─── Roles — hairline-separated timeline ────────────────────── */}
        <ol className="mt-12 md:mt-16 divide-y divide-ink/10">
          {experience.map((e, i) => (
            <motion.li
              key={e.org}
              {...fade(i + 1)}
              className="grid grid-cols-1 gap-4 py-8 md:grid-cols-[minmax(180px,240px)_1fr_minmax(160px,220px)] md:gap-10 md:py-10"
            >
              {/* Org + period */}
              <div>
                <div className="flex items-center gap-2">
                  {e.current && (
                    <span
                      aria-hidden
                      className="inline-block h-[7px] w-[7px] rounded-full bg-[var(--ok,#7FB08A)] motion-safe:animate-pulse"
                    />
                  )}
                  {e.href ? (
                    <a
                      href={e.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-ink transition-colors hover:text-signal"
                      style={{ fontSize: "clamp(17px, 1.5vw, 21px)", fontWeight: 400 }}
                    >
                      {e.org}
                    </a>
                  ) : (
                    <span
                      className="font-display text-ink"
                      style={{ fontSize: "clamp(17px, 1.5vw, 21px)", fontWeight: 400 }}
                    >
                      {e.org}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                  {e.period}
                </p>
              </div>

              {/* Role + summary */}
              <div className="max-w-[52ch]">
                <h3
                  className="font-display italic text-ink-2"
                  style={{ fontSize: "clamp(15px, 1.4vw, 18px)", fontWeight: 400 }}
                >
                  {e.role}
                </h3>
                <p
                  className="mt-2 text-ink-2"
                  style={{ fontSize: "clamp(13.5px, 1.05vw, 15px)", lineHeight: 1.6 }}
                >
                  {e.summary}
                </p>
              </div>

              {/* Tags */}
              <ul className="flex flex-wrap gap-1.5 md:justify-end md:self-start">
                {e.tags.map((tg) => (
                  <li
                    key={tg}
                    className="font-mono text-[10px] lowercase tracking-[0.06em] text-ink-3 px-2 py-1 border border-ink/12 rounded-sm"
                  >
                    {tg}
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ol>

        {/* ─── Education — quiet footer line ──────────────────────────── */}
        <motion.p
          {...fade(experience.length + 1)}
          className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4"
        >
          {educationLine.degree} · {educationLine.school} · {educationLine.years}
          {educationLine.note ? ` · ${educationLine.note}` : ""}
        </motion.p>
      </div>
    </section>
  );
}
