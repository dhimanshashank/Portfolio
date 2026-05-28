"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { projects, type WorkProject } from "@/lib/work-data";

/**
 * <SelectedWork>
 *
 * Phase 3 — the home page's central work section. Four project cards
 * stacked vertically. Each card animates in as it enters the viewport
 * (number rises into place, title slides in, metrics stagger, the
 * abstract visual on the right draws itself with a line-trace effect).
 *
 * Each card sits ~80vh tall so it commands the viewport without forcing
 * a heavy ScrollTrigger pin on every project (which would compound badly
 * with the manifesto pin above). The result: every card gets undivided
 * attention as the visitor scrolls, without the page feeling captive.
 */
export function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const cards =
        sectionRef.current.querySelectorAll<HTMLElement>("[data-work-card]");

      cards.forEach((card) => {
        const number = card.querySelector<HTMLElement>("[data-work-number]");
        const title = card.querySelector<HTMLElement>("[data-work-title]");
        const tagline = card.querySelector<HTMLElement>("[data-work-tagline]");
        const blurb = card.querySelector<HTMLElement>("[data-work-blurb]");
        const metrics =
          card.querySelectorAll<HTMLElement>("[data-work-metric]");
        const stack = card.querySelector<HTMLElement>("[data-work-stack]");
        const viz = card.querySelector<HTMLElement>("[data-work-viz]");
        const vizPaths =
          card.querySelectorAll<SVGPathElement>("[data-work-viz] path");
        const vizDots =
          card.querySelectorAll<SVGCircleElement>("[data-work-viz] circle");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 78%",
            end: "top 30%",
            toggleActions: "play none none reverse",
          },
        });

        if (number) {
          tl.fromTo(
            number,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
            0
          );
        }
        if (title) {
          tl.fromTo(
            title,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
            0.08
          );
        }
        if (tagline) {
          tl.fromTo(
            tagline,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
            0.18
          );
        }
        if (blurb) {
          tl.fromTo(
            blurb,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
            0.26
          );
        }
        if (metrics.length) {
          tl.fromTo(
            metrics,
            { autoAlpha: 0, y: 14 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              ease: "power2.out",
              stagger: 0.08,
            },
            0.32
          );
        }
        if (stack) {
          tl.fromTo(
            stack,
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
            0.5
          );
        }
        if (viz) {
          tl.fromTo(
            viz,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
            0.1
          );
        }
        // Line-trace effect on the visual
        if (vizPaths.length) {
          vizPaths.forEach((p) => {
            const len = p.getTotalLength?.() ?? 0;
            if (!len) return;
            p.style.strokeDasharray = `${len}`;
            p.style.strokeDashoffset = `${len}`;
          });
          tl.to(
            vizPaths,
            {
              strokeDashoffset: 0,
              duration: 1.4,
              ease: "power2.out",
              stagger: 0.06,
            },
            0.2
          );
        }
        if (vizDots.length) {
          tl.fromTo(
            vizDots,
            { autoAlpha: 0, scale: 0 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.4,
              ease: "back.out(1.7)",
              stagger: 0.06,
              transformOrigin: "center",
            },
            0.8
          );
        }
      });
    },
    { scope: sectionRef as React.RefObject<HTMLElement> }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper"
      aria-label="Selected work"
    >
      {/* Section header */}
      <div className="container-wide pt-32 pb-12 md:pt-40 md:pb-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
          <span className="text-signal">▍</span> Plate III — Selected Work
        </p>
        <h2
          className="mt-6 font-display text-ink max-w-[18ch]"
          style={{
            fontSize: "clamp(32px, 4.8vw, 64px)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            fontWeight: 400,
          }}
        >
          Four systems. <em className="italic text-ink-2">One year.</em>
        </h2>
      </div>

      <div className="container-wide pb-32 md:pb-40 flex flex-col gap-28 md:gap-40">
        {projects.map((p, i) => (
          <WorkCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}

// ─── Single work card ──────────────────────────────────────────────────────
function WorkCard({ project, index }: { project: WorkProject; index: number }) {
  const reverse = index % 2 === 1;
  const href = project.caseStudy ? `/work/${project.slug}` : "/work";

  return (
    <article
      data-work-card
      className="
        grid grid-cols-1 gap-10 items-center
        md:grid-cols-[1.05fr_1fr] md:gap-16
        relative
      "
    >
      {/* ─── Text column ─────────────────────────────────────────────── */}
      <div className={reverse ? "md:order-2" : "md:order-1"}>
        <div className="flex items-baseline gap-5 mb-6">
          <span
            data-work-number
            className="font-display text-ink-4"
            style={{
              fontSize: "clamp(48px, 7vw, 96px)",
              lineHeight: 1,
              fontWeight: 400,
              letterSpacing: "-0.03em",
              opacity: 0,
            }}
          >
            {project.num}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
            / 04
          </span>
        </div>

        <h3
          data-work-title
          className="font-display text-ink"
          style={{
            fontSize: "clamp(28px, 3.6vw, 48px)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            fontWeight: 400,
            opacity: 0,
          }}
        >
          {project.title}
        </h3>

        <p
          data-work-tagline
          className="mt-3 font-display italic text-ink-2"
          style={{
            fontSize: "clamp(16px, 1.6vw, 20px)",
            lineHeight: 1.4,
            letterSpacing: "0",
            opacity: 0,
          }}
        >
          {project.tagline}
        </p>

        <p
          data-work-blurb
          className="mt-6 text-ink-2 max-w-[52ch]"
          style={{
            fontSize: "clamp(14px, 1.05vw, 16px)",
            lineHeight: 1.65,
            opacity: 0,
          }}
        >
          {project.blurb}
        </p>

        {/* Metrics */}
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
          {project.metrics.map((m) => (
            <div key={m.label} data-work-metric style={{ opacity: 0 }}>
              <div
                className="font-display text-ink tabular-nums"
                style={{
                  fontSize: "clamp(22px, 2.4vw, 32px)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  fontWeight: 400,
                }}
              >
                {m.value}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3 max-w-[16ch]">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Stack + link row */}
        <div
          data-work-stack
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
          style={{ opacity: 0 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
            {project.stack.join("  ·  ")}
          </p>
        </div>

        <div className="mt-8">
          <Link
            href={href}
            className="
              group inline-flex items-center gap-3
              border border-ink/20
              px-5 py-3
              font-mono text-[11px] uppercase tracking-[0.18em] text-ink
              rounded-sm
              transition-colors duration-300
              hover:bg-signal hover:text-paper hover:border-signal
            "
          >
            {project.caseStudy ? "Read case study" : "View in work"}
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>
          {project.context && (
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
              {project.context}
            </p>
          )}
        </div>
      </div>

      {/* ─── Visual column ───────────────────────────────────────────── */}
      <div
        className={`${reverse ? "md:order-1" : "md:order-2"} relative aspect-[5/4] w-full`}
      >
        <WorkVisual project={project} />
      </div>
    </article>
  );
}

// ─── Per-project abstract visual ───────────────────────────────────────────
function WorkVisual({ project }: { project: WorkProject }) {
  return (
    <div
      data-work-viz
      className="relative h-full w-full overflow-hidden border border-ink/10"
      style={{ background: "var(--paper-soft)", opacity: 0 }}
    >
      {/* faint grid backdrop */}
      <GridBackdrop />

      {/* project-specific drawing */}
      {project.id === "proctoring" && <VizProctoring />}
      {project.id === "messaging" && <VizMessaging />}
      {project.id === "analytics" && <VizAnalytics />}
      {project.id === "eventify" && <VizEventify />}

      {/* corner metadata */}
      <div className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-4">
        FIG. {project.num}
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-4">
        {project.visualKind}
      </div>
    </div>
  );
}

// ─── Visual primitives ─────────────────────────────────────────────────────

function GridBackdrop() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 80"
      aria-hidden
    >
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * 10}
          y1="0"
          x2={i * 10}
          y2="80"
          stroke="currentColor"
          strokeWidth="0.08"
          className="text-ink"
          opacity="0.18"
        />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          y1={i * 10}
          x2="100"
          y2={i * 10}
          stroke="currentColor"
          strokeWidth="0.08"
          className="text-ink"
          opacity="0.18"
        />
      ))}
    </svg>
  );
}

// Proctoring — SFU radial topology
function VizProctoring() {
  const peers = Array.from({ length: 12 }).map((_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { x: 50 + Math.cos(a) * 32, y: 40 + Math.sin(a) * 26 };
  });
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 80"
      aria-hidden
    >
      {/* fan-out lines */}
      {peers.map((p, i) => (
        <path
          key={i}
          d={`M50 40 L${p.x} ${p.y}`}
          stroke="currentColor"
          strokeWidth="0.25"
          fill="none"
          className="text-ink"
        />
      ))}
      {/* peers */}
      {peers.map((p, i) => (
        <circle
          key={`d${i}`}
          cx={p.x}
          cy={p.y}
          r="1.4"
          className="text-ink fill-current"
        />
      ))}
      {/* SFU core */}
      <circle cx="50" cy="40" r="3" className="fill-current text-signal" />
      <circle
        cx="50"
        cy="40"
        r="5.5"
        className="text-signal"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.3"
      />
    </svg>
  );
}

