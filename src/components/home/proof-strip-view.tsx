"use client";

import { useEffect, useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { TextScramble } from "@/components/hero/text-scramble";
import { resumeMetrics, type ProofStats } from "@/lib/proof-data";
import { person } from "@/lib/person";

/**
 * <ProofStripView> — the credibility bar (presentation only).
 *
 * On desktop the section pins for ~1.2 viewports and scroll scrubs the
 * scene: headline numbers land first, then the LeetCode difficulty ring
 * sweeps itself closed while the center count climbs, and the submission
 * calendar cascades in cell by cell, oldest week first. The visitor has
 * to stop here — which is the point of a proof section.
 *
 * Mobile keeps simple fade reveals (no pin); prefers-reduced-motion gets
 * everything visible immediately. SSR markup always carries the final
 * state (full arcs, final opacities), so no-JS readers lose nothing.
 */
export function ProofStripView({ stats }: { stats: ProofStats }) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root || !pinRef.current) return;

      const q = (sel: string) => root.querySelector<HTMLElement>(sel);
      const qa = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));

      const headerRow = q("[data-proof-head]");
      const cells = qa("[data-proof-cell]");
      const panels = qa("[data-proof-panel]");
      const arcs = qa("[data-ring-arc]");
      const ringNum = q("[data-ring-num]");
      const ringRows = qa("[data-ring-row]");
      const calCells = qa("[data-cal-cell]");
      const calMeta = qa("[data-cal-meta]");

      const mm = gsap.matchMedia();

      // Desktop + motion ok → pinned scrub scene.
      mm.add(
        "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
        () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "+=120%",
              scrub: 0.6,
              pin: pinRef.current,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          if (headerRow) {
            tl.fromTo(
              headerRow,
              { autoAlpha: 0, y: 16 },
              { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
              0
            );
          }
          tl.fromTo(
            cells,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.07 },
            0.08
          );

          // Instrument panels appear…
          tl.fromTo(
            panels,
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.1 },
            0.45
          );

          // …the ring sweeps itself closed, one difficulty at a time…
          arcs.forEach((arc, i) => {
            const dash = Number(arc.dataset.dash ?? 0);
            const rest = Number(arc.dataset.circ ?? 0) - dash;
            tl.fromTo(
              arc,
              { attr: { "stroke-dasharray": `0 ${dash + rest}` } },
              {
                attr: { "stroke-dasharray": `${dash} ${rest}` },
                duration: 0.3,
                ease: "power1.inOut",
              },
              0.55 + i * 0.12
            );
          });

          // …while the center count climbs to the real figure…
          if (ringNum) {
            const target = Number(ringNum.dataset.value ?? 0);
            const proxy = { v: 0 };
            tl.to(
              proxy,
              {
                v: target,
                duration: 0.45,
                ease: "power1.out",
                onUpdate: () => {
                  ringNum.textContent = String(Math.round(proxy.v));
                },
              },
              0.55
            );
          }
          tl.fromTo(
            ringRows,
            { autoAlpha: 0, x: -10 },
            { autoAlpha: 1, x: 0, duration: 0.25, ease: "power2.out", stagger: 0.08 },
            0.62
          );

          // …and the calendar cascades in, oldest week first.
          if (calCells.length) {
            tl.fromTo(
              calCells,
              { scale: 0, transformOrigin: "center" },
              {
                scale: 1,
                duration: 0.3,
                ease: "back.out(1.6)",
                stagger: { each: 0.0035 },
              },
              0.6
            );
          }
          tl.fromTo(
            calMeta,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.25 },
            0.95
          );

          // Hold the finished scene for a beat before releasing the pin.
          tl.to({}, { duration: 0.35 });
        }
      );

      // Mobile + motion ok → simple stagger, no pin.
      mm.add(
        "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set([...(headerRow ? [headerRow] : []), ...calMeta, ...ringRows], {
            autoAlpha: 1,
          });
          gsap.fromTo(
            [...cells, ...panels],
            { autoAlpha: 0, y: 14 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.07,
              scrollTrigger: {
                trigger: root,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      );

      // Reduced motion → everything visible, final state.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ...(headerRow ? [headerRow] : []),
            ...cells,
            ...panels,
            ...ringRows,
            ...calMeta,
          ],
          { autoAlpha: 1 }
        );
      });
    },
    { scope: sectionRef as React.RefObject<HTMLElement> }
  );

  const cells: { value: string; label: string; sub?: string }[] = [
    {
      value: `${stats.leetcode.solved}+`,
      label: "leetcode solved",
      sub: `beats ${stats.leetcode.beatsPercent}%`,
    },
    ...resumeMetrics.map((m) => ({ value: m.value, label: m.label })),
  ];

  const freshness =
    stats.source === "live"
      ? `live · synced ${relativeHours(stats.fetchedAt)}`
      : "figures as of June 2026";

  const hasRing = stats.leetcode.byDifficulty !== null;
  const hasCalendar =
    stats.leetcode.calendar !== null && stats.leetcode.calendar.days.length > 0;

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper border-t border-ink/10"
      aria-label="Proof of skill"
    >
      <div
        ref={pinRef}
        className="md:motion-safe:flex md:motion-safe:h-screen md:motion-safe:flex-col md:motion-safe:justify-center"
      >
        <div className="container-wide w-full py-14 md:py-16">
          <div
            data-proof-head
            className="flex items-baseline justify-between gap-4 flex-wrap mb-10"
            style={{ opacity: 0 }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
              <span className="text-signal">▍</span> Measured, not claimed
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
              {stats.source === "live" && (
                <span
                  aria-hidden
                  className="mr-2 inline-block h-[6px] w-[6px] rounded-full bg-[var(--ok)] align-middle"
                  style={{ animation: "proof-live-pulse 2.4s ease-in-out infinite" }}
                />
              )}
              {freshness}
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {cells.map((cell) => (
              <li key={cell.label} data-proof-cell style={{ opacity: 0 }}>
                <TextScramble
                  text={cell.value}
                  startOnMount={false}
                  startOnView
                  duration={1.1}
                  as="span"
                  className="block font-display tabular-nums text-ink font-normal leading-none tracking-[-0.03em] text-[clamp(30px,3.4vw,48px)]"
                />
                <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                  {cell.label}
                </span>
                {cell.sub && (
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4">
                    {cell.sub}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* ─── Live instrument panels — render only with real data.
              Flex-centered as one unit so the pair sits in the middle of
              the band instead of hugging the left edge. ───────────────── */}
          {(hasRing || hasCalendar) && (
            <div className="mt-12 flex flex-col items-center gap-12 border-t border-ink/10 pt-10 md:flex-row md:items-center md:justify-center md:gap-20">
              {hasRing && (
                <DifficultyRing
                  byDifficulty={stats.leetcode.byDifficulty!}
                  solved={stats.leetcode.solved}
                  beatsPercent={stats.leetcode.beatsPercent}
                />
              )}
              {hasCalendar && (
                <SubmissionCalendar calendar={stats.leetcode.calendar!} />
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes proof-live-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
        rect[data-cal-cell] {
          transition: opacity 0.15s ease, stroke 0.15s ease;
        }
        rect[data-cal-cell]:hover {
          opacity: 1;
          stroke: var(--signal);
          stroke-width: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="proof-live-pulse"] { animation: none !important; }
          rect[data-cal-cell] { transition: none; }
        }
      `}</style>
    </section>
  );
}

// ─── LeetCode-style difficulty ring ─────────────────────────────────────────

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;
const RING_GAP = 6; // viewBox units of breathing room between arcs

function DifficultyRing({
  byDifficulty,
  solved,
  beatsPercent,
}: {
  byDifficulty: NonNullable<ProofStats["leetcode"]["byDifficulty"]>;
  solved: number;
  beatsPercent: number;
}) {
  const slices = [
    { key: "easy", label: "Easy", color: "var(--ok)", ...byDifficulty.easy },
    { key: "medium", label: "Medium", color: "var(--warn)", ...byDifficulty.medium },
    { key: "hard", label: "Hard", color: "var(--danger)", ...byDifficulty.hard },
  ];
  const totalSolved = slices.reduce((s, d) => s + d.solved, 0) || 1;

  // Each difficulty's share of the ring is its share of solved problems.
  let offset = -RING_C / 4; // start at 12 o'clock
  const arcs = slices.map((s) => {
    const span = (s.solved / totalSolved) * RING_C;
    const arc = {
      ...s,
      dash: Math.max(0, span - RING_GAP),
      offset: -offset,
    };
    offset += span;
    return arc;
  });

  return (
    <div
      data-proof-panel
      className="flex items-center gap-7 md:gap-9"
      style={{ opacity: 0 }}
    >
      <svg
        viewBox="0 0 128 128"
        className="h-[112px] w-[112px] shrink-0 md:h-[128px] md:w-[128px]"
        role="img"
        aria-label={`LeetCode: ${solved} problems solved — easy ${byDifficulty.easy.solved}, medium ${byDifficulty.medium.solved}, hard ${byDifficulty.hard.solved}`}
      >
        {/* Track */}
        <circle
          cx="64"
          cy="64"
          r={RING_R}
          fill="none"
          stroke="var(--ink)"
          strokeOpacity="0.08"
          strokeWidth="7"
        />
        {/* Difficulty arcs — SSR carries the final sweep; GSAP rewinds and
            replays it on scroll. */}
        {arcs.map((a) => (
          <circle
            key={a.key}
            data-ring-arc
            data-dash={a.dash}
            data-circ={RING_C}
            cx="64"
            cy="64"
            r={RING_R}
            fill="none"
            stroke={a.color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${a.dash} ${RING_C - a.dash}`}
            strokeDashoffset={a.offset}
            opacity="0.9"
          />
        ))}
        {/* Center figures */}
        <text
          data-ring-num
          data-value={solved}
          x="64"
          y="62"
          textAnchor="middle"
          fill="var(--ink)"
          style={{
            fontSize: 30,
            fontFamily: "var(--font-fraunces)",
            letterSpacing: "-0.02em",
          }}
        >
          {solved}
        </text>
        <text
          x="64"
          y="80"
          textAnchor="middle"
          fill="var(--ink-3)"
          style={{
            fontSize: 8,
            fontFamily: "var(--font-jetbrains)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          solved
        </text>
      </svg>

      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          leetcode · beats {beatsPercent}%
        </p>
        {slices.map((s) => (
          <div key={s.key} data-ring-row className="flex items-baseline gap-3">
            <span
              aria-hidden
              className="inline-block h-[8px] w-[8px] rounded-[2px]"
              style={{ background: s.color, opacity: 0.9 }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2 w-[64px]">
              {s.label}
            </span>
            <span className="font-display tabular-nums text-ink text-[17px] leading-none">
              {s.solved}
            </span>
            <span className="font-mono text-[10px] text-ink-4">/ {s.total}</span>
          </div>
        ))}

        <a
          data-ring-row
          href={person.leetcode.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-1 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 transition-colors hover:text-signal"
        >
          View profile
          <span
            aria-hidden
            className="inline-block opacity-70 transition-transform duration-300 group-hover:translate-x-1"
          >
            ↗
          </span>
        </a>
      </div>
    </div>
  );
}

// ─── LeetCode submission calendar — month-segmented, like LeetCode's own ────

const CELL = 10; // viewBox grid step
const CELL_SIZE = 8;
const MONTH_GAP = 8; // viewBox units between month blocks
const LABEL_BAND = 14; // viewBox units reserved UNDER the grid for labels

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type SubmissionDays = NonNullable<
  ProofStats["leetcode"]["calendar"]
>["days"];

type MonthBlock = {
  label: string;
  days: SubmissionDays;
  /** Weekday (0 = Sunday) of the block's first day — its row offset. */
  startDow: number;
  /** Week-columns this block occupies. */
  cols: number;
  /** viewBox x where this block starts. */
  x: number;
};

/** Split the trailing days into per-month blocks, LeetCode style: every
 *  month starts its own column group, with a gap between months. */
function buildMonthBlocks(days: SubmissionDays): MonthBlock[] {
  const blocks: MonthBlock[] = [];
  let current: SubmissionDays = [];
  let currentMonth = -1;
  let x = 0;

  const flush = () => {
    if (!current.length) return;
    const startDow = new Date(current[0].date).getUTCDay();
    const cols = Math.ceil((startDow + current.length) / 7);
    blocks.push({
      label: MONTHS[currentMonth],
      days: current,
      startDow,
      cols,
      x,
    });
    x += cols * CELL + MONTH_GAP;
  };

  for (const d of days) {
    const m = new Date(d.date).getUTCMonth();
    if (m !== currentMonth) {
      flush();
      current = [];
      currentMonth = m;
    }
    current.push(d);
  }
  flush();
  return blocks;
}

function SubmissionCalendar({
  calendar,
}: {
  calendar: NonNullable<ProofStats["leetcode"]["calendar"]>;
}) {
  const { days, streak, totalActiveDays, totalSubmissionsPastYear } = calendar;
  const panelRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  // Custom tooltip — the native <title> tooltip is slow to appear and
  // ignores the design system. One delegated listener pair on the svg
  // positions a paper-styled chip above whichever cell is hovered.
  useEffect(() => {
    const panel = panelRef.current;
    const tip = tipRef.current;
    if (!panel || !tip) return;

    const onOver = (e: PointerEvent) => {
      const cell = (e.target as Element).closest?.("[data-cal-cell]");
      if (!(cell instanceof SVGRectElement)) return;

      const count = cell.dataset.count ?? "0";
      const date = cell.dataset.date ?? "";
      tip.textContent = `${count} submission${count === "1" ? "" : "s"} · ${date}`;

      const cellBox = cell.getBoundingClientRect();
      const panelBox = panel.getBoundingClientRect();
      tip.style.left = `${cellBox.left + cellBox.width / 2 - panelBox.left}px`;
      tip.style.top = `${cellBox.top - panelBox.top}px`;
      tip.style.opacity = "1";
      tip.style.transform = "translate(-50%, calc(-100% - 8px)) scale(1)";
    };

    const onOut = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.("[data-cal-cell]")) return;
      tip.style.opacity = "0";
      tip.style.transform = "translate(-50%, calc(-100% - 4px)) scale(0.96)";
    };

    panel.addEventListener("pointerover", onOver);
    panel.addEventListener("pointerout", onOut);
    return () => {
      panel.removeEventListener("pointerover", onOver);
      panel.removeEventListener("pointerout", onOut);
    };
  }, []);

  const blocks = buildMonthBlocks(days);
  const last = blocks[blocks.length - 1];
  const width = last.x + last.cols * CELL;
  const max = Math.max(...days.map((d) => d.count), 1);

  const opacityFor = (count: number) => {
    if (count === 0) return 0.07;
    const q = count / max;
    if (q <= 0.25) return 0.25;
    if (q <= 0.5) return 0.45;
    if (q <= 0.75) return 0.65;
    return 0.85;
  };

  return (
    <div
      ref={panelRef}
      data-proof-panel
      className="relative w-full max-w-[620px]"
      style={{ opacity: 0 }}
    >
      {/* Tooltip chip — ink surface, mono, follows the hovered cell */}
      <div
        ref={tipRef}
        aria-hidden
        className="pointer-events-none absolute z-10 whitespace-nowrap rounded-sm bg-ink px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-paper"
        style={{
          opacity: 0,
          transform: "translate(-50%, calc(-100% - 4px)) scale(0.96)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      />
      <p
        data-cal-meta
        className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3"
      >
        <span className="font-display text-[15px] normal-case tracking-normal text-ink">
          {totalSubmissionsPastYear}
        </span>{" "}
        submissions in the past one year
      </p>
      <svg
        viewBox={`0 0 ${width} ${7 * CELL + LABEL_BAND}`}
        className="w-full"
        role="img"
        aria-label="LeetCode submission calendar, last 26 weeks, grouped by month"
      >
        {blocks.map((block) => (
          <g key={`${block.label}-${block.x}`}>
            {/* Day cells — each month starts its own column group */}
            {block.days.map((d, i) => {
              const pos = i + block.startDow;
              const col = Math.floor(pos / 7);
              const row = pos % 7;
              const isMax = d.count === max && d.count > 0;
              return (
                <rect
                  key={d.date}
                  data-cal-cell
                  data-count={d.count}
                  data-date={d.date}
                  x={block.x + col * CELL}
                  y={row * CELL}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={1.5}
                  fill={isMax ? "var(--signal)" : "var(--ink)"}
                  opacity={isMax ? 0.95 : opacityFor(d.count)}
                />
              );
            })}

            {/* Month label — centered under its block, LeetCode style */}
            <text
              data-cal-meta
              x={block.x + (block.cols * CELL - 2) / 2}
              y={7 * CELL + 10}
              textAnchor="middle"
              fill="var(--ink-4)"
              style={{
                fontSize: 6.5,
                fontFamily: "var(--font-jetbrains)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {block.label}
            </text>
          </g>
        ))}
      </svg>
      {/* Caption — discrete segments so wrapping happens at clean
          boundaries instead of mid-phrase overflow */}
      <p
        data-cal-meta
        className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4"
      >
        <span>last 26 weeks</span>
        <span>busiest day in orange</span>
        <span>
          max streak <span className="text-ink-2">{streak}</span>
        </span>
        <span>
          <span className="text-ink-2">{totalActiveDays}</span> active days
        </span>
      </p>
    </div>
  );
}

function relativeHours(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.max(0, Math.round(ms / 3_600_000));
  if (hours < 1) return "just now";
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
