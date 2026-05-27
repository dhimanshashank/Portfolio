"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/motion/use-gsap";
import { person } from "@/lib/person";
import { PortraitPanel } from "./portrait-panel";
import { SignalTrace } from "./signal-trace";
import { ScrollIndicator } from "./scroll-indicator";

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

      // Portrait fades slightly later — gives the sense the person lingers
      gsap.to(portraitRef.current, {
        opacity: 0.35,
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

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
      className="relative h-screen min-h-[640px] overflow-hidden bg-paper"
    >
      {/* ─── Split grid ────────────────────────────────────────────────────
          On mobile: column-reverse stacks the portrait visually above text.
          On desktop: 55/45 split with text left, portrait right.
          ─────────────────────────────────────────────────────────────── */}
      <div className="relative grid h-full grid-cols-1 grid-rows-[55vh_auto] md:grid-cols-[1.22fr_1fr] md:grid-rows-1">

        {/* ── TEXT COLUMN ─────────────────────────────────────────────── */}
        <div
          ref={textRef}
          className="
            order-2 md:order-1
            relative z-10
            flex flex-col justify-center
            px-6 md:px-10 lg:pl-[clamp(40px,6vw,96px)] lg:pr-12
            py-10 md:py-0
            will-change-transform
          "
        >
          {/* Eyebrow */}
          <p className="hero-eyebrow font-mono text-[11px] uppercase tracking-[0.22em] text-signal mb-8 opacity-0">
            <span aria-hidden>▍</span> Backend · Real-time systems
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

          {/* Tagline — Option A, italic Fraunces, lead size */}
          <p
            className="hero-tagline mt-5 font-display italic text-ink-2 opacity-0"
            style={{
              fontSize: "clamp(18px, 1.9vw, 24px)",
              lineHeight: 1.4,
              // Italic Fraunces — letters slant right, so negative tracking
              // makes glyphs collide with each other. Keep at 0; let the
              // serif's own metrics do the work.
              letterSpacing: "0",
              wordSpacing: "0.02em",
              fontWeight: 400,
              maxWidth: "32ch",
            }}
          >
            Backend engineer working on real-time systems
            <br className="hidden md:block" />
            {" "}built to survive production.
          </p>

          {/* Signature + CTA */}
          <div className="hero-meta mt-12 flex flex-col gap-7 opacity-0">
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
              backend engineer
              <span className="mx-3 text-ink-4">·</span>
              india
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/work"
                className="
                  group inline-flex items-center gap-3
                  bg-signal text-paper
                  px-6 py-3.5
                  font-mono text-[12px] uppercase tracking-[0.18em]
                  rounded-sm
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

              <Link
                href="/about"
                className="
                  group inline-flex items-center gap-2
                  font-mono text-[12px] uppercase tracking-[0.18em] text-ink-3
                  px-2 py-3.5
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
            h-[55vh] md:h-full
            will-change-transform
          "
        >
          <PortraitPanel />
        </div>
      </div>

      {/* ─── Signal trace — full-width bottom band, sits behind everything ── */}
      <SignalTrace className="bottom-20 hidden md:block" />

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
