"use client";

import Link from "next/link";
import { Fragment, useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { cn } from "@/lib/utils";
import {
  SENTENCES,
  CENTERPIECE,
  DOMAINS_CYCLE,
  DOMAINS_GRID,
  CTA,
  RANGES,
  PIN_VH,
  type ManifestoSentence,
  type Moment,
} from "./manifesto-data";

/**
 * <ManifestoScroll>
 *
 * Phase 2 (rework). Same pinned/scrub mechanics as before; new story:
 *
 *   1. "Most backends pass the demo."
 *   2. → "Few survive the day they're actually used."
 *   3. → CENTERPIECE: "1 year" across four production systems
 *   4. → flashes of domains: WebRTC · Real-time chat · Event analytics
 *   5. → quiet 2×2 grid of all four domains + CTA into Selected Work
 *
 * Routes to /work, not /work/proctoring-system — the showcase, not a single
 * case study. Range first, depth second.
 *
 * Reduced-motion: layers stack vertically. No pinning, no transforms.
 */

export function ManifestoScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  // Layer refs — named for the role they play, not indexed
  const s1Ref = useRef<HTMLDivElement>(null);
  const s2Ref = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const d1Ref = useRef<HTMLDivElement>(null);
  const d2Ref = useRef<HTMLDivElement>(null);
  const d3Ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(
          [s1Ref, s2Ref, centerRef, d1Ref, d2Ref, d3Ref, gridRef, ctaRef].map(
            (r) => r.current
          ),
          { autoAlpha: 1, y: 0, scale: 1, position: "relative" }
        );
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: pinRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * PIN_VH}`,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      // Helper — animates a layer's enter + (optionally) exit across its range
      type LayerKind = "sentence" | "moment" | "grid";
      const layer = (
        ref: React.RefObject<HTMLElement | null>,
        range: readonly [number, number, number, number],
        kind: LayerKind
      ) => {
        if (!ref.current) return;
        const [enterStart, enterEnd, exitStart, exitEnd] = range;
        const enterDur = Math.max(0.001, enterEnd - enterStart);
        const exitDur = Math.max(0.001, exitEnd - exitStart);

        const from =
          kind === "moment"
            ? { autoAlpha: 0, scale: 0.94, y: 12 }
            : kind === "grid"
            ? { autoAlpha: 0, y: 28 }
            : { autoAlpha: 0, y: 16 };
        const enter =
          kind === "moment"
            ? { autoAlpha: 1, scale: 1, y: 0 }
            : { autoAlpha: 1, y: 0 };
        const exit =
          kind === "moment"
            ? { autoAlpha: 0, scale: 1.06, y: -10 }
            : kind === "grid"
            ? { autoAlpha: 1, y: 0 } // grid is the closing state — never exits
            : { autoAlpha: 0, y: -16 };

        tl.fromTo(
          ref.current,
          from,
          { ...enter, duration: enterDur, ease: "power2.out" },
          enterStart
        );
        if (kind !== "grid") {
          tl.to(
            ref.current,
            { ...exit, duration: exitDur, ease: "power2.in" },
            exitStart
          );
        }
      };

      // ─── Wire all layers ────────────────────────────────────────────
      layer(s1Ref, RANGES.sentence1, "sentence");
      layer(s2Ref, RANGES.sentence2, "sentence");
      layer(centerRef, RANGES.centerpiece, "moment");
      layer(d1Ref, RANGES.domain1, "moment");
      layer(d2Ref, RANGES.domain2, "moment");
      layer(d3Ref, RANGES.domain3, "moment");
      layer(gridRef, RANGES.grid, "grid");
      layer(ctaRef, RANGES.cta, "grid");

      // ─── Word-by-word stagger on sentence layers ────────────────────
      const wordStagger = (
        ref: React.RefObject<HTMLElement | null>,
        startPos: number
      ) => {
        if (!ref.current) return;
        const words = ref.current.querySelectorAll<HTMLElement>("[data-word]");
        if (!words.length) return;
        tl.fromTo(
          words,
          { yPercent: 50, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.04,
            stagger: 0.008,
            ease: "power2.out",
          },
          startPos + 0.005
        );
      };
      wordStagger(s1Ref, RANGES.sentence1[0]);
      wordStagger(s2Ref, RANGES.sentence2[0]);
    },
    { scope: sectionRef as React.RefObject<HTMLElement> }
  );

  return (
    <section
      ref={sectionRef}
      className="manifesto relative bg-paper"
      style={{ height: `${(PIN_VH + 1) * 100}vh` }}
      aria-label="What I work on"
    >
      <div
        ref={pinRef}
        className="relative h-screen w-full overflow-hidden grain"
      >
        <div className="container-wide absolute inset-0 flex items-center justify-center">
          {/* Sentences */}
          <SentenceLayer ref={s1Ref} sentence={SENTENCES[0]} />
          <SentenceLayer ref={s2Ref} sentence={SENTENCES[1]} />

          {/* Centerpiece — "1 year" */}
          <MomentLayer ref={centerRef} moment={CENTERPIECE} size="hero" />

          {/* Domain flashes */}
          <MomentLayer ref={d1Ref} moment={DOMAINS_CYCLE[0]} size="medium" />
          <MomentLayer ref={d2Ref} moment={DOMAINS_CYCLE[1]} size="medium" />
          <MomentLayer ref={d3Ref} moment={DOMAINS_CYCLE[2]} size="medium" />

          {/* Settled state — grid + CTA stack inside ONE flex column so
              tall domain labels can't push the CTA off-screen or collide
              with it. Each child keeps its own ref so they animate
              independently in opacity, but their layout is shared. */}
          <div
            aria-hidden={false}
            className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-6 pt-24 pb-20 md:gap-14 md:pt-28 md:pb-24"
          >
            <DomainGrid ref={gridRef} />
            <ClosingCta ref={ctaRef} />
          </div>
        </div>

        {/* Bottom progress strip */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-ink/10"
        >
          <div
            ref={progressRef}
            className="h-full origin-left bg-signal"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* Section eyebrow */}
        <p className="absolute top-8 left-6 md:left-10 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
          <span className="text-signal">▍</span> Manifesto
        </p>
      </div>
    </section>
  );
}

// ─── Sentence layer — word-by-word reveal with optional highlight ──────────
const SentenceLayer = ({
  ref,
  sentence,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  sentence: ManifestoSentence;
}) => {
  const words = sentence.text.split(" ");
  return (
    <div
      ref={ref}
      className="absolute inset-x-0 px-6 text-center will-change-transform"
      style={{ opacity: 0 }}
    >
      <h2
        className="font-display text-ink mx-auto"
        style={{
          fontSize: "clamp(36px, 5.8vw, 84px)",
          // Bumped from 1.08 → 1.18 so italic ascenders & descenders have
          // breathing room and never visually collide with neighboring lines.
          lineHeight: 1.18,
          // Italic Fraunces glyphs slant right — negative tracking makes the
          // next letter eat the descender of the previous one. Keep at 0 for
          // italic, rely on wordSpacing for breathing room between words.
          letterSpacing: "0",
          // A touch more wordSpacing to compensate for the italic right-slant
          // creating optical proximity between adjacent words.
          wordSpacing: "0.18em",
          fontStyle: "italic",
          fontWeight: 400,
          maxWidth: "22ch",
          // Italic glyphs frequently exceed their inline-box on the right edge.
          // Allow them to render past the parent's content box without clipping.
          overflow: "visible",
        }}
      >
        {words.map((word, i) => {
          const isHighlight = sentence.highlight?.includes(i);
          return (
            // Fragment so the inter-word space sits OUTSIDE the word wrapper —
            // otherwise inline-block adjacency eats the spacing.
            <Fragment key={i}>
              <span
                className="inline-block align-baseline"
                // overflow:hidden was the previous masking trick for the
                // word-stagger animation, but it cropped italic descenders
                // (y, p) and the right-slanted trailing glyphs of "they're",
                // "actually", etc. Opacity on the animated child already
                // hides the pre-reveal state — clipping isn't needed.
                style={{
                  overflow: "visible",
                  // Descender room (italic y, p, g, etc.) so the lower edge
                  // of "y" in "they're"/"actually" never clips.
                  paddingBottom: "0.22em",
                  // Italic right-slant room — the trailing slant of glyphs
                  // like "y" in "actually", "d" in "used" needs space.
                  paddingRight: "0.08em",
                  // Top buffer for the rise-in animation's pre-reveal Y
                  paddingTop: "0.05em",
                }}
              >
                <span
                  data-word
                  className={cn(
                    "inline-block will-change-transform",
                    isHighlight && "text-signal"
                  )}
                  style={{
                    // Mirror — keep the inner box from re-clipping
                    overflow: "visible",
                  }}
                >
                  {word}
                </span>
              </span>
              {i < words.length - 1 ? " " : ""}
            </Fragment>
          );
        })}
      </h2>
    </div>
  );
};
SentenceLayer.displayName = "SentenceLayer";

// ─── Moment layer — used for both centerpiece (hero) and domain flashes ────
const MomentLayer = ({
  ref,
  moment,
  size,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  moment: Moment;
  size: "hero" | "medium";
}) => {
  // Slightly relaxed line-heights so descenders & ascenders don't collide
  // with the label below. Smaller `hero` max so "1 year" doesn't dominate
  // the whole viewport at large widths and squeeze the label out.
  const valueStyle =
    size === "hero"
      ? {
          fontSize: "clamp(110px, 16vw, 220px)",
          lineHeight: 1.0,
          letterSpacing: "-0.035em",
        }
      : {
          fontSize: "clamp(72px, 11vw, 160px)",
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
        };

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 flex flex-col items-center text-center will-change-transform"
      style={{ opacity: 0 }}
    >
      {moment.eyebrow && (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal mb-6">
          {moment.eyebrow}
        </p>
      )}
      {/* Block element (not inline span) so line-height behaves predictably
          and the label below sits at a stable distance regardless of glyph
          metrics. */}
      <div
        className="font-display text-ink"
        style={{
          ...valueStyle,
          fontWeight: 400,
          maxWidth: "18ch",
          display: "block",
        }}
      >
        {moment.value}
      </div>
      <p
        className="mt-10 md:mt-12 max-w-[42ch] font-mono text-[12px] uppercase tracking-[0.18em] text-ink-3"
      >
        {moment.label}
      </p>
    </div>
  );
};
MomentLayer.displayName = "MomentLayer";

// ─── Domain grid — 2×2 settled state ───────────────────────────────────────
// No longer absolutely positioned — sits inside the shared flex container
// so it can't overlap the CTA regardless of label length.
const DomainGrid = ({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) => (
  <div ref={ref} className="w-full will-change-transform" style={{ opacity: 0 }}>
    <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 mb-8 md:mb-10">
      Four domains. One year.
    </p>
    <div className="mx-auto grid max-w-3xl grid-cols-2 gap-x-12 gap-y-8 md:gap-x-20 md:gap-y-10">
      {DOMAINS_GRID.map((m, i) => (
        <div key={i} className="flex flex-col">
          {m.eyebrow && (
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal mb-3">
              {m.eyebrow}
            </p>
          )}
          <span
            className="font-display text-ink"
            style={{
              fontSize: "clamp(28px, 3.8vw, 52px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {m.value}
          </span>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3 max-w-[24ch]">
            {m.label}
          </p>
        </div>
      ))}
    </div>
  </div>
);
DomainGrid.displayName = "DomainGrid";

// ─── Closing CTA ───────────────────────────────────────────────────────────
// Same — flex child, not absolutely positioned. Stays directly under the grid.
const ClosingCta = ({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) => (
  <div ref={ref} className="w-full will-change-transform" style={{ opacity: 0 }}>
    <div className="flex flex-col items-center text-center">
      <p
        className="font-display italic text-ink-2 mb-5"
        style={{
          fontSize: "clamp(16px, 2vw, 22px)",
          lineHeight: 1.3,
          // Italic — no negative tracking. Glyphs slant right; tightening
          // them just makes the next letter eat the previous one.
          letterSpacing: "0",
          fontWeight: 400,
        }}
      >
        {CTA.preLabel}
      </p>
      <Link
        href={CTA.link}
        className="
          group inline-flex items-center gap-3
          border border-ink/20
          px-6 py-3.5
          font-mono text-[12px] uppercase tracking-[0.18em] text-ink
          rounded-sm
          transition-colors duration-300
          hover:bg-signal hover:text-paper hover:border-signal
        "
      >
        {CTA.linkText}
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
        >
          →
        </span>
      </Link>
    </div>
  </div>
);
ClosingCta.displayName = "ClosingCta";
