"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { NowBlock as NowBlockType } from "@/lib/now-content";
import { isNowDraft, stripNowDraft } from "@/lib/now-content";
import { cn } from "@/lib/utils";

/**
 * <NowBlock>
 *
 * One of the three sections on /now. Eyebrow column on the left, title +
 * item list on the right. Items are short — one sentence each. Quiet reveal
 * on scroll. No metrics, no diagrams — just text.
 */
export function NowBlock({ block }: { block: NowBlockType }) {
  const reduce = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section
      className="
        grid grid-cols-1 items-start gap-8 py-16
        md:grid-cols-[180px_1fr] md:gap-14 md:py-24
        border-b border-hairline last:border-b-0
      "
    >
      <motion.span
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-15% 0px" }}
        variants={variants}
        className="font-mono text-[11px] uppercase tracking-[0.24em] text-signal"
      >
        {block.eyebrow}
      </motion.span>

      <motion.div
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-15% 0px" }}
        variants={variants}
        className="max-w-[60ch]"
      >
        <h2
          className="font-display italic text-ink"
          style={{
            fontSize: "clamp(24px, 3vw, 36px)",
            lineHeight: 1.18,
            // italic — no negative tracking
            letterSpacing: "0",
            fontWeight: 400,
          }}
        >
          {block.title}
        </h2>

        <ul className="mt-6 space-y-4">
          {block.items.map((item, i) => {
            const draft = isNowDraft(item);
            return (
              <li
                key={i}
                className={cn(
                  "flex gap-4 text-ink-2",
                  draft && "text-ink-3 italic"
                )}
                style={{
                  fontSize: "clamp(16px, 1.2vw, 18px)",
                  lineHeight: 1.55,
                  wordSpacing: "0.02em",
                }}
              >
                <span
                  aria-hidden
                  className="mt-[0.55em] inline-block h-px w-3 flex-shrink-0 bg-ink-4"
                />
                <span>{stripNowDraft(item)}</span>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
