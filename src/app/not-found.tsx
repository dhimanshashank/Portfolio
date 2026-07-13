import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — This page was never drawn",
  robots: { index: false, follow: false },
};

/**
 * 404 — the sheet that isn't in the sketchbook.
 *
 * Static server component, deliberately dependency-free: no GSAP, no
 * client boundary, nothing that can itself fail on a page whose whole job
 * is to fail gracefully. The doodle is the site's paper plane after a
 * less-than-cinematic landing — dotted flight path in, nose in the paper,
 * a few impact ticks.
 */
export default function NotFound() {
  return (
    <div className="container-base flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      {/* ─── Crashed paper plane doodle ─────────────────────────────── */}
      <svg
        aria-hidden
        viewBox="0 0 260 120"
        className="w-[230px] max-w-[70vw] text-ink md:w-[260px]"
        style={{ overflow: "visible" }}
      >
        {/* Dotted flight path — swooping in from the top-left, ending badly */}
        <path
          d="M8 14 Q 80 2, 128 26 Q 176 50, 186 88"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeDasharray="1 7"
          opacity="0.45"
        />
        {/* The plane — nose-down in the paper, tail up */}
        <g transform="translate(186 96) rotate(118)">
          {/* paper base so the ground line doesn't show through the wings */}
          <path d="M23 8.5 L2.5 2.25 Q5.25 5.75 6.8 8.2 Z" fill="var(--paper)" />
          <path d="M23 8.5 L4 14.75 Q5.5 11.25 6.8 8.4 Z" fill="var(--paper)" />
          <path d="M23 8.5 L2.5 2.25 Q5.25 5.75 6.8 8.2 Z" fill="currentColor" fillOpacity="0.05" />
          <path d="M23 8.5 L4 14.75 Q5.5 11.25 6.8 8.4 Z" fill="currentColor" fillOpacity="0.11" />
          <path d="M23 8.5 Q 14.75 5.6, 2.5 2.25" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M2.5 2.25 Q 5.25 5.75, 6.8 8.2" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M23 8.5 Q 14.25 11.7, 4 14.75" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M4 14.75 Q 5.5 11.25, 6.8 8.4" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M22.75 8.5 Q 15 8.1, 7 8.3" fill="none" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.55" strokeLinecap="round" />
        </g>
        {/* Impact ticks — the "oof" */}
        <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
          <path d="M172 84 L166 78" />
          <path d="M199 82 L205 75" />
          <path d="M178 76 L174 68" />
        </g>
        {/* Ground — wavy pencil line with a little disturbance at the crash */}
        <path
          d="M30 97 Q 70 94.5, 110 97 T 176 96 Q 182 99.5, 192 99 Q 200 98.5, 206 96 T 250 97"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* ─── Words ──────────────────────────────────────────────────── */}
      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
        <span className="text-signal">▍</span> fig. 404 — uncharted
      </p>
      <h1
        className="mt-5 font-display text-ink"
        style={{
          fontSize: "clamp(30px, 4.5vw, 56px)",
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          fontWeight: 400,
        }}
      >
        This page was never drawn.
      </h1>
      <p
        className="mt-5 max-w-[44ch] text-ink-2"
        style={{ fontSize: "clamp(14px, 1.05vw, 16px)", lineHeight: 1.65 }}
      >
        The sheet you&apos;re after isn&apos;t in this sketchbook — maybe it
        was crumpled, maybe the URL took a wrong fold mid-flight.
      </p>

      {/* ─── Exits ──────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="
            group inline-flex items-center gap-3
            bg-signal text-paper
            px-6 py-3.5
            font-mono text-[12px] uppercase tracking-[0.18em]
            sketch-btn
            transition-colors duration-300
            hover:bg-signal-low
          "
        >
          Back to the desk
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
          >
            →
          </span>
        </Link>
        <Link
          href="/work"
          className="
            group inline-flex items-center gap-2
            font-mono text-[12px] uppercase tracking-[0.18em] text-ink-3
            px-2 py-3.5
            sketch-link
            transition-colors duration-300
            hover:text-ink
          "
        >
          Selected work
          <span
            aria-hidden
            className="inline-block opacity-60 transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
