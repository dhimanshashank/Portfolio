"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP, gsap } from "@/lib/motion/use-gsap";
import { HOME_SKILL_GROUPS, SKILL_PROMPT } from "@/lib/skills";
import { SketchFrame } from "@/components/ui/sketch-marks";
import { assetUrl } from "@/lib/assets";

/** Tablet-and-up breakpoint (Tailwind `md`) — the desk sequence is
 * desktop+tablet only; phones get <SkillsMobile> and no scroll animation. */
const MOBILE_BREAKPOINT = 768;

// Curved-screen text projection constants (see CurvedLine).
const SCREEN_COLS = 58; // ≈ chars across the drawn screen at this font size
const CURVE_MAX_DEG = 15;
const CURVE_BOW_PX = 3.2;

const DESK = { w: 1120, h: 832 };
const LIVE_FRAMES = 61;

// Fractions of the desk image box (pixel flood-fill measured).
const FRAME = { left: 0.544, top: 0.102, width: 0.134, height: 0.236 };
const SCREEN = { left: 0.294, top: 0.421, width: 0.43, height: 0.184 };

// Track timings (progress of the main 460vh track).
const T_REVEAL_END = 0.13; // desk fully drawn
const T_TYPE_START = 0.24;
const T_TYPE_END = 0.8;
const T_FADE_START = 0.88;

/**
 * One line per group, not two.
 *
 * The drawn screen measures 507×161 at a 1440px viewport, and a line costs
 * 24px (13px type × 1.5 leading + a 0.35em gap) — so roughly six lines fit.
 * The previous label-line + items-line layout spent two lines per group,
 * which meant four groups needed nine lines and the last group was being
 * clipped by the screen's `overflow-hidden` before it ever finished typing.
 *
 * Collapsed to `▍ label  item · item · item`, five groups fit in six lines
 * with room to spare, and the widest line is 59 characters ≈ 460px inside a
 * 477px usable width. `splitAt` marks where the orange label ends so the
 * line can still be drawn in two colours.
 */
type Line = { text: string; kind: "prompt" | "group"; splitAt?: number };
const LINES: Line[] = [
  { text: SKILL_PROMPT, kind: "prompt" },
  ...HOME_SKILL_GROUPS.map((g): Line => {
    const label = `▍ ${g.label}`;
    return {
      text: `${label}  ${g.items.join("  ·  ")}`,
      kind: "group",
      splitAt: label.length,
    };
  }),
];
const LINE_STARTS = LINES.reduce<number[]>(
  (starts, line, index) => [
    ...starts,
    index === 0 ? 0 : starts[index - 1] + LINES[index - 1].text.length,
  ],
  []
);
const TOTAL_CHARS = LINES.reduce((n, l) => n + l.text.length, 0);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Shallow per-line horizontal arc, echoing the curved monitor. Center
 * characters sit a hair "forward" (translateY up), edges recede.
 *
 * `offset` is the character index this fragment starts at within its line.
 * A group line is drawn as two differently-coloured spans, and without the
 * offset the second span would restart the arc from the left edge, kinking
 * the curve where the colour changes. */