// Messaging — latency histogram fall
function VizMessaging() {
  const bars = [62, 58, 70, 64, 55, 48, 40, 33, 28, 24, 22, 20, 19, 18, 18, 17];
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 80"
      aria-hidden
    >
      {/* baseline */}
      <path
        d="M8 70 L92 70"
        stroke="currentColor"
        strokeWidth="0.3"
        className="text-ink"
        opacity="0.5"
      />
      {/* histogram bars rendered as path so the dash animation can sweep them */}
      {bars.map((h, i) => {
        const x = 10 + i * 5;
        const top = 70 - (h / 70) * 50;
        return (
          <path
            key={i}
            d={`M${x} 70 L${x} ${top}`}
            stroke="currentColor"
            strokeWidth="2.4"
            className={i < 4 ? "text-ink" : "text-signal"}
            opacity={i < 4 ? 0.4 : 0.9}
          />
        );
      })}
      {/* axis caption */}
      <text
        x="10"
        y="76"
        className="text-ink"
        fontSize="3"
        opacity="0.55"
        fontFamily="monospace"
      >
        BEFORE
      </text>
      <text
        x="60"
        y="76"
        className="text-signal"
        fontSize="3"
        opacity="0.9"
        fontFamily="monospace"
      >
        AFTER
      </text>
    </svg>
  );
}

