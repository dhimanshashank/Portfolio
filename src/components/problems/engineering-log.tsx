"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { SketchAsterisk } from "@/components/ui/sketch-marks";
import { TextScramble } from "@/components/hero/text-scramble";
import { problems } from "@/lib/problems-data";
import { SeverityBadge } from "./problem-card";

/**
 * <EngineeringLog> — Plate V (home page teaser)
 *
 * Compact preview of the most recent log entry. Hands the visitor off to
 * /log for the full investigation (and any future entries).
 *
 * Why a teaser rather than the full card here:
 *   The home page already does a lot of work — manifesto + four projects +
 *   territory bar. A full P2 investigation in the middle of the run would
 *   dominate the page. The teaser keeps the signal ("I write these up")
 *   without burying the work above.
 *
 * Renders ONE preview tile for the latest entry: severity + tags + date,
 * title, one-sentence hook, link to the full read. Plus an "Open the log →"
 * exit ramp to /log for the rest.
 *
 * Subtle in-place drift on both the tile and the asterisk — ambient, not
 * animated. Same motion language as the rest of the page.
 */
export function EngineeringLog() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const reveal = (
        el: Element | null,
        opts: { y?: number; duration?: number; start?: string } = {}
      ) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: opts.y ?? 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: opts.duration ?? 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: opts.start ?? "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      };

      reveal(sectionRef.current.querySelector("[data-log-header]"));
      reveal(sectionRef.current.querySelector("[data-log-tile]"), {
        y: 24,
        duration: 0.8,
        start: "top 80%",
      });
      reveal(sectionRef.current.querySelector("[data-log-cta]"), {
        y: 0,
        duration: 0.5,
        start: "top 90%",
      });
    },
    { scope: sectionRef as React.RefObject<HTMLElement> }
  );

  const latest = problems[0];
  if (!latest) return null;

  // First sentence only — the hook is 2 sentences in the data file, we want
  // just the opening line for the teaser.
  const hookFirstSentence = latest.hook.split(/(?<=[.!?])\s+/)[0];

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper border-t border-ink/10"
      aria-label="Engineering log"
    >
      <div className="container-wide py-20 md:py-28">

        {/* ─── Section header ──────────────────────────────────────────── */}
        <div data-log-header style={{ opacity: 0 }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 mb-8">
            <span className="text-signal">▍</span> Plate V — Engineering Log
          </p>

          <h2
            className="font-display italic text-ink max-w-[22ch]"
            style={{
              fontSize: "clamp(28px, 3.6vw, 44px)",
              lineHeight: 1.12,
              letterSpacing: "0",
              wordSpacing: "0.06em",
              fontWeight: 400,
            }}
          >
            Problems worth writing down.
          </h2>

          <p
            className="mt-4 text-ink-2 max-w-[56ch]"
            style={{ fontSize: "clamp(13px, 1.05vw, 15px)", lineHeight: 1.65 }}
          >
            A running log of production investigations — the clue that cracked
            each one, the root cause, the fix. New entries get added as they
            get solved.
          </p>
        </div>

        {/* ─── Preview tile — the latest entry ─────────────────────────── */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            href="/log"
            data-log-tile
            className="
              log-tile-drift group relative block w-full max-w-[720px]
              rounded-sm border border-ink/12 bg-paper-soft/60
              px-6 py-7 md:px-9 md:py-9
              overflow-hidden
              transition-colors duration-300
              hover:border-ink/30
            "
            style={{
              opacity: 0,
              animation: "log-tile-drift 11s ease-in-out infinite",
              willChange: "transform",
            }}
          >
            {/* Drifting asterisk corner */}
            <span
              aria-hidden
              className="log-tile-asterisk absolute top-5 right-5 text-ink-3 transition-colors group-hover:text-signal"
              style={{
                width: 16,
                height: 16,
                opacity: 0.55,
                display: "inline-block",
                animation: "log-tile-asterisk 16s ease-in-out infinite",
                willChange: "transform",
              }}
            >
              <SketchAsterisk
                style={{ width: "100%", height: "100%" }}
                color="currentColor"
                weight={1.1}
              />
            </span>

            {/* Eyebrow row */}
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4 mb-4 pr-[40px]">
              <TextScramble
                text="Latest entry"
                startOnMount={false}
                startOnView
                duration={1}
                as="span"
              />
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between gap-3 flex-wrap pr-[40px]">
              <div className="flex items-center gap-3 flex-wrap">
                <SeverityBadge severity={latest.severity} />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
                  {latest.tags.join("  ·  ")}
                </span>
              </div>
              <time
                dateTime={latest.date}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4"
              >
                {new Date(latest.date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </div>

            {/* Title — italic Fraunces, same scale as the small card titles
                elsewhere on the site (case study cards, Selected Work) */}
            <h3
              className="mt-5 font-display italic text-ink group-hover:text-signal transition-colors duration-300"
              style={{
                fontSize: "clamp(20px, 2.2vw, 28px)",
                lineHeight: 1.18,
                letterSpacing: "-0.005em",
                wordSpacing: "0.04em",
                fontWeight: 400,
                maxWidth: "28ch",
              }}
            >
              {latest.title}
            </h3>

            {/* One-sentence hook */}
            <p
              className="mt-3 text-ink-2 max-w-[60ch]"
              style={{ fontSize: "clamp(13px, 0.95vw, 14.5px)", lineHeight: 1.65 }}
            >
              {hookFirstSentence}
            </p>

            {/* Footer link affordance */}
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-ink group-hover:text-signal transition-colors">
              Read the investigation
              <span
                aria-hidden
                className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1.5"
              >
                →
              </span>
            </p>
          </Link>
        </div>

        {/* ─── Exit ramp — open the whole log ──────────────────────────── */}
        <div
          data-log-cta
          className="mt-10 flex justify-center"
          style={{ opacity: 0 }}
        >
          <Link
            href="/log"
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
            Open the log
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Ambient drift keyframes — same family as the rest of the page */}
      <style>{`
        @keyframes log-tile-drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50%      { transform: translate(0, -4px) rotate(0.15deg); }
        }
        @keyframes log-tile-asterisk {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50%      { transform: translate(2px, -3px) rotate(8deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .log-tile-drift, .log-tile-asterisk { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