function CurvedLine({ text, offset = 0 }: { text: string; offset?: number }) {
  const chars = [...text];
  return (
    <span className="inline-block whitespace-pre">
      {chars.map((ch, i) => {
        const t = Math.min(1, Math.max(-1, ((i + offset) / SCREEN_COLS) * 2 - 1));
        const rotY = -t * CURVE_MAX_DEG;
        const bow = (1 - t * t) * CURVE_BOW_PX;
        return (
          <span
            key={i}
            className="inline-block"
            style={{
              transform: `perspective(620px) rotateY(${rotY}deg) translateY(${-bow}px)`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </span>
  );
}

/**
 * <Workbench> — desk destination shell + terminal typing.
 *
 * The framed wall slot is now only an anchor + frame. The portrait itself is
 * owned by <SharedPortraitLayer>, which docks there once the hero handoff
 * completes and leaves again on reverse scroll.
 */
export function Workbench() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const termRef = useRef<HTMLDivElement>(null);

  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    const t = termRef.current;
    if (t) t.scrollTop = t.scrollHeight;
  }, [typedChars]);

  useGSAP(
    () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      const desk = deskRef.current;
      const liveCanvas = liveCanvasRef.current;
      if (!track || !stage || !desk || !liveCanvas) return;

      if (window.innerWidth < MOBILE_BREAKPOINT) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const setDeskReveal = (r: number) => {
        const e = easeInOut(clamp01(r));
        desk.style.opacity = String(e);
        desk.style.transform = `translateY(${(1 - e) * 30}px)`;
      };

      const liveImages: HTMLImageElement[] = [];
      const liveLoaded: boolean[] = Array(LIVE_FRAMES).fill(false);
      let liveStarted = false;
      const startLiveLoad = () => {
        if (liveStarted) return;
        liveStarted = true;
        for (let i = 0; i < LIVE_FRAMES; i++) {
          const img = new Image();
          img.src = assetUrl(
            `/home/desk-live/frame-${String(i + 1).padStart(3, "0")}.webp`
          );
          img.onload = () => {
            liveLoaded[i] = true;
          };
          liveImages.push(img);
        }
      };

      const lctx = liveCanvas.getContext("2d");
      let lastLiveDrawn = -1;
      const drawLive = (index: number) => {
        if (!lctx) return;
        let i = Math.max(0, Math.min(LIVE_FRAMES - 1, index));
        while (i > 0 && !liveLoaded[i]) i--;
        if (!liveLoaded[i] || i === lastLiveDrawn) return;
        liveCanvas.width = DESK.w;
        liveCanvas.height = DESK.h;
        lctx.drawImage(liveImages[i], 0, 0, DESK.w, DESK.h);
        liveCanvas.style.opacity = "1";
        lastLiveDrawn = i;
      };

      if (reduce) {
        setDeskReveal(1);
        setTypedChars(TOTAL_CHARS);
        startLiveLoad();
        return;
      }

      setDeskReveal(0);

      const mainTween = gsap.to(stage, {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;

            if (p > 0 && !liveStarted) startLiveLoad();

            setDeskReveal(clamp01(p / T_REVEAL_END));

            const tt = clamp01((p - T_TYPE_START) / (T_TYPE_END - T_TYPE_START));
            setTypedChars(Math.round(tt * TOTAL_CHARS));
            drawLive(Math.round(tt * (LIVE_FRAMES - 1)));

            const out = clamp01((p - T_FADE_START) / (1 - T_FADE_START));
            stage.style.opacity = String(1 - out * 0.96);
            stage.style.transform = `translateY(${out * -40}px)`;
          },
        },
      });

      return () => {
        mainTween.kill();
      };
    },
    { scope: trackRef as React.RefObject<HTMLElement> }
  );

  const rendered = LINES.map((line, index) => {
    const take = Math.min(
      line.text.length,
      Math.max(0, typedChars - LINE_STARTS[index])
    );
    return {
      ...line,
      visible: line.text.slice(0, take),
      done: take === line.text.length,
    };
  });
  const activeIndex = rendered.findIndex((l) => !l.done);

  return (
    <section
      ref={trackRef}
      data-shared-portrait-track
      className="relative hidden h-[460vh] bg-paper md:block"
      aria-label="Skills workbench"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          ref={stageRef}
          data-workbench-stage
          className="relative w-full will-change-transform"
        >
          <div
            className="relative mx-auto w-[min(88vw,1180px)]"
            style={{ aspectRatio: `${DESK.w} / ${DESK.h}` }}
          >
            <div ref={deskRef} className="absolute inset-0 will-change-transform">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${assetUrl("/home/desk-scene.webp")})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              />
              <canvas
                ref={liveCanvasRef}
                className="absolute inset-0 h-full w-full opacity-0"
              />
            </div>

            <div
              className="absolute"
              style={{
                left: `${FRAME.left * 100}%`,
                top: `${FRAME.top * 100}%`,
                width: `${FRAME.width * 100}%`,
                height: `${FRAME.height * 100}%`,
              }}
            >
              <div
                data-workbench-portrait-anchor
                className="absolute"
                style={{
                  left: "3%",
                  top: "3%",
                  width: "94%",
                  height: "94%",
                }}
              />
              <SketchFrame
                color="var(--ink)"
                className="pointer-events-none absolute inset-0 z-20 h-full w-full"
              />
            </div>

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${SCREEN.left * 100}%`,
                top: `${SCREEN.top * 100}%`,
                width: `${SCREEN.width * 100}%`,
                height: `${SCREEN.height * 100}%`,
              }}
            >
              <div
                ref={termRef}
                className="flex h-full flex-col justify-start gap-[0.35em] overflow-hidden p-[3%] font-mono text-[clamp(7px,1.02vw,13px)] leading-[1.5] text-ink/85"
              >
                {rendered.map((line, i) => (
                  <p
                    key={i}
                    className={line.kind === "prompt" ? "text-ink" : "text-ink-2"}
                  >
                    {line.kind === "group" && line.splitAt !== undefined ? (
                      <>
                        <span className="text-signal">
                          <CurvedLine text={line.visible.slice(0, line.splitAt)} />
                        </span>
                        <CurvedLine
                          text={line.visible.slice(line.splitAt)}
                          offset={Math.min(line.visible.length, line.splitAt)}
                        />
                      </>
                    ) : (
                      <CurvedLine text={line.visible} />
                    )}
                    {i === activeIndex && (
                      <span aria-hidden className="animate-pulse text-ink">
                        ▍
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