// Analytics — partition map
function VizAnalytics() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 80"
      aria-hidden
    >
      {/* horizontal partitions (months) */}
      {Array.from({ length: 6 }).map((_, row) => (
        <g key={row}>
          {Array.from({ length: 10 }).map((__, col) => {
            const filled = Math.random() < 0.45;
            return (
              <rect
                key={col}
                x={10 + col * 8}
                y={14 + row * 9}
                width="6.4"
                height="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.25"
                className={
                  filled
                    ? row === 2 && col === 5
                      ? "text-signal"
                      : "text-ink"
                    : "text-ink"
                }
                opacity={filled ? 0.7 : 0.2}
              />
            );
          })}
        </g>
      ))}
      {/* highlighted cell — composite index hit */}
      <rect
        x={10 + 5 * 8}
        y={14 + 2 * 9}
        width="6.4"
        height="7"
        className="fill-current text-signal"
        opacity="0.9"
      />
      {/* row labels */}
      {["JAN", "FEB", "MAR", "APR", "MAY", "JUN"].map((m, i) => (
        <text
          key={m}
          x="3"
          y={19.5 + i * 9}
          className="text-ink"
          opacity="0.5"
          fontSize="2.6"
          fontFamily="monospace"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

// Eventify — state machine
function VizEventify() {
  const states = [
    { x: 18, y: 40, label: "CART" },
    { x: 42, y: 40, label: "PAY" },
    { x: 66, y: 40, label: "HOOK" },
    { x: 86, y: 40, label: "ORDER" },
  ];
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 80"
      aria-hidden
    >
      {/* connecting line */}
      {states.slice(0, -1).map((s, i) => {
        const n = states[i + 1];
        return (
          <path
            key={i}
            d={`M${s.x + 5} ${s.y} L${n.x - 5} ${n.y}`}
            stroke="currentColor"
            strokeWidth="0.3"
            className={i === 1 ? "text-signal" : "text-ink"}
            opacity={i === 1 ? 0.9 : 0.5}
          />
        );
      })}
      {/* nodes */}
      {states.map((s, i) => (
        <g key={s.label}>
          <circle
            cx={s.x}
            cy={s.y}
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className={i === 2 ? "text-signal" : "text-ink"}
          />
          <text
            x={s.x}
            y={s.y + 11}
            textAnchor="middle"
            fontSize="3"
            fontFamily="monospace"
            className="text-ink"
            opacity="0.7"
          >
            {s.label}
          </text>
        </g>
      ))}
      {/* hook glyph */}
      <circle cx="66" cy="40" r="1.4" className="fill-current text-signal" />
    </svg>
  );
}
