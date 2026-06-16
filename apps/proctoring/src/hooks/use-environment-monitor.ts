"use client";

// ─── useEnvironmentMonitor ──────────────────────────────────────────────────
// Continuous (not one-shot) env check for the pre-exam gate. Loads a
// FaceLandmarker once and, ~4x/second, reports whether a single face is present
// AND centred inside the on-screen circle, plus live brightness. The Start-quiz
// button stays disabled until the face sits inside the circle — mirroring the
// ROI gate in faceCheckService.

import { useEffect, useState } from "react";
import { loadFaceLandmarker } from "@/lib/proctoring/mediapipe";
import { BRIGHTNESS_LOW } from "@/lib/proctoring/detect";

// Normalised target circle (image space). Slightly above centre, generous radius.
export const FACE_CIRCLE = { x: 0.5, y: 0.46, r: 0.33 };
const MIN_FACE_WIDTH = 0.12; // reject faces that are too far away

export interface EnvMonitorState {
  modelReady: boolean;
  faceCount: number;
  facePresent: boolean;
  faceInCircle: boolean;
  brightness: number;
  brightnessOk: boolean;
  error: string | null;
}

const INITIAL: EnvMonitorState = {
  modelReady: false,
  faceCount: 0,
  facePresent: false,
  faceInCircle: false,
  brightness: 128,
  brightnessOk: false,
  error: null,
};

export function useEnvironmentMonitor(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean,
) {
  const [state, setState] = useState<EnvMonitorState>(INITIAL);

  useEffect(() => {
    if (!active) {
      setState(INITIAL);
      return;
    }

    let cancelled = false;
    let landmarker: Awaited<ReturnType<typeof loadFaceLandmarker>> | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const computeBrightness = (video: HTMLVideoElement): number => {
      if (!ctx) return 128;
      try {
        ctx.drawImage(video, 0, 0, 160, 90);
        const { data } = ctx.getImageData(0, 0, 160, 90);
        let sum = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 16) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          count++;
        }
        return count > 0 ? sum / count : 128;
      } catch {
        return 128;
      }
    };

    const tick = () => {
      const video = videoRef.current;
      if (!landmarker || !video || video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      let faceCount = 0;
      let inCircle = false;
      try {
        const res = landmarker.detectForVideo(video, performance.now());
        faceCount = res.faceLandmarks?.length ?? 0;
        if (faceCount > 0) {
          const lm = res.faceLandmarks[0];
          let minX = 1, maxX = 0, minY = 1, maxY = 0;
          for (const p of lm) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
          }
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;
          const dist = Math.hypot(cx - FACE_CIRCLE.x, cy - FACE_CIRCLE.y);
          inCircle = dist < FACE_CIRCLE.r && maxX - minX > MIN_FACE_WIDTH;
        }
      } catch {
        faceCount = 0;
      }

      const brightness = computeBrightness(video);
      if (cancelled) return;
      setState((s) => ({
        ...s,
        faceCount,
        facePresent: faceCount > 0,
        faceInCircle: faceCount === 1 && inCircle,
        brightness,
        brightnessOk: brightness >= BRIGHTNESS_LOW,
      }));
    };

    (async () => {
      try {
        landmarker = await loadFaceLandmarker(1);
      } catch (e) {
        if (!cancelled) {
          setState((s) => ({ ...s, error: (e as Error).message || "Model failed to load" }));
        }
        return;
      }
      if (cancelled) {
        landmarker.close();
        return;
      }
      setState((s) => ({ ...s, modelReady: true }));
      timer = setInterval(tick, 250);
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      try {
        landmarker?.close();
      } catch {
        /* ignore */
      }
    };
  }, [active, videoRef]);

  return state;
}
