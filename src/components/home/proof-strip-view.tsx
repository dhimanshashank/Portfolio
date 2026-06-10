"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { resumeMetrics, type ProofStats } from "@/lib/proof-data";

/**
 * <ProofStripView> — the credibility bar (presentation only).
 *
 * One typographic band above <WorksOn>: mono labels, Fraunces values,
 * hairlines. Reads as a colophon, not a dashboard — no cards, no icons,
 * no color except the standard eyebrow tick.
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

  if (stats.github.totalContributions !== null) {
    cells.splice(1, 0, {
      value: String(stats.github.totalContributions),
      label: "commits, last year",
    });
  }

  const freshness =
    stats.source === "live"
      ? `synced ${relativeHours(stats.fetchedAt)}`
      : "figures as of June 2026";

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper border-t border-ink/10"
      aria-label="Proof of skill"
    >
      <div className="container-wide py-14 md:py-18">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
            <span className="text-signal">▍</span> Measured, not claimed
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
            {freshness}
          </p>
        </div>

        <ul
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {cells.map((cell) => (
            <li key={cell.label} data-proof-cell style={{ opacity: 0 }}>
              <span
                className="block font-display tabular-nums text-ink"
                style={{
                  fontSize: "clamp(30px, 3.4vw, 48px)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  fontWeight: 400,
                }}
              >
                {cell.value}
              </span>
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
      </div>
    </section>
  );
}

function relativeHours(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.max(0, Math.round(ms / 3_600_000));
  if (hours < 1) return "just now";
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
