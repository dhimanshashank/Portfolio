"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/motion/use-gsap";
import { person } from "@/lib/person";
import { PortraitPanel } from "./portrait-panel";
import { ScrollIndicator } from "./scroll-indicator";
import { Magnetic } from "@/components/ui/magnetic";

/**
 * <Hero>  (Phase 2 — reduction pass)
 *
 * Split editorial composition:
 *   - Left  (≈55% on desktop): text — name, one sentence, one meta row, CTAs
 *   - Right (≈45% on desktop): halftone portrait, full-bleed, breathing
 *
 * WHAT CHANGED AND WHY
 *
 * The text column used to carry eight elements: an eyebrow, the name, an
 * italic tagline, two mono meta rows, an award line, and two CTAs — six of
 * them set in mono uppercase at 11–12px with ~18% tracking. When every line
 * is a label, none of them is emphasis, and the eye gets no rank order. That
 * flatness is the thing that reads as machine-made. So: four elements, four
 * type sizes, one label row.
 *
 * The eyebrow's content (discipline, location) and the meta rows' content
 * (what he builds, where, availability) did not disappear — they were folded
 * into one plain sentence and one short row, both of which now render on
 * mobile too. Previously the entire proof line was `display: none` under
 * 768px, so phone visitors got strictly less signal than desktop ones.
 *
 * HEIGHT
 *
 * The section promises exactly one screen (`100svh − nav`). It was breaking
 * that promise by ~101px on a 393×852 phone, which pushed the primary CTA
 * below the fold. The unit was never the problem — svh is the safe choice,
 * since dvh resizes mid-scroll as the URL bar collapses. The problem was the
 * content: a portrait eating 62% of the fold plus eight stacked text rows.
 * Portrait is now height-budgeted (44svh) and the text stack is half as tall.
 *
 * Motion philosophy:
 *   - No text scramble. The name is the name.
 *   - Letters fade-up cleanly. Portrait breathes. Signal trace runs.
 *   - Scroll-out: text content scrubs up + fades; portrait sits a beat longer
 *     for a sense of "the person remains, the words move on."
 *   - The on-load stagger now finishes at 0.38s instead of 1.2s. A hero whose
 *     text is invisible for over a second spends its best second on nothing.
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
        min-h-[calc(100svh-var(--nav-h))]
        md:h-[calc(100vh-var(--nav-h))] md:min-h-[640px]
      "
    >
      {/* ─── Split grid ────────────────────────────────────────────────────
          On mobile: portrait is height-budgeted so the name, the sentence
          and both CTAs clear the fold. On desktop: 55/45 split with text
          left, portrait right (unchanged — the flight layer measures the
          same anchor rect as before).
          ─────────────────────────────────────────────────────────────── */}
      <div className="relative grid min-h-[calc(100svh-var(--nav-h))] grid-cols-1 md:h-full md:min-h-0 md:grid-cols-[1.22fr_1fr] md:grid-rows-1">

        {/* ── TEXT COLUMN ─────────────────────────────────────────────── */}
        <div
          ref={textRef}
          className="
            relative z-10 order-2
            flex flex-col justify-center
            px-6 md:order-1 md:px-10 lg:pl-[clamp(40px,6vw,96px)] lg:pr-6
            max-md:-mt-10 max-md:justify-start max-md:pb-16 max-md:pt-8
            md:py-0
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
                "linear-gradient(to bottom, transparent 0px, rgba(245,241,232,0.58) 44px, rgba(245,241,232,0.94) 116px, var(--paper) 176px, var(--paper) 100%)",
            }}
          />

          {/* Name — large, declarative, no scramble */}
          <h1
            className="hero-name font-display text-ink opacity-0"
            style={{
              fontSize: "clamp(36px, 7vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.035em",
              fontWeight: 400,
            }}
          >
            {person.name}.
          </h1>

          {/* Lede — one sentence carrying what used to take four rows: the
              discipline, the employer, and the voice. The italic clause is
              the old tagline, kept intact; emphasis comes from style, not
              from another font size. */}
          <p
            className="hero-lede mt-5 text-ink-2 md:mt-6 md:opacity-0"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(16.5px, 1.5vw, 20px)",
              lineHeight: 1.5,
              fontWeight: 400,
              maxWidth: "46ch",
            }}
          >
            I build the real-time and AI infrastructure behind Masters&apos;
            Union&apos;s learning platform —{" "}
            <em className="italic text-ink">
              the parts that don&apos;t fail when production finally looks at
              them.
            </em>
          </p>

          {/* The one label row the hero gets. Location, availability, handle
              — the three things a recruiter scans for. Renders on every
              breakpoint now; the old proof line was desktop-only. */}
          <p className="hero-meta mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3 md:mt-7 md:opacity-0">
            {person.location}
            <span aria-hidden className="mx-2.5 text-ink-4">
              ·
            </span>
            Open to remote
            <span aria-hidden className="mx-2.5 text-ink-4">
              ·
            </span>
            <a
              href={person.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-signal"
            >
              {person.github.handle}
            </a>
          </p>

          {/* gap-3 below sm: at 393px the two buttons plus a 16px gap land
              within a pixel of the available width, so they wrap on some
              devices and not others. 12px keeps them on one row. */}
          <div className="hero-cta mt-8 flex flex-wrap items-center gap-3 sm:gap-4 md:mt-10 md:opacity-0">
            <Magnetic>
              <Link
                href="/work"
                className="
                  group inline-flex items-center gap-3
                  bg-signal-cta text-white
                  px-6 py-3.5
                  font-mono text-[12px] uppercase tracking-[0.18em]
                  sketch-btn
                  transition-colors duration-300
                  hover:bg-signal-cta-hi
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

        {/* ── PORTRAIT COLUMN ─────────────────────────────────────────── */}
        {/* Mobile height is budgeted rather than derived from the image's
            3:4 ratio: at 3:4 it took 62% of a 393×852 fold and pushed the
            CTAs off-screen. 44svh leaves room for the whole text stack.
            Under ~720px of viewport height (iPhone SE class) the two CTAs
            wrap to two rows and 44svh is no longer affordable, so the
            portrait gives back another tenth of the fold. Desktop geometry
            is untouched — the flight layer docks to the anchor rect inside
            <PortraitPanel>, so changing it would move the flight's origin. */}
        <div
          ref={portraitRef}
          className="
            order-1 md:order-2
            relative
            h-[44svh] min-h-[200px]
            max-md:[@media(max-height:720px)]:h-[34svh]
            md:h-full md:min-h-0
            will-change-transform
          "
        >
          <PortraitPanel />
        </div>
      </div>

      {/* ─── Scroll indicator — bottom-left ────────────────────────────── */}
      <div
        ref={indicatorRef}
        className="absolute bottom-8 left-6 will-change-opacity hidden md:block md:left-10"
      >
        <ScrollIndicator />
      </div>

      {/* ─── On-load fade choreography (CSS, no JS thrash) ───────────────
          Sequence times the eye down the column: name → sentence → meta →
          actions, all landing inside 1s. Mobile renders everything except
          the name at full opacity immediately, so a failed animation can
          never leave a phone staring at blank paper.
          ─────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-name {
          animation: hero-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
        }
        @media (min-width: 768px) {
          .hero-lede {
            animation: hero-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.18s forwards;
          }
          .hero-meta {
            animation: hero-fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
          }
          .hero-cta {
            animation: hero-fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.38s forwards;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-name,
          .hero-lede,
          .hero-meta,
          .hero-cta {
            animation: none;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
