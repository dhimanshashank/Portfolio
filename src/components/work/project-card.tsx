"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { WorkProject } from "@/lib/work-data";
import { ProjectVisual } from "./project-visual";
import { cn } from "@/lib/utils";

/**
 * <ProjectCard>
 *
 * Renders one project in either the FEATURED or REGULAR shape:
 *
 *   featured →  Two-column (visual left 58%, meta right 42%) on desktop.
 *               Stacks vertically on mobile. Tall, dominant. One per page.
 *
 *   regular  →  Card tile. Visual top ~55%, meta bottom ~45%. Sits in a
 *               3-up grid on desktop, stacks on mobile.
 *
 * Hover state: the whole card lifts a hair and the border deepens; the
 * "→" arrow on the CTA translates right. Cards without a shipped case
 * study show an inert "case study coming" affordance instead of routing
 * to a 404.
 */

export function ProjectCard({
  project,
  index = 0,
}: {
  project: WorkProject;
  index?: number;
}) {
  const reduce = useReducedMotion();
  const isFeatured = project.variant === "featured";
  const href = project.caseStudy ? `/work/${project.slug}` : null;

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        delay: reduce ? 0 : index * 0.08,
      },
    },
  };

  const Body = (
    <article
      className={cn(
        "group relative flex flex-col bg-paper",
        "sketch-edge transition-all duration-500",
        href && "cursor-pointer hover:-translate-y-0.5 hover:-rotate-[0.2deg]",
        isFeatured
          ? "md:grid md:grid-cols-[1.35fr_1fr] md:grid-rows-1"
          : "h-full"
      )}
    >
      {/* ─── Visual panel ─────────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden bg-paper-soft",
          isFeatured
            ? "aspect-[16/10] md:aspect-auto md:h-[clamp(380px,42vw,560px)]"
            : "aspect-[16/10]"
        )}
      >
        <ProjectVisual project={project} />

        {/* Soft inner ring — keeps visual from feeling like a poster crop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/5"
        />
      </div>

      {/* ─── Meta panel ───────────────────────────────────────────── */}
      <div
        className={cn(
          "flex flex-col justify-between",
          isFeatured
            ? "p-8 md:p-10 lg:p-12"
            : "p-6 md:p-7"
        )}
      >
        <div>
          {/* Eyebrow row: num · context */}
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
              {project.num} / {project.tagline}
            </span>
            {project.context && (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
                {project.context}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-display text-ink",
              isFeatured
                ? "text-[clamp(32px,4vw,52px)] leading-[1.05] tracking-[-0.03em]"
                : "text-[clamp(22px,2.4vw,30px)] leading-[1.1] tracking-[-0.02em]"
            )}
            style={{ fontWeight: 400 }}
          >
            {project.title}
          </h3>

          {/* Blurb */}
          <p
            className={cn(
              "mt-4 text-ink-2",
              isFeatured ? "max-w-[44ch] text-[15px] leading-relaxed" : "text-[13.5px] leading-relaxed"
            )}
          >
            {project.blurb}
          </p>

          {/* Metrics — small inline rail */}
          {project.metrics.length > 0 && (
            <ul
              className={cn(
                "mt-7 flex flex-wrap gap-x-7 gap-y-3",
                "border-t border-hairline pt-5"
              )}
            >
              {project.metrics.map((m) => (
                <li key={m.label} className="flex flex-col">
                  <span
                    className="font-display tabular-nums text-ink"
                    style={{
                      fontSize: isFeatured
                        ? "clamp(22px, 2vw, 28px)"
                        : "clamp(18px, 1.6vw, 22px)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                      fontWeight: 400,
                    }}
                  >
                    {m.value}
                  </span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                    {m.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CTA row */}
        <div className="mt-8 flex items-end justify-between gap-4">
          {/* Stack chips */}
          <ul className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, isFeatured ? 7 : 4).map((s) => (
              <li
                key={s}
                className="font-mono text-[10px] lowercase tracking-[0.06em] text-ink-3 px-2 py-1 border border-hairline rounded-sm"
              >
                {s}
              </li>
            ))}
          </ul>

          {/* Action — case-study CTA + optional Live ↗ link */}
          <div className="flex flex-col items-end gap-2 whitespace-nowrap">
            {href ? (
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                Case study
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                >
                  →
                </span>
              </span>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
                Case study · soon
              </span>
            )}

            {project.liveUrl && (
              // Sits above the stretched case-study overlay (z-20 > z-10) so
              // it stays independently clickable to its own destination.
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-20 font-mono text-[10px] uppercase tracking-[0.18em] text-signal hover:text-ink transition-colors"
              >
                Live ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stretched link — makes the whole card route to the case study
          WITHOUT wrapping the card in an <a> (which would nest the Live
          anchor inside it and break hydration). The Live link above opts
          out via a higher z-index. */}
      {href && (
        <Link
          href={href}
          aria-label={`${project.title} — case study`}
          className="absolute inset-0 z-10"
        />
      )}
    </article>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      className={cn(isFeatured ? "col-span-full" : "")}
    >
      {Body}
    </motion.div>
  );
}
