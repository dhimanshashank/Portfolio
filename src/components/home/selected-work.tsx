"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { homepageProjects, type WorkProject } from "@/lib/work-data";
import { WorkDeck } from "./work-deck";

const NUM_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six"] as const;

/**
 * <SelectedWork>
 *
 * The home page's central work section. On desktop the four project cards
 * play as a horizontal showcase: the section pins and vertical scroll
 * scrubs the track sideways, one full-viewport panel per project. Each
 * card's reveal timeline (number rises, title slides, metrics stagger,
 * SVG line-trace) rides the horizontal scrub via containerAnimation.
 *
 * On mobile (≤768px) and under prefers-reduced-motion the track stacks
 * vertically — pinning + horizontal scrub on a phone is hostile, and the
 * layout fallback is pure CSS (md:motion-safe: variants), so no-JS and
 * reduced-motion visitors get a normal page.
 */
export function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const cards =
        sectionRef.current.querySelectorAll<HTMLElement>("[data-work-card]");

      // One reveal timeline per card; only the ScrollTrigger vars differ
      // between the horizontal (desktop) and vertical (mobile) modes.
      const buildReveal = (
        card: HTMLElement,
        scrollTrigger: ScrollTrigger.Vars
      ) => {
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

        const tl = gsap.timeline({ scrollTrigger });

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
      };

      const mm = gsap.matchMedia();

      // Desktop + motion ok → pinned horizontal showcase.
      mm.add(
        "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
        () => {
          const pin = pinRef.current;
          const track = trackRef.current;
          if (!pin || !track) return;

          const scrollWidth = () => track.scrollWidth - window.innerWidth;

          const scrollTween = gsap.to(track, {
            x: () => -scrollWidth(),
            ease: "none",
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: () => `+=${scrollWidth()}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          cards.forEach((card) => {
            buildReveal(card, {
              trigger: card,
              containerAnimation: scrollTween,
              start: "left 72%",
              toggleActions: "play none none reverse",
            });
          });
        }
      );

      // Reduced motion → no pin, no scrub, everything simply visible.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          sectionRef.current!.querySelectorAll(
            "[data-work-number], [data-work-title], [data-work-tagline], [data-work-blurb], [data-work-metric], [data-work-stack], [data-work-viz]"
          ),
          { autoAlpha: 1 }
        );
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
          {NUM_WORDS[homepageProjects.length] ?? homepageProjects.length} systems.{" "}
          <em className="italic text-ink-2">One year.</em>
        </h2>
      </div>

      {/* Desktop (≥768): pinned horizontal scrub showcase, or a vertical
          stack under reduced motion. Hidden on phones — they get the
          looping swipe deck below instead. */}
      <div
        ref={pinRef}
        className="hidden md:block md:pb-40 md:motion-safe:overflow-hidden md:motion-safe:pb-0"
      >
        <div
          ref={trackRef}
          className="
            flex flex-col gap-12 md:gap-40
            md:motion-safe:h-screen md:motion-safe:w-max md:motion-safe:flex-row
            md:motion-safe:items-stretch md:motion-safe:gap-0
          "
        >
          {homepageProjects.map((p, i) => (
            <div
              key={p.id}
              data-work-panel
              className="md:motion-safe:flex md:motion-safe:h-screen md:motion-safe:w-screen md:motion-safe:shrink-0 md:motion-safe:items-center"
            >
              <div className="container-wide w-full">
                <WorkCard project={p} index={i} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile (<768): looping card-stack deck — swipe the top card away
          and the next rises; the swiped one cycles to the back. */}
      <div className="md:hidden">
        <WorkDeck />
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
        relative
        rounded-sm border border-ink/12 bg-paper-soft/40 p-5
        md:rounded-none md:border-0 md:bg-transparent md:p-0
        grid grid-cols-1 gap-6 items-center
        md:grid-cols-[1.05fr_1fr] md:gap-16
      "
    >
      {/* ─── Text column ─────────────────────────────────────────────── */}
      <div className={reverse ? "md:order-2" : "md:order-1"}>
        <div className="flex items-baseline gap-4 mb-4 md:mb-6 md:gap-5">
          <span
            data-work-number
            className="font-display text-ink-4"
            style={{
              fontSize: "clamp(34px, 6vw, 96px)",
              lineHeight: 1,
              fontWeight: 400,
              letterSpacing: "-0.03em",
              opacity: 0,
            }}
          >
            {project.num}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
            / 0{homepageProjects.length}
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
      data-work-viz
      className="relative h-full w-full overflow-hidden border border-ink/10"
      style={{ background: "var(--paper-soft)", opacity: 0 }}
    >
      {/* Faint grid backdrop — only for the abstract mocks. The real diagrams
          have their own surface and the grid would compete with them. */}
      {!isReal && <GridBackdrop />}

      {/* project-specific drawing */}
      {project.id === "proctoring" && (
        <Image
          src="/work/proctoring/architecture-1.png"
          alt="Proctoring system architecture — production"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-3 md:p-4"
        />
      )}
      {project.id === "messaging" && (
        <Image
          src="/work/chat/chatSystemArchitecture.png"
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
