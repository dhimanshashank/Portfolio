// ─── ProctoringEngine ───────────────────────────────────────────────────────
// Lightweight re-implementation of the Masters Union frontendProctoringAnalyzer.
// Loads a real MediaPipe FaceLandmarker, runs a ~1s analysis tick against the
// live webcam, offloads brightness to a Web Worker, de-bounces raw flags through
// the localStorage TTL store, and accumulates a weighted/decayed risk score.
// No sockets, no mediasoup, no uploads — everything stays in the browser.

import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import { loadFaceLandmarker } from "./mediapipe";
import {
  createDetectionState,
  deriveDetectionSnapshot,
  type DetectionState,
} from "./detect";
import {
  RiskScoreAccumulator,
  type CategoryScores,
  emptyCategoryScores,
} from "./scoring";
import { shouldPassViolation } from "./ttl-store";
import type { ViolationFlag } from "./violation-tags";
import type { MathRequest, MathResponse } from "@/workers/math.worker";

const ANALYSIS_INTERVAL_MS = 1000;
const BRIGHTNESS_W = 160;
const BRIGHTNESS_H = 90;

export type EngineStatus = "idle" | "loading" | "running" | "error";

export interface EngineUpdate {
  status: EngineStatus;
  /** Raw flags detected this tick (live state for the HUD). */
  activeFlags: ViolationFlag[];
  faceCount: number;
  brightness: number;
  riskScore: number;
  categoryScores: CategoryScores;
  gaze: { away: number; down: number; yawDeg: number; pitchDeg: number };
}

export interface EngineConfig {
  video: HTMLVideoElement;
  quizId: string;
  studentId: string;
  /** Fired every tick with the current live state. */
  onUpdate: (update: EngineUpdate) => void;
  /** Fired once per flag that PASSES its TTL window (drives popups + log). */
  onViolation: (flag: ViolationFlag, timestamp: number) => void;
  onError?: (message: string) => void;
}

export class ProctoringEngine {
  private cfg: EngineConfig;
  private landmarker: FaceLandmarker | null = null;
  private worker: Worker | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private detectionState: DetectionState = createDetectionState();
  private score = new RiskScoreAccumulator();
  private brightnessCanvas: HTMLCanvasElement | null = null;
  private brightnessCtx: CanvasRenderingContext2D | null = null;
  private latestBrightness = 128; // neutral until the first worker reply
  private mathRequestId = 0;
  private tickCount = 0;
  private status: EngineStatus = "idle";
  private stopped = false;

  constructor(cfg: EngineConfig) {
    this.cfg = cfg;
  }

  async start(): Promise<void> {
    this.status = "loading";
    this.emit([], 0, this.latestBrightness, { away: 0, down: 0, yawDeg: 0, pitchDeg: 0 });

    try {
      this.landmarker = await loadFaceLandmarker(2);
    } catch (err) {
      this.fail(`Model failed to load: ${(err as Error).message}`);
      return;
    }
    if (this.stopped) return;

    // Offscreen canvas + worker for brightness.
    this.brightnessCanvas = document.createElement("canvas");
    this.brightnessCanvas.width = BRIGHTNESS_W;
    this.brightnessCanvas.height = BRIGHTNESS_H;
    this.brightnessCtx = this.brightnessCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    // Relative literal path so the bundler can statically detect + emit the
    // worker chunk (the "@/" alias isn't resolved inside new URL()).
    this.worker = new Worker(
      new URL("../../workers/math.worker.ts", import.meta.url),
    );
    this.worker.onmessage = (e: MessageEvent<MathResponse>) => {
      this.latestBrightness = e.data.brightness;
    };

    this.status = "running";
    this.timer = setInterval(() => this.tick(), ANALYSIS_INTERVAL_MS);
    this.tick(); // run one immediately so the UI doesn't wait a full second
  }

  private tick() {
    if (this.stopped || !this.landmarker) return;
    const video = this.cfg.video;
    if (!video || video.readyState < 2 || video.videoWidth === 0) {
      this.emit([], 0, this.latestBrightness, { away: 0, down: 0, yawDeg: 0, pitchDeg: 0 });
      return;
    }

    const now = Date.now();
    this.tickCount += 1;

    // 1) Face landmarks straight off the <video> element.
    let result = null;
    try {
      result = this.landmarker.detectForVideo(video, performance.now());
    } catch {
      result = null;
    }

    // 2) Kick brightness work to the worker (async; we read last reply).
    this.requestBrightness(video);

    // 3) Raw flags for this frame.
    const snapshot = deriveDetectionSnapshot({
      result,
      brightness: this.latestBrightness,
      now,
      state: this.detectionState,
    });

    // 4) De-bounce each flag through the TTL store → confirmed flags.
    const frameId = `${now}-${this.tickCount}`;
    const confirmed: ViolationFlag[] = [];
    for (const flag of snapshot.flags) {
      if (shouldPassViolation(this.cfg.quizId, this.cfg.studentId, flag, frameId, now)) {
        confirmed.push(flag);
      }
    }

    // 5) Confirmed flags feed the score + popups/log.
    if (confirmed.length > 0) {
      this.score.addFlags(confirmed, now);
      for (const flag of confirmed) this.cfg.onViolation(flag, now);
    }

    this.emit(snapshot.flags, snapshot.faceCount, snapshot.brightness, snapshot.gaze);
  }

  private requestBrightness(video: HTMLVideoElement) {
    if (!this.brightnessCtx || !this.brightnessCanvas || !this.worker) return;
    try {
      this.brightnessCtx.drawImage(video, 0, 0, BRIGHTNESS_W, BRIGHTNESS_H);
      const img = this.brightnessCtx.getImageData(0, 0, BRIGHTNESS_W, BRIGHTNESS_H);
      const req: MathRequest = {
        requestId: ++this.mathRequestId,
        width: BRIGHTNESS_W,
        height: BRIGHTNESS_H,
        buffer: img.data.buffer,
      };
      this.worker.postMessage(req, [img.data.buffer]);
    } catch {
      /* drawImage can throw if the frame isn't ready yet — skip this tick */
    }
  }

  private emit(
    activeFlags: ViolationFlag[],
    faceCount: number,
    brightness: number,
    gaze: EngineUpdate["gaze"],
  ) {
    const now = Date.now();
    this.cfg.onUpdate({
      status: this.status,
      activeFlags,
      faceCount,
      brightness,
      riskScore: this.score.getScore(now),
      categoryScores: this.score.getCategoryScores(now),
      gaze,
    });
  }

  private fail(message: string) {
    this.status = "error";
    this.cfg.onError?.(message);
    this.cfg.onUpdate({
      status: "error",
      activeFlags: [],
      faceCount: 0,
      brightness: 0,
      riskScore: 0,
      categoryScores: emptyCategoryScores(),
      gaze: { away: 0, down: 0, yawDeg: 0, pitchDeg: 0 },
    });
  }

  /** Tear everything down — mirrors analyzer.stop() + worker.terminate(). */
  stop() {
    this.stopped = true;
    this.status = "idle";
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.worker) this.worker.terminate();
    this.worker = null;
    try {
      this.landmarker?.close();
    } catch {
      /* ignore */
    }
    this.landmarker = null;
    this.brightnessCanvas = null;
    this.brightnessCtx = null;
  }
}
