"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { caseLessons, caseOutro, isTodo } from "@/lib/proctoring-case-study";
import { cn } from "@/lib/utils";

/**
 * <EditorialLessons>
 *
 * Nine viewport-height blocks. Pure typography — no diagrams, no parallax,
 * minimal motion. This section is where the voice lives, so the design
 * gets out of the way.
 *
 * Each lesson:
 *   ┌────────────────────────────────────────────────────────┐
 *   │                                                        │
 *   │   01 / Lesson title                                    │
 *   │                                                        │
 *   │   Body paragraph in display serif at a readable        │
 *   │   reading size. One column, generous measure.          │
 *   │                                                        │
 *   └────────────────────────────────────────────────────────┘
 *
 * Reveal on scroll = a quiet fade-up. Nothing fancy.
 */
export function EditorialLessons() {
  return (
    <section className="relative bg-paper py-24 md:py-32" aria-label="Lessons">
      <div className="container-wide mb-20 md:mb-28">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          <span aria-hidden>▍</span> Selected lessons
        </p>
        <h2
          className="font-display text-ink"
          style={{
            fontSize: "clamp(28px, 3.6vw, 48px)",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            fontWeight: 400,
            maxWidth: "26ch",
          }}
        >
          What the system taught me on the way to holding 200 students.
        </h2>
      </div>

      <ol className="container-wide flex flex-col">
        {caseLessons.map((lesson, i) => (
          <LessonBlock
            key={lesson.num}
            num={lesson.num}
            title={lesson.title}
            body={lesson.body}
            isLast={i === caseLessons.length - 1}
          />
        ))}
      </ol>

      {/* The teaser exit — point readers at the full piece for the other lessons. */}
      <div className="container-wide mt-16 md:mt-20 max-w-[60ch] md:ml-[calc(180px+3.5rem)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
          Three of nine. The rest —
          <span className="text-ink"> WebRTC lifecycle, production-vs-design numbers, real-time failure modes</span>
          — live in the blog.
        </p>
        <Link
          href={caseOutro.blogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            group mt-5 inline-flex items-center gap-3
            border border-ink/20
            px-5 py-3
            font-mono text-[11px] uppercase tracking-[0.18em] text-ink
            rounded-sm
            transition-colors duration-300
            hover:bg-signal hover:text-paper hover:border-signal
          "
        >
          Read the full piece
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
          >
            ↗
          </span>
        </Link>
      </div>
    </section>
  );
}

function LessonBlock({
  num,
  title,
  body,
  isLast,
}: {
  num: string;
  title: string;
  body: string;
  isLast: boolean;
}) {
  const reduce = useReducedMotion();
  const blockRef = useRef<HTMLLIElement>(null);

  const titleIsTodo = isTodo(title);
  const bodyIsTodo = isTodo(body);

  const variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <li
      ref={blockRef}
      className={cn(
        "grid grid-cols-1 items-start gap-8 py-20 md:grid-cols-[180px_1fr] md:gap-14 md:py-28",
        !isLast && "border-b border-hairline"
      )}
    >
      <motion.span
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-15% 0px" }}
        variants={variants}
        className="font-mono text-[12px] uppercase tracking-[0.24em] text-signal"
      >
        Lesson {num}
      </motion.span>

      <motion.div
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-15% 0px" }}
        variants={variants}
        className="max-w-[60ch]"
      >
        <h3
          className={cn(
            "font-display italic text-ink",
            titleIsTodo && "text-ink-4"
          )}
          style={{
            fontSize: "clamp(28px, 3.4vw, 44px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            wordSpacing: "0.08em",
            fontWeight: 400,
          }}
        >
          {title}
        </h3>

        <p
          className={cn(
            "mt-6 text-ink-2",
            bodyIsTodo && "text-ink-4 italic"
          )}
          style={{
            fontSize: "clamp(16px, 1.25vw, 19px)",
            lineHeight: 1.6,
            wordSpacing: "0.04em",
          }}
        >
          {body}
        </p>
      </motion.div>
    </li>
  );
}
