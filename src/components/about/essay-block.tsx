"use client";

import { motion, useReducedMotion } from "framer-motion";
import { isDraft, stripDraft } from "@/lib/about-content";
import { cn } from "@/lib/utils";

/**
 * <EssayBlock>
 *
 * One of the three personal sections. Two-column layout on desktop:
 *
 *   ┌─────────────────┬──────────────────────────────────────┐
 *   │ eyebrow         │  Section title (display serif)       │
 *   │ + draft chip    │                                      │
 *   │                 │  Body paragraph 1. Generous measure. │
 *   │                 │                                      │
 *   │                 │  Body paragraph 2. Quiet reveal.     │
 *   └─────────────────┴──────────────────────────────────────┘
 *
 * Stacks vertically on mobile. Body uses Inter for reading, the title
 * uses Fraunces. Each paragraph fades up independently on scroll.
 */
export function EssayBlock({
  eyebrow,
  title,
  paragraphs,
}: {
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
}) {
  const reduce = useReducedMotion();
  const anyDraft = isDraft(title) || paragraphs.some((p) => isDraft(p));

  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section className="container-wide py-24 md:py-32 hairline-b">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[180px_1fr] md:gap-16 lg:gap-24">
        {/* Left column — eyebrow */}
        <div className="flex flex-col items-start gap-3 md:sticky md:top-32 md:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            {eyebrow}
          </p>
          {anyDraft && (
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-signal border border-signal/40 px-2 py-0.5 rounded-sm">
              Draft
            </span>
          )}
        </div>

        {/* Right column — title + body */}
        <div className="max-w-[64ch]">
          {/* Title */}
          <motion.h2
            initial={reduce ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={fadeVariants}
            className={cn(
              "font-display text-ink",
              isDraft(title) && "text-ink-3"
            )}
            style={{
              fontSize: "clamp(28px, 3.8vw, 52px)",
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              wordSpacing: "0.05em",
              fontWeight: 400,
              maxWidth: "20ch",
            }}
          >
            {stripDraft(title)}
          </motion.h2>

          {/* Body paragraphs — stagger by index */}
          <div className="mt-10 space-y-7">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={reduce ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-10% 0px" }}
                variants={fadeVariants}
                transition={{
                  duration: 0.7,
                  delay: reduce ? 0 : i * 0.1,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className={cn(
                  "text-ink-2",
                  isDraft(p) && "text-ink-4 italic"
                )}
                style={{
                  fontSize: "clamp(16px, 1.25vw, 19px)",
                  lineHeight: 1.65,
                  wordSpacing: "0.03em",
                }}
              >
                {stripDraft(p)}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
