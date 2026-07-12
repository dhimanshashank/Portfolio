"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/lib/motion/use-gsap";
import { assetUrl } from "@/lib/assets";

const MOBILE_BREAKPOINT = 768;
const FLIGHT_TRACK_PORTION = 0.25;
const LIFTOFF = 0.05;
const LIFT_ARC_PX = 56;
const PORTRAIT_RATIO = 1080 / 1440;
const SHARED_READY_EVENT = "shared-portrait-ready";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;

type Rect = { x: number; y: number; w: number; h: number };

function fitRect(
  box: Rect,
  ratio: number,
  mode: "cover" | "contain",
  align: "top" | "center"
): Rect {
  const boxRatio = box.w / box.h;
  const useWidth = mode === "cover" ? boxRatio > ratio : boxRatio < ratio;
  const w = useWidth ? box.w : box.h * ratio;
  const h = useWidth ? box.w / ratio : box.h;
  const x = box.x + (box.w - w) / 2;
  const y = align === "top" ? box.y : box.y + (box.h - h) / 2;
  return { x, y, w, h };
}

function setSharedPortraitReady(ready: boolean) {
  const root = document.documentElement;
  if (ready) root.dataset.sharedPortraitReady = "true";
  else delete root.dataset.sharedPortraitReady;
  window.dispatchEvent(new CustomEvent(SHARED_READY_EVENT, { detail: { ready } }));
}

