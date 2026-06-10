"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { problems } from "@/lib/problems-data";
import { SeverityBadge } from "./problem-card";
import { cn } from "@/lib/utils";

/**
 * <EngineeringLog> — Plate V (home page)
 *
 * The latest production investigation told as a pinned scene. On desktop
 * the section pins for ~1.3 viewports and vertical scroll scrubs the
 * story: the terminal clue prints line by line, the smoking-gun line
 * flips signal-orange, then the root cause and fix land on the right.
 *
 * Pin discipline: this is the THIRD pin on the home run (manifesto +
 * work showcase above it). Per the editorial budget, if pin jitter ever
 * shows up on real hardware this is the first pin to cut — the mobile
 * composition below works at any width.
 *
 * Mobile (≤768px) and prefers-reduced-motion get the same content as a
 * static composition with simple fade reveals / no animation at all.
 */
export function EngineeringLog() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current) return;
      const root = sectionRef.current;

      const q = (sel: string) => root.querySelector<HTMLElement>(sel);
      const qa = (sel: string) => root.querySelectorAll<HTMLElement>(sel);

      const header = q("[data-log-header]");
      const frame = q("[data-log-frame]");
      const clueLines = qa("[data-log-clue-line]");
      const highlight = q("[data-log-clue-highlight]");
      const findings = qa("[data-log-finding]");
      const cta = q("[data-log-cta]");

      const mm = gsap.matchMedia();

      // Desktop + motion ok → pinned scrub scene.
      mm.add(
        "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
        () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "+=130%",
              scrub: 0.6,
              pin: pinRef.current,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          tl.fromTo(
            header,
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
            0
          )
            .fromTo(
              frame,
              { autoAlpha: 0, y: 34 },
              { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
              0.25
            )
            .fromTo(
              clueLines,
              { autoAlpha: 0, x: -14 },
              {
                autoAlpha: 1,
                x: 0,
                duration: 0.35,
                ease: "power2.out",
                stagger: 0.3,
              },
              0.6
            );

          if (highlight) {
            tl.to(
              highlight,
              { color: "var(--signal)", duration: 0.25, ease: "none" },
              ">"
            );
          }

          tl.fromTo(
            findings,
            { autoAlpha: 0, y: 26 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              stagger: 0.25,
            },
            ">0.1"
          )
            .fromTo(
              cta,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.3 },
              ">"
            )
            // Hold the finished scene for a beat before unpinning.
            .to({}, { duration: 0.5 });
        }
      );

      // Mobile + motion ok → simple stacked reveals, no pin.
      mm.add(
        "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          [header, frame, ...Array.from(findings), cta].forEach((el) => {
            if (!el) return;
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 22 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          });
          gsap.set(clueLines, { autoAlpha: 1 });
          if (highlight) gsap.set(highlight, { color: "var(--signal)" });
        }
      );

      // Reduced motion → everything visible, highlight already orange.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [header, frame, ...Array.from(clueLines), ...Array.from(findings), cta].filter(Boolean),
          { autoAlpha: 1 }
        );
        if (highlight) gsap.set(highlight, { color: "var(--signal)" });
      });
    },
    { scope: sectionRef as React.RefObject<HTMLElement> }
  );

  const latest = problems[0];
  if (!latest) return null;

  const clueLines = latest.clue.split("\n");

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper border-t border-ink/10"
      aria-label="Engineering log"
    >
      <div
        ref={pinRef}
        className="md:motion-safe:flex md:motion-safe:h-screen md:motion-safe:flex-col md:motion-safe:justify-center"
      >
        <div className="container-wide py-20 md:motion-safe:py-0 md:py-28">
          {/* ─── Section header ─────────────────────────────────────────── */}
          <div data-log-header style={{ opacity: 0 }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 mb-6">
              <span className="text-signal">▍</span> Plate V — Engineering Log
            </p>

            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
              <h2
                className="font-display italic text-ink max-w-[24ch]"
                style={{
                  fontSize: "clamp(26px, 3.2vw, 40px)",
                  lineHeight: 1.12,
                  letterSpacing: "0",
                  wordSpacing: "0.06em",
                  fontWeight: 400,
                }}
              >
                {latest.title}
              </h2>
              <span className="inline-flex items-center gap-3">
                <SeverityBadge severity={latest.severity} />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
                  {latest.tags.join(" · ")} ·{" "}
                  {new Date(latest.date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          </div>

          {/* ─── The scene — terminal clue left, findings right ─────────── */}
          <div className="mt-10 grid grid-cols-1 gap-10 md:mt-14 md:grid-cols-[1.15fr_1fr] md:gap-14">
            {/* Terminal frame */}
            <div
              data-log-frame
              className="rounded-sm border border-ink/15 bg-[var(--void)] px-5 py-6 md:px-7 md:py-7"
              style={{ opacity: 0 }}
            >
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--bone-3,#9a958a)]">
                The clue
              </p>
              <pre className="overflow-x-auto font-mono text-[12px] md:text-[13px] leading-[1.9] text-[var(--bone)]">
                {clueLines.map((line, i) => (
                  <span
                    key={i}
                    data-log-clue-line
                    {...(i === latest.clueHighlight
                      ? { "data-log-clue-highlight": "" }
                      : {})}
                    className={cn(
                      "block",
                      i === latest.clueHighlight && "font-semibold"
                    )}
                    style={{ opacity: 0 }}
                  >
                    {line}
                  </span>
                ))}
              </pre>
            </div>

            {/* Findings */}
            <div className="flex flex-col gap-8 md:gap-10 md:self-center">
              <div data-log-finding style={{ opacity: 0 }}>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
                  Root cause
                </p>
                <p
                  className="text-ink-2 max-w-[52ch]"
                  style={{ fontSize: "clamp(13.5px, 1.05vw, 15.5px)", lineHeight: 1.65 }}
                >
                  {latest.rootCause}
                </p>
              </div>

              <div data-log-finding style={{ opacity: 0 }}>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
                  The fix
                </p>
                <p
                  className="text-ink-2 max-w-[52ch]"
                  style={{ fontSize: "clamp(13.5px, 1.05vw, 15.5px)", lineHeight: 1.65 }}
                >
                  {latest.fix}
                </p>
              </div>

              <div data-log-cta style={{ opacity: 0 }}>
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
          </div>
        </div>
      </div>
    </section>
  );
}
