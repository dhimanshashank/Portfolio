"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { homepageProjects, type WorkProject } from "@/lib/work-data";
import { WorkDeck } from "./work-deck";
import { assetUrl } from "@/lib/assets";
import { MarginDoodle } from "@/components/ui/margin-doodle";

const NUM_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six"] as const;

/** Time each slide holds before the carousel advances (ms). */
const AUTOPLAY_MS = 5200;

/**
 * <SelectedWork>
 *
 * The home page's central work section.
 *
 * Desktop (≥769px): an autoplay carousel. One project card fills the stage;
 * the deck advances continuously on a timer, with a story-style segmented
 * progress bar that fills in real time. It keeps moving on hover (by design —
 * a living showcase); it only pauses when the section is scrolled off-screen
 * (perf) or a control is keyboard-focused (so the deck can't slide a link out
 * from under a keyboard user). Arrows + segments allow manual control.
 *
 * The autoplay clock is a single requestAnimationFrame loop driving one
 * `progress` value — so pausing freezes the fill exactly where it is and
 * resumes from there (a setTimeout + CSS-animation pair would desync on
 * pause). Only transform/opacity animate, all on the compositor.
 *
 * Mobile (<768px): the looping swipe deck (<WorkDeck>) — a carousel with
 * hover-pause makes no sense without a pointer.
 *
 * Reduced motion: no autoplay and no slide transition; the segments still
 * work as manual tabs, so nothing ever moves on its own.
 */
export function SelectedWork() {
  return (
    <section className="relative bg-paper" aria-label="Selected work">
      {/* Margin annotation — pencils itself in on first scroll into view */}
      <MarginDoodle mark="arrow" className="left-[3.5%] top-44" size={30} rotate={-18} opacity={0.3} />
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
          {NUM_WORDS[homepageProjects.length] ?? homepageProjects.length}{" "}
          systems. <em className="italic text-ink-2">One year.</em>
        </h2>
      </div>

      {/* Desktop: autoplay carousel */}
      <div className="hidden md:block">
        <WorkCarousel projects={homepageProjects} />
      </div>

      {/* Mobile: looping swipe deck */}
      <div className="md:hidden">
        <WorkDeck />
      </div>
    </section>
  );
}

