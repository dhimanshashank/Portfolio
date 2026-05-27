"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { caseCollapse, isTodo } from "@/lib/proctoring-case-study";
import { cn } from "@/lib/utils";

/**
 * <CollapseMoment>
 *
 * The dramatic centerpiece. Pinned 4-vh section that orchestrates:
 *
 *   0.00–0.10  buildup line fades in
 *   0.10–0.50  user counter climbs 1 → 5 (linked to scroll)
 *   0.10–0.55  CPU gauge climbs 5% → 100% in parallel
 *   0.50–0.55  server node turns red, brief screen desaturate flash
 *   0.55–0.75  headline lands: "Five users. That was the cliff."
 *   0.75–1.00  cooldown line fades in, page releases
 *
 * Built with scrub. Numbers animate via DOM writes from onUpdate (no React
 * state — would re-render too often on every scroll tick).
 */
export function CollapseMoment() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  // Refs to the DOM nodes we write to from scroll callbacks
  const buildupRef = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const gaugeFillRef = useRef<HTMLDivElement>(null);
  const gaugePctRef = useRef<HTMLSpanElement>(null);
  const serverNodeRef = useRef<SVGRectElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cooldownRef = useRef<HTMLParagraphElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  const PIN_VH = 4;

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduce) {
        // Show end-state statically — no climb, no flash
        gsap.set([buildupRef.current, headlineRef.current, cooldownRef.current], {
          autoAlpha: 1,
          y: 0,
        });
        if (counterRef.current) counterRef.current.textContent = "5";
        if (gaugeFillRef.current) gaugeFillRef.current.style.transform = "scaleY(1)";
        if (gaugePctRef.current) gaugePctRef.current.textContent = "100%";
        if (serverNodeRef.current) {
          serverNodeRef.current.setAttribute("fill", "var(--danger)");
        }
        return;
      }

      ScrollTriggerWiring: {
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
              const p = self.progress;

              // Counter climb: 1 → 5 over progress 0.10–0.50
              const counterT = gsap.utils.clamp(0, 1, (p - 0.10) / 0.40);
              const userCount = 1 + Math.round(counterT * 4); // 1..5
              if (counterRef.current) {
                counterRef.current.textContent = String(userCount);
              }

              // CPU gauge climb: 5% → 100% over progress 0.10–0.55
              const cpuT = gsap.utils.clamp(0, 1, (p - 0.10) / 0.45);
              // Eased to feel like an exponential fail rather than linear
              const cpuEased = Math.pow(cpuT, 1.6);
              const cpuPct = Math.round(5 + cpuEased * 95);
              if (gaugePctRef.current) {
                gaugePctRef.current.textContent = `${cpuPct}%`;
              }
              if (gaugeFillRef.current) {
                const scale = (cpuPct / 100);
                gaugeFillRef.current.style.transform = `scaleY(${scale})`;
                // Tint shifts orange → red as we approach 100
                const tint = cpuPct < 60
                  ? "var(--signal)"
                  : cpuPct < 85
                  ? "var(--warn)"
                  : "var(--danger)";
                gaugeFillRef.current.style.background = tint;
              }
              // Server node turns red once CPU passes 85
              if (serverNodeRef.current) {
                serverNodeRef.current.setAttribute(
                  "fill",
                  cpuPct >= 85 ? "var(--danger)" : "var(--paper)"
                );
                serverNodeRef.current.setAttribute(
                  "stroke",
                  cpuPct >= 85 ? "var(--danger)" : "var(--ink)"
                );
              }
            },
          },
        });

        // Buildup line fades in (0.00–0.10)
        tl.fromTo(
          buildupRef.current,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.10, ease: "power2.out" },
          0
        );

        // Flash overlay around the moment of collapse (0.52–0.58)
        tl.fromTo(
          flashRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 0.5, duration: 0.03, ease: "power1.in" },
          0.52
        );
        tl.to(flashRef.current, { autoAlpha: 0, duration: 0.06, ease: "power1.out" }, 0.55);

        // Headline lands (0.55–0.65)
        tl.fromTo(
          headlineRef.current,
          { autoAlpha: 0, y: 24, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.10, ease: "power3.out" },
          0.55
        );

        // Cooldown (0.78–0.92)
        tl.fromTo(
          cooldownRef.current,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.10, ease: "power2.out" },
          0.78
        );
      }
    },
    { scope: sectionRef as React.RefObject<HTMLElement> }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper"
      style={{ height: `${(PIN_VH + 1) * 100}vh` }}
      aria-label="The collapse moment"
    >
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden grain">
        {/* Flash overlay — momentary red wash at the collapse */}
        <div
          ref={flashRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 bg-danger mix-blend-multiply"
          style={{ opacity: 0 }}
        />

        <div className="container-wide absolute inset-0 grid grid-cols-1 items-center gap-12 py-20 md:grid-cols-[1fr_1fr]">
          {/* LEFT: counter + buildup + headline + cooldown */}
          <div className="flex flex-col justify-center">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
              <span aria-hidden>▍</span> The cliff
            </p>

            <p
              ref={buildupRef}
              className={cn(
                "mb-12 max-w-[40ch] font-display italic text-ink-2 will-change-transform",
                isTodo(caseCollapse.buildup) && "text-ink-4"
              )}
              style={{
                fontSize: "clamp(18px, 1.8vw, 24px)",
                lineHeight: 1.45,
                letterSpacing: "-0.01em",
                opacity: 0,
              }}
            >
              {caseCollapse.buildup}
            </p>

            {/* Counter */}
            <div className="mb-12 flex items-baseline gap-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
                Users
              </span>
              <span
                ref={counterRef}
                className="font-display tabular-nums text-ink"
                style={{
                  fontSize: "clamp(80px, 11vw, 160px)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  fontWeight: 400,
                }}
              >
                1
              </span>
            </div>

            {/* Headline that lands */}
            <h2
              ref={headlineRef}
              className="font-display text-ink will-change-transform"
              style={{
                fontSize: "clamp(28px, 4.2vw, 56px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                fontStyle: "italic",
                fontWeight: 400,
                maxWidth: "20ch",
                opacity: 0,
              }}
            >
              {caseCollapse.headline}
            </h2>

            {/* Cooldown — appears after the headline */}
            <p
              ref={cooldownRef}
              className={cn(
                "mt-8 max-w-[36ch] font-mono text-[12px] uppercase tracking-[0.18em] text-ink-3 will-change-transform",
                isTodo(caseCollapse.cooldown) && "text-ink-4 italic normal-case tracking-normal"
              )}
              style={{ opacity: 0 }}
            >
              {caseCollapse.cooldown}
            </p>
          </div>

          {/* RIGHT: CPU gauge + mini diagram with server-node-turns-red */}
          <div className="flex flex-col items-center justify-center gap-10 md:gap-14">
            {/* Vertical CPU gauge */}
            <div className="flex items-end gap-6">
              <div
                className="relative h-[220px] w-12 overflow-hidden border border-ink/15 bg-paper-soft md:h-[280px] md:w-14"
                aria-hidden
              >
                <div
                  ref={gaugeFillRef}
                  className="absolute inset-x-0 bottom-0 h-full origin-bottom"
                  style={{
                    transform: "scaleY(0.05)",
                    background: "var(--signal)",
                    willChange: "transform, background",
                  }}
                />
                {/* Tick marks */}
                {[0, 25, 50, 75, 100].map((t) => (
                  <span
                    key={t}
                    aria-hidden
                    className="absolute left-0 right-0 h-px bg-ink/10"
                    style={{ bottom: `${t}%` }}
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
                  CPU
                </span>
                <span
                  ref={gaugePctRef}
                  className="font-display tabular-nums text-ink"
                  style={{
                    fontSize: "clamp(40px, 5vw, 64px)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    fontWeight: 400,
                  }}
                >
                  5%
                </span>
              </div>
            </div>

            {/* Mini diagram — single server node that turns red */}
            <svg
              viewBox="0 0 240 80"
              className="w-full max-w-[240px]"
              aria-hidden
            >
              <text
                x="120"
                y="14"
                textAnchor="middle"
                fill="var(--ink-3)"
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Server
              </text>
              <rect
                ref={serverNodeRef}
                x="80" y="26" width="80" height="40" rx="3"
                fill="var(--paper)"
                stroke="var(--ink)"
                strokeWidth="1.5"
              />
              <text
                x="120"
                y="52"
                textAnchor="middle"
                fill="var(--ink-2)"
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                node
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
