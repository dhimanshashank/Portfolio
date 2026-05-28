"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SketchUnderline, SketchAsterisk } from "@/components/ui/sketch-marks";
import {
  SENTENCES,
  DWELL_MS,
  FADE_MS,
  type ManifestoSentence,
} from "./manifesto-data";

/**
 * <ManifestoScroll> — Phase 3.2 (sketch + center rework)
 *
 *   One centered position. Two italic lines that swap in place. The
 *   highlighted "punchline" words carry a hand-drawn pencil underline
 *   that draws itself in after the word lands — picking up the sketch
 *   language of the portrait so the page feels of-a-piece.
 *
 *   Font size capped so each sentence fits cleanly on one line at
 *   desktop widths. Single-line wrap is allowed only on small screens
 *   where it's unavoidable.
 */
export function ManifestoScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);

  // Pause cycling when section leaves viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-cycle
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(
      () => setIdx((i) => (i + 1) % SENTENCES.length),
      DWELL_MS
    );
    return () => clearTimeout(t);
  }, [idx, active]);

  // Reduced motion preference
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const cb = () => setReduced(m.matches);
    m.addEventListener?.("change", cb);
    return () => m.removeEventListener?.("change", cb);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="manifesto relative bg-paper grain"
      style={{ minHeight: "100vh" }}
      aria-label="Manifesto"
    >
      {/* Plate marker — top-left */}
      <p className="absolute top-8 left-6 md:left-10 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 z-10">
        <span className="text-signal">▍</span> Plate II — Manifesto
      </p>

      {/* Centered stage — vertically + horizontally */}
      <div className="container-wide flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Tiny margin asterisk above — like a footnote marker */}
        <SketchAsterisk
          className="mb-12 text-ink-3"
          style={{ width: 18, height: 18, opacity: 0.55 }}
        />

        {reduced ? (
          <div className="flex flex-col items-center gap-12">
            <SentenceStatic sentence={SENTENCES[0]} />
            <div aria-hidden className="h-[2px] w-16 bg-signal" />
            <SentenceStatic sentence={SENTENCES[1]} />
          </div>
        ) : (
          <>
            <div
              className="relative flex items-center justify-center w-full"
              style={{ minHeight: "clamp(120px, 18vh, 220px)" }}
            >
              <AnimatePresence mode="wait">
                <SentenceLayer key={idx} sentence={SENTENCES[idx]} />
              </AnimatePresence>
            </div>

            {/* Index dashes */}
            <div className="mt-16 md:mt-20 flex items-center gap-3">
              {SENTENCES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Show sentence ${i + 1}`}
                  className="group flex items-center justify-center p-2 -m-2"
                >
                  <span
                    className={cn(
                      "block h-[2px] transition-all duration-500",
                      i === idx
                        ? "w-10 bg-signal"
                        : "w-5 bg-ink/25 group-hover:bg-ink/55"
                    )}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── Animated sentence layer — fits on one line at desktop ───────────────
function SentenceLayer({ sentence }: { sentence: ManifestoSentence }) {
  const words = sentence.text.split(" ");
  return (
    <motion.h2
      className="
        font-display italic text-ink mx-auto text-center
        whitespace-normal md:whitespace-nowrap
      "
      style={{
        // Capped so both sentences fit comfortably on one line at desktop.
        // On narrow mobile it's allowed to wrap naturally.
        fontSize: "clamp(32px, 5vw, 68px)",
        lineHeight: 1.15,
        letterSpacing: "0",
        wordSpacing: "0.14em",
        fontWeight: 400,
        overflow: "visible",
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
        exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
      }}
    >
      {words.map((word, i) => {
        const isHighlight = sentence.highlight?.includes(i);
        return (
          <Fragment key={i}>
            <span
              className="inline-block align-baseline relative"
              style={{
                overflow: "visible",
                paddingBottom: "0.28em",
                paddingTop: "0.05em",
              }}
            >
              <motion.span
                className={cn(
                  "inline-block will-change-transform relative",
                  isHighlight && "text-signal"
                )}
                style={{ overflow: "visible" }}
                variants={{
                  hidden: { y: "60%", opacity: 0, filter: "blur(4px)" },
                  visible: {
                    y: "0%",
                    opacity: 1,
                    filter: "blur(0px)",
                    transition: {
                      duration: FADE_MS / 1000,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                  exit: {
                    y: "-50%",
                    opacity: 0,
                    filter: "blur(3px)",
                    transition: {
                      duration: (FADE_MS - 100) / 1000,
                      ease: [0.7, 0, 0.84, 0],
                    },
                  },
                }}
              >
                {word}

                {/* Hand-drawn pencil underline on highlighted words */}
                {isHighlight && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 right-0"
                    style={{
                      bottom: "-0.05em",
                      color: "var(--signal)",
                    }}
                  >
                    <SketchUnderline
                      color="currentColor"
                      weight={1.1}
                      drawMs={650}
                    />
                  </span>
                )}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        );
      })}
    </motion.h2>
  );
}

// ─── Static fallback (reduced motion) ────────────────────────────────────
function SentenceStatic({ sentence }: { sentence: ManifestoSentence }) {
  const words = sentence.text.split(" ");
  return (
    <h2
      className="font-display italic text-ink text-center mx-auto"
      style={{
        fontSize: "clamp(30px, 4.6vw, 60px)",
        lineHeight: 1.18,
        letterSpacing: "0",
        wordSpacing: "0.14em",
        fontWeight: 400,
        maxWidth: "30ch",
      }}
    >
      {words.map((word, i) => {
        const isHighlight = sentence.highlight?.includes(i);
        return (
          <Fragment key={i}>
            <span className={cn("relative", isHighlight && "text-signal")}>
              {word}
              {isHighlight && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-0 right-0"
                  style={{ bottom: "-0.1em", color: "var(--signal)" }}
                >
                  <SketchUnderline color="currentColor" weight={1.1} />
                </span>
              )}
            </span>
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        );
      })}
    </h2>
  );
}
