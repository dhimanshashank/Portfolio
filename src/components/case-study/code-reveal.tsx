"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { CodeFrame } from "@/components/work/visuals/code-frame";
import { caseCode, isTodo } from "@/lib/proctoring-case-study";
import { cn } from "@/lib/utils";

/**
 * <CodeReveal>
 *
 * Each snippet from the case-study data gets one viewport-height block.
 * As the user scrolls into the block, lines reveal one by one (opacity +
 * tiny Y), giving the feeling of a system being assembled in front of you.
 *
 * Snippets render inside the same CodeFrame used on /work cards, so the
 * editor chrome is consistent across the site.
 *
 * For TODO snippets, the block still renders with placeholder lines so
 * the visual rhythm of the page doesn't break while you're editing copy.
 */
export function CodeReveal() {
  const wrapperRef = useRef<HTMLElement>(null);

  return (
    <section ref={wrapperRef} className="relative bg-paper py-24 md:py-32" aria-label="Code reveals">
      <div className="container-wide mb-16">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          <span aria-hidden>▍</span> In code
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
          Two or three lines that quietly do the heavy lifting.
        </h2>
      </div>

      <div className="container-wide flex flex-col gap-24 md:gap-32">
        {caseCode.map((snippet, i) => (
          <CodeSnippetBlock key={i} snippet={snippet} index={i} />
        ))}
      </div>
    </section>
  );
}

function CodeSnippetBlock({
  snippet,
  index,
}: {
  snippet: typeof caseCode[number];
  index: number;
}) {
  const blockRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLSpanElement[]>([]);

  // Split snippet code into lines for staggered reveal
  const lines = snippet.code.split("\n");

  useGSAP(
    () => {
      if (!blockRef.current || !linesRef.current.length) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(linesRef.current, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        linesRef.current,
        { autoAlpha: 0, y: 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: blockRef.current,
            start: "top 70%",
            end: "top 30%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: blockRef }
  );

  return (
    <div
      ref={blockRef}
      className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.6fr] md:gap-12"
    >
      {/* Context column */}
      <div className="flex flex-col">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          {String(index + 1).padStart(2, "0")} / {snippet.filename}
        </p>
        <p
          className={cn(
            "max-w-[30ch] text-ink-2 leading-relaxed",
            isTodo(snippet.context) && "text-ink-4 italic"
          )}
          style={{ fontSize: "clamp(15px, 1.15vw, 17px)" }}
        >
          {snippet.context}
        </p>
      </div>

      {/* Code column */}
      <div className="h-[340px] md:h-[400px]">
        <CodeFrame filename={snippet.filename} language={snippet.language}>
          {lines.map((line, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) linesRef.current[i] = el;
              }}
              className="block will-change-transform"
              style={{ opacity: 0, minHeight: "1.65em" }}
            >
              {line || " " /* preserve blank lines visually */}
            </span>
          ))}
        </CodeFrame>
      </div>
    </div>
  );
}