export function SharedPortraitLayer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [layerReady, setLayerReady] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setSharedPortraitReady(isDesktop && layerReady);
  }, [isDesktop, layerReady]);

  useEffect(() => {
    return () => {
      setSharedPortraitReady(false);
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      const img = imgRef.current;
      const track = document.querySelector<HTMLElement>("[data-shared-portrait-track]");
      const heroAnchor = document.querySelector<HTMLElement>("[data-hero-portrait-anchor]");
      const deskAnchor = document.querySelector<HTMLElement>("[data-workbench-portrait-anchor]");
      const workbenchStage = document.querySelector<HTMLElement>("[data-workbench-stage]");

      if (!root || !img || !track || !heroAnchor || !deskAnchor || !workbenchStage) {
        setLayerReady(false);
        return;
      }

      if (!isDesktop) {
        root.style.opacity = "0";
        setLayerReady(false);
        return;
      }

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const getStageOpacity = () => Number(workbenchStage.style.opacity || "1");
      const getHeroRect = (): Rect => {
        const rect = heroAnchor.getBoundingClientRect();
        return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
      };
      const getDeskRect = (): Rect => {
        const rect = deskAnchor.getBoundingClientRect();
        return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
      };

      const applyRect = (outer: Rect, inner: Rect, opts?: { radius?: number; shadow?: string }) => {
        root.style.transform = `translate(${outer.x}px, ${outer.y}px)`;
        root.style.width = `${outer.w}px`;
        root.style.height = `${outer.h}px`;
        root.style.borderRadius = `${opts?.radius ?? 0}px`;
        root.style.filter = opts?.shadow ?? "";
        img.style.left = `${inner.x - outer.x}px`;
        img.style.top = `${inner.y - outer.y}px`;
        img.style.width = `${inner.w}px`;
        img.style.height = `${inner.h}px`;
      };

      // Feathered edge mask — at the hero (t=1) the portrait melts into the
      // paper on every side, the way the mobile poster's gradient feathers
      // read; as it flies toward the desk frame (t→0) the edges sharpen so
      // it lands as a crisp framed picture. Two gradients intersected: one
      // horizontal, one vertical.
      const setFeather = (t: number) => {
        if (t <= 0.001) {
          root.style.setProperty("mask-image", "");
          root.style.setProperty("-webkit-mask-image", "");
          return;
        }
        const left = 96 * t;
        const right = 36 * t;
        const top = 64 * t;
        const bottom = 128 * t;
        const m =
          `linear-gradient(to right, transparent 0px, black ${left}px, black calc(100% - ${right}px), transparent 100%), ` +
          `linear-gradient(to bottom, transparent 0px, black ${top}px, black calc(100% - ${bottom}px), transparent 100%)`;
        root.style.setProperty("mask-image", m);
        root.style.setProperty("mask-composite", "intersect");
        root.style.setProperty("-webkit-mask-image", m);
        root.style.setProperty("-webkit-mask-composite", "source-in");
      };

      const applySnappedState = (raw: number) => {
        const hero = getHeroRect();
        const desk = getDeskRect();
        const landed = raw >= 0.56;
        const outer = landed ? desk : hero;
        const inner = fitRect(
          outer,
          PORTRAIT_RATIO,
          landed ? "contain" : "cover",
          landed ? "center" : "top"
        );
        // No sheet shadow in either resting state — at the hero the portrait
        // is drawn ON the page (feathered, shadowless); on the desk it's a
        // framed picture (crisp, the drawn frame supplies the edge).
        applyRect(outer, inner, { radius: 0, shadow: "" });
        setFeather(landed ? 0 : 1);
        root.style.opacity = String(getStageOpacity());
      };

      const applyAnimatedState = (raw: number) => {
        const p = clamp01((raw - LIFTOFF) / (1 - LIFTOFF));
        const e = easeInOut(p);
        const pickUp = easeOut(clamp01(p / 0.26));
        const settle = easeIn(clamp01((p - 0.72) / 0.28));
        const hover = Math.sin(e * Math.PI);
        const hero = getHeroRect();
        const desk = getDeskRect();

        const outer: Rect = {
          x: lerp(hero.x, desk.x, e),
          y: lerp(hero.y, desk.y, e) - hover * LIFT_ARC_PX * (0.82 + 0.18 * (1 - settle)),
          w: lerp(hero.w, desk.w, e),
          h: lerp(hero.h, desk.h, e),
        };

        const heroPose = fitRect(outer, PORTRAIT_RATIO, "cover", "top");
        const deskPose = fitRect(outer, PORTRAIT_RATIO, "contain", "center");
        const inner: Rect = {
          x: lerp(heroPose.x, deskPose.x, e),
          y: lerp(heroPose.y, deskPose.y, e),
          w: lerp(heroPose.w, deskPose.w, e),
          h: lerp(heroPose.h, deskPose.h, e),
        };

        const roll = (pickUp - settle) * -1.4;
        const scale = 1 + hover * 0.02;
        // Shadow rides the hover arc only: zero at both resting states
        // (drawn-on-page at the hero, framed picture on the desk), peaking
        // mid-flight while the sheet is "off the paper".
        applyRect(outer, inner, {
          radius: lerp(2, 0, e),
          shadow:
            hover > 0.02
              ? `drop-shadow(0 ${4 + hover * 14}px ${10 + hover * 22}px rgba(26,24,21,${(hover * 0.16).toFixed(3)}))`
              : "",
        });
        setFeather(1 - e);
        root.style.transform = `translate(${outer.x}px, ${outer.y}px) rotate(${roll}deg) scale(${scale})`;
        root.style.opacity = String(getStageOpacity());
      };

      let latestFlightRaw = 0;
      const render = () => {
        if (reduce) applySnappedState(latestFlightRaw);
        else applyAnimatedState(latestFlightRaw);
      };

      const flightST = ScrollTrigger.create({
        trigger: track,
        start: "top bottom",
        end: () => {
          const vh = window.innerHeight;
          const range = track.getBoundingClientRect().height - vh;
          return `+=${vh + FLIGHT_TRACK_PORTION * range}`;
        },
        scrub: reduce ? false : 1.2,
        onUpdate: (self) => {
          latestFlightRaw = self.progress;
          if (reduce) render();
        },
        onRefresh: (self) => {
          latestFlightRaw = self.progress;
          render();
        },
      });

      if (!reduce) {
        gsap.ticker.add(render);
      }

      render();
      root.style.opacity = String(getStageOpacity());
      setLayerReady(true);

      return () => {
        if (!reduce) gsap.ticker.remove(render);
        flightST.kill();
        setFeather(0);
        root.style.opacity = "0";
        root.style.filter = "";
        root.style.transform = "translate(0px, 0px)";
        root.style.width = "0px";
        root.style.height = "0px";
        setLayerReady(false);
      };
    },
    { scope: rootRef as React.RefObject<HTMLElement>, dependencies: [isDesktop] }
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-20 hidden overflow-hidden md:block"
      style={{ opacity: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={assetUrl("/hero/portrait-sketch.webp")}
        alt=""
        draggable={false}
        className="absolute max-w-none select-none"
        style={{ filter: "contrast(1.04) brightness(0.99)" }}
      />
    </div>
  );
}
