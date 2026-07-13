"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/motion/use-gsap";
import { person } from "@/lib/person";
import { PortraitPanel } from "./portrait-panel";
import { ScrollIndicator } from "./scroll-indicator";
import { Magnetic } from "@/components/ui/magnetic";

/**
 * <Hero>  (Phase 1 — rework)
 *
 * Split editorial composition:
 *   - Left  (≈55% on desktop): text — eyebrow, name, tagline, signature, CTA
 *   - Right (≈45% on desktop): halftone portrait, full-bleed, breathing
 *
 * On mobile, the layout vertically stacks (portrait above, text below).
 * The CTA points to /work (the showcase), not directly to a single case study —
 * the portfolio is about Shashank's range, not one project.
 *
 * Motion philosophy:
 *   - No text scramble. The name is the name. Scramble was theatrical for it.
 *   - Letters fade-up cleanly. Portrait breathes. Signal trace runs.
 *     The composition itself does the work.
 *   - Scroll-out: text content scrubs up + fades; portrait sits a beat longer
 *     for a sense of "the person remains, the words move on."
 */

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!heroRef.current) return;

      // Below tablet, the workbench (portrait flight + desk) doesn't
      // render at all — there's nothing to hand off to, so the hero stays
      // completely static as the visitor scrolls past it.
      if (window.innerWidth < 768) return;

      // Text content scrubs up and fades as the user scrolls past the hero
      gsap.to(textRef.current, {
        y: -64,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom 30%",
          scrub: 1,
        },
      });

      // NOTE: the portrait deliberately gets NO exit animation here — the
      // Workbench flight is the single owner of its motion. Any fade/scale
      // on this side would make the hand-off read as two different images
      // (the exact inconsistency Shashank flagged).

      // Scroll indicator dies quickly — its job is done as soon as scroll begins
      gsap.to(indicatorRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "top -8%",
          scrub: 0.5,
        },
      });

      ScrollTrigger.refresh();
    },
    { scope: heroRef as React.RefObject<HTMLElement> }
  );

  return (
    <section
      ref={heroRef}
      className="
        relative overflow-hidden bg-paper
        min-h-[calc(100svh-84px)]
        md:h-screen md:min-h-[640px]
      "
    >
      {/* ─── Split grid ────────────────────────────────────────────────────
          On mobile: the portrait fills the visible viewport below the 84px
          navigation. The extra vertical room keeps the face clear and moves
          the copy into the lower paper-feather transition.
          On desktop: 55/45 split with text left, portrait right (unchanged;
          the flight layer measures the same anchor rect as before).
          ─────────────────────────────────────────────────────────────── */}
      <div className="relative grid min-h-[calc(100svh-84px)] grid-cols-1 md:h-full md:min-h-0 md:grid-cols-[1.22fr_1fr] md:grid-rows-1">

        {/* ── TEXT COLUMN ─────────────────────────────────────────────── */}
        <div
          ref={textRef}
          className="
            order-2 md:order-1
            relative z-10
            flex flex-col justify-center
            max-md:absolute max-md:inset-x-0 max-md:bottom-0
            max-md:justify-end
            px-6 md:px-10 lg:pl-[clamp(40px,6vw,96px)] lg:pr-6
            py-10 max-md:pb-8 max-md:pt-14 md:py-0
            will-change-transform
          "
        >
          {/* Paper feather behind the mobile overlay — solid under the
              CTAs, dissolving up into the portrait. Desktop text sits on
              plain paper and never needs it. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 md:hidden"
            style={{
              background:
                "linear-gradient(to top, var(--paper) 0%, var(--paper) 30%, rgba(245,241,232,0.9) 55%, rgba(245,241,232,0.4) 80%, transparent 100%)",
            }}
          />

          {/* Eyebrow — coordinates, not a job title. Hidden on mobile: it
              would sit directly over the portrait's face where the feather
              gradient is thinnest, and the location already lives in the
              meta line below. */}
          <p className="hero-eyebrow hidden font-mono text-[11px] uppercase tracking-[0.22em] text-signal mb-5 md:mb-8 opacity-0 md:block">
            <span aria-hidden>▍</span> AI infrastructure · Chandigarh, India
          </p>

          {/* Name — large, declarative, no scramble */}
          <h1
            className="hero-name font-display text-ink opacity-0"
            style={{
              fontSize: "clamp(46px, 7vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.035em",
              fontWeight: 400,
            }}
          >
            {person.name}.
          </h1>

          {/* Tagline — declaration, not description. Implies the role through
              what it builds, not by announcing a title. Works for backend AND
              AI infra because "production" is the common adversary. */}
          <p
            className="hero-tagline mt-5 font-display italic text-ink-2 opacity-0"
            style={{
              fontSize: "clamp(18px, 1.9vw, 24px)",
              lineHeight: 1.4,
              letterSpacing: "0",
              wordSpacing: "0.02em",
              fontWeight: 400,
              maxWidth: "32ch",
            }}
          >
            Builds the parts that don&apos;t fail
            <br className="hidden md:block" />
            {" "}when production finally looks at them.
          </p>

          {/* Signature + CTA — tighter on mobile so the recruiter anchor
              and CTAs both fit close to the fold. */}
          <div className="hero-meta mt-8 md:mt-12 flex flex-col gap-5 md:gap-7 opacity-0">
            {/* Layered meta block — 2 lines:
                  1. Handle + discipline + location  (primary)
                  2. Recruiter anchor                (secondary)
                MU context lives in the footer + /about — three stacked
                mono lines here read as clutter, and the sketch-style
                MU mark didn't render legibly at 14px anyway. */}
            <div className="flex flex-col gap-1.5">
              {/* Mobile shows one condensed line over the portrait overlay;
                  the location segment and the second stats line return at
                  wider widths where they wrap cleanly. */}
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-3">
                <a
                  href={person.github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-signal transition-colors"
                >
                  {person.github.handle}
                </a>
                <span className="mx-3 text-ink-4">·</span>
                real-time + ai infra
                <span className="hidden min-[420px]:inline">
                  <span className="mx-3 text-ink-4">·</span>
                  Chandigarh, India
                </span>
              </p>

              <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-ink-4 md:block">
                1+ year shipped
                <span className="mx-3">·</span>
                4 production systems
                <span className="mx-3">·</span>
                open to remote roles
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link
                  href="/work"
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
                  Selected work
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </Link>
              </Magnetic>

              <Link
                href="/about"
                className="
                  group inline-flex items-center gap-2
                  font-mono text-[12px] uppercase tracking-[0.18em] text-ink-3
                  px-2 py-3.5
                  sketch-link
                  transition-colors duration-300
                  hover:text-ink
                "
              >
                The story
                <span
                  aria-hidden
                  className="inline-block opacity-60 transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── PORTRAIT COLUMN ─────────────────────────────────────────── */}
        <div
          ref={portraitRef}
          className="
            order-1 md:order-2
            relative
            h-[calc(100svh-84px)] min-h-[560px] md:h-full md:min-h-0
            will-change-transform
          "
        >
          <PortraitPanel />
        </div>
      </div>

      {/* ─── Scroll indicator — bottom-left ────────────────────────────── */}
      <div
        ref={indicatorRef}
        className="absolute bottom-8 left-6 md:left-10 will-change-opacity hidden md:block"
      >
        <ScrollIndicator />
      </div>

      {/* ─── On-load fade choreography (CSS, no JS thrash) ───────────────
          Sequence times the eye left→right→down:
            eyebrow → name → tagline → meta block
          ─────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-eyebrow {
          animation: hero-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }
        .hero-name {
          animation: hero-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards;
        }
        .hero-tagline {
          animation: hero-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.75s forwards;
        }
        .hero-meta {
          animation: hero-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-eyebrow,
          .hero-name,
          .hero-tagline,
          .hero-meta {
            animation: none;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
