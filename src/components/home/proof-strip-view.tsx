"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { TextScramble } from "@/components/hero/text-scramble";
import { resumeMetrics, type ProofStats } from "@/lib/proof-data";

/**
 * <ProofStripView> — the credibility bar (presentation only).
 *
 * One typographic band above <WorksOn>: mono labels, Fraunces values,
 * hairlines. When live data lands it grows two instrument panels —
 * a LeetCode-style difficulty ring and a GitHub-style contribution
 * calendar — both rendered in the site's own palette (semantic
 * ok/warn/danger for difficulties, ink scale for the calendar, orange
 * reserved for the single busiest day).
 *
 * The freshness caption is honest about provenance: live stats say when
 * they synced; fallbacks say what vintage the figures are.
 */
export function ProofStripView({ stats }: { stats: ProofStats }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        sectionRef.current.querySelectorAll("[data-proof-cell]"),
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
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
      className="relative bg-paper border-t border-ink/10 md:flex md:min-h-screen md:flex-col md:justify-center"
      aria-label="Proof of skill"
    >
      <div className="container-wide w-full py-14 md:py-18">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-10">
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

        {/* ─── Live instrument panels — render only with real data ─────── */}
        {(hasRing || hasCalendar) && (
          <div className="mt-12 grid grid-cols-1 gap-12 border-t border-ink/10 pt-10 md:grid-cols-2 md:gap-10">
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

      <style>{`
        @keyframes proof-live-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="proof-live-pulse"] { animation: none !important; }
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
    <div data-proof-cell className="flex items-center gap-7 md:gap-9" style={{ opacity: 0 }}>
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
        {/* Difficulty arcs */}
        {arcs.map((a) => (
          <circle
            key={a.key}
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
          <div key={s.key} className="flex items-baseline gap-3">
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
      </div>
    </div>
  );
}

// ─── LeetCode submission calendar — GitHub-heatmap styled ───────────────────

const CELL = 10; // viewBox grid step
const CELL_SIZE = 8;

function SubmissionCalendar({
  calendar,
}: {
  calendar: NonNullable<ProofStats["leetcode"]["calendar"]>;
}) {
  const { days, streak, totalActiveDays } = calendar;

  // Align columns to real weeks: pad the first column so each row is a
  // consistent weekday (row 0 = Sunday), exactly like GitHub's calendar.
  const firstDay = new Date(days[0].date).getUTCDay();
  const cols = Math.ceil((days.length + firstDay) / 7);
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
    <div data-proof-cell style={{ opacity: 0 }}>
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
        leetcode submissions · day by day
      </p>
      <svg
        viewBox={`0 0 ${cols * CELL} ${7 * CELL}`}
        className="w-full max-w-[460px]"
        role="img"
        aria-label="LeetCode submission calendar, last 26 weeks"
      >
        {days.map((d, i) => {
          const pos = i + firstDay;
          const col = Math.floor(pos / 7);
          const row = pos % 7;
          const isMax = d.count === max && d.count > 0;
          return (
            <rect
              key={d.date}
              x={col * CELL}
              y={row * CELL}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={1.5}
              fill={isMax ? "var(--signal)" : "var(--ink)"}
              opacity={isMax ? 0.95 : opacityFor(d.count)}
            >
              <title>{`${d.count} submission${d.count === 1 ? "" : "s"} · ${d.date}`}</title>
            </rect>
          );
        })}
      </svg>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4">
        last 26 weeks · busiest day in orange · max streak {streak} ·{" "}
        {totalActiveDays} active days this year
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