// ─── Desktop autoplay carousel ──────────────────────────────────────────────
function WorkCarousel({ projects }: { projects: WorkProject[] }) {
  const count = projects.length;
  const reduce = useReducedMotion();
  const noMotion = Boolean(reduce);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);

  const stageRef = useRef<HTMLDivElement>(null);
  // One persistent fill element per segment. Keeping them mounted (instead of
  // mounting/unmounting an "active fill") is what makes the hand-off seamless:
  // a completed segment simply stays at scaleX(1) — it never drops to 0.
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const go = useCallback(
    (i: number) => setActive(((i % count) + count) % count),
    [count]
  );
  const next = useCallback(() => go(active + 1), [active, go]);
  const prev = useCallback(() => go(active - 1), [active, go]);

  // Pause when the section isn't on screen — no point burning frames or
  // advancing past cards the visitor can't see.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const progressRef = useRef(0);

  // Set every segment's steady state when the SLIDE changes: past = full,
  // future = empty, active = empty (the rAF loop fills it). Done imperatively
  // (no CSS transition) so a completed segment is instantly full — no 0→1
  // refill flash — and a hover-pause freezes the active bar where it is.
  useEffect(() => {
    progressRef.current = 0;
    fillRefs.current.forEach((el, i) => {
      if (!el) return;
      // Under reduced motion there's no rAF to fill the active bar, so show it
      // full as a static position indicator instead of a half-empty stub.
      const filled = i < active || (i === active && noMotion);
      el.style.transform = filled ? "scaleX(1)" : "scaleX(0)";
      el.style.opacity = i < active ? "0.55" : "1"; // completed reads quieter
    });
  }, [active, noMotion]);

  // Single rAF clock: advances `progress` 0→1, drives the fill bar directly
  // (no React re-render per frame), and flips to the next slide at 1. Pausing
  // (hover / off-screen / reduced-motion) just stops the loop, freezing the
  // fill; resuming continues from the same spot.
  useEffect(() => {
    if (noMotion || paused || !inView) return;

    let raf = 0;
    let last: number | null = null;
    const loop = (t: number) => {
      if (last === null) last = t;
      const dt = t - last;
      last = t;
      progressRef.current = Math.min(1, progressRef.current + dt / AUTOPLAY_MS);
      const el = fillRefs.current[active];
      if (el) el.style.transform = `scaleX(${progressRef.current})`;
      if (progressRef.current >= 1) {
        setActive((a) => (a + 1) % count);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, inView, noMotion, count]);

  // Keyboard arrows when the carousel has focus.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  return (
    <div
      ref={stageRef}
      className="container-wide pb-28 md:pb-36"
      role="group"
      aria-roledescription="carousel"
      aria-label="Selected work carousel"
      // Keeps moving on hover (a living showcase). Only keyboard focus pauses
      // it — otherwise the deck could slide a link out from under a keyboard
      // user mid-reach. Off-screen pausing is handled by the IO below.
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      {/* Stage — one card wide, clips the sliding track. */}
      <div className="overflow-hidden">
        <div
          className="flex w-full"
          style={{
            transform: `translateX(-${active * 100}%)`,
            transition: noMotion
              ? "none"
              : "transform 720ms cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        >
          {projects.map((p, i) => (
            <div
              key={p.id}
              className="w-full shrink-0"
              aria-hidden={i !== active}
              // Keep off-slide cards out of the tab order.
              inert={i !== active ? true : undefined}
            >
              <WorkCard project={p} index={i} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls — arrows, segmented autoplay progress, counter. */}
      <div className="mt-12 flex items-center gap-5 md:gap-8">
        <div className="flex items-center gap-2">
          <ArrowButton dir="prev" onClick={prev} />
          <ArrowButton dir="next" onClick={next} />
        </div>

        {/* Segmented progress — past = full, active = live rAF fill, future =
            empty. One persistent fill per segment (see fillRefs) so hand-off
            never flashes. Doubles as clickable tabs. */}
        <div className="flex flex-1 items-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${p.title}`}
              aria-current={i === active}
              className="group relative h-[3px] flex-1 cursor-pointer overflow-hidden rounded-full bg-ink/12 transition-[height] duration-200 hover:h-[5px]"
            >
              <span
                ref={(el) => {
                  fillRefs.current[i] = el;
                }}
                // transition-none: the fill is driven imperatively (rAF per
                // frame + instant state on slide change). Any transition here
                // would smear the fill and re-introduce the 0→1 refill flash.
                className="absolute inset-0 origin-left bg-signal transition-none"
                style={{
                  transform: `scaleX(${i < active ? 1 : 0})`,
                  opacity: i < active ? 0.55 : 1,
                }}
              />
            </button>
          ))}
        </div>

        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4 tabular-nums">
          {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function ArrowButton({
  dir,
  onClick,
}: {
  dir: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous project" : "Next project"}
      className="
        group flex h-9 w-9 items-center justify-center
        rounded-full border border-ink/15 text-ink-3
        transition-colors duration-200
        hover:border-signal/50 hover:text-signal
        active:scale-95
      "
    >
      <span
        aria-hidden
        className="inline-block transition-transform duration-200 group-hover:translate-x-0"
      >
        {dir === "prev" ? "‹" : "›"}
      </span>
    </button>
  );
}

// ─── Single work card ──────────────────────────────────────────────────────
function WorkCard({ project, index }: { project: WorkProject; index: number }) {
  const reverse = index % 2 === 1;
  const href = project.caseStudy ? `/work/${project.slug}` : "/work";

  return (
    <article
      className="
        relative
        grid grid-cols-1 items-center gap-6
        md:grid-cols-[1.05fr_1fr] md:gap-16
        px-1 md:px-2
      "
    >
      {/* ─── Text column ─────────────────────────────────────────────── */}
      <div className={reverse ? "md:order-2" : "md:order-1"}>
        <div className="mb-4 flex items-baseline gap-4 md:mb-6 md:gap-5">
          <span
            className="font-display text-ink-4"
            style={{
              fontSize: "clamp(34px, 6vw, 96px)",
              lineHeight: 1,
              fontWeight: 400,
              letterSpacing: "-0.03em",
            }}
          >
            {project.num}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
            / 0{homepageProjects.length}
          </span>
        </div>

        <h3
          className="font-display text-ink"
          style={{
            fontSize: "clamp(28px, 3.6vw, 48px)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            fontWeight: 400,
          }}
        >
          {project.title}
        </h3>

        <p
          className="mt-3 font-display italic text-ink-2"
          style={{
            fontSize: "clamp(16px, 1.6vw, 20px)",
            lineHeight: 1.4,
            letterSpacing: "0",
          }}
        >
          {project.tagline}
        </p>

        <p
          className="mt-6 text-ink-2 max-w-[52ch]"
          style={{ fontSize: "clamp(14px, 1.05vw, 16px)", lineHeight: 1.65 }}
        >
          {project.blurb}
        </p>

        {/* Metrics */}
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
          {project.metrics.map((m) => (
            <div key={m.label}>
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

        {/* Stack row */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
            {project.stack.join("  ·  ")}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={href}
            className="
              group inline-flex items-center gap-3
              border border-ink/20
              px-5 py-3
              font-mono text-[11px] uppercase tracking-[0.18em] text-ink
              rounded-sm
              transition-colors duration-300
              hover:bg-signal-cta hover:text-white hover:border-signal
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

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group inline-flex items-center gap-2
                font-mono text-[11px] uppercase tracking-[0.18em] text-signal
                px-2 py-3
                transition-colors duration-300
                hover:text-ink
              "
            >
              Live
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                ↗
              </span>
            </a>
          )}
        </div>

        {project.context && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
            {project.context}
          </p>
        )}
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

// ─── Per-project visual ──────────────────────────────────────────────────
// Projects with real architecture images render those. The remaining two
// keep their abstract SVG mocks until real diagrams arrive.
function WorkVisual({ project }: { project: WorkProject }) {
  const isReal = project.id === "proctoring" || project.id === "messaging";

  return (
    <div
      className="relative h-full w-full overflow-hidden border border-ink/10"
      style={{ background: "var(--paper-soft)" }}
    >
      {/* Faint grid backdrop — only for the abstract mocks. The real diagrams
          have their own surface and the grid would compete with them. */}
      {!isReal && <GridBackdrop />}

      {/* project-specific drawing */}
      {project.id === "proctoring" && (
        <Image
          src={assetUrl("/work/proctoring/architecture-1.png")}
          alt="Proctoring system architecture — production"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-3 md:p-4"
        />
      )}
      {project.id === "messaging" && (
        <Image
          src={assetUrl("/work/chat/chatSystemArchitecture.png")}
          alt="Doubt & Discussion system architecture — production"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-3 md:p-4"
        />
      )}
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

// Analytics — partition map
//
// `cellFilled` is a deterministic spatial hash → matches between SSR and
// client, no hydration mismatch. Same input always returns the same value,
// distribution lands roughly at the original ~45% density target.
function cellFilled(row: number, col: number): boolean {
  const seed = ((row * 73856093) ^ (col * 19349663)) >>> 0;
  return seed % 100 < 45;
}

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
            const filled = cellFilled(row, col);
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
