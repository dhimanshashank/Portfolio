// ─── Brightness / math worker ───────────────────────────────────────────────
// Port of the Masters Union proctoringMathWorker.js (the math_metrics path).
// Pixel-level work runs OFF the main thread so the analysis loop never blocks
// React rendering — exactly the reason the real engine uses a worker. We keep
// just the brightness metric here (the signal that drives camera_blackout /
// low_brightness); the rest of the real worker's post-processing now lives in
// the main-thread TTL store.

/// <reference lib="webworker" />

export interface MathRequest {
  requestId: number;
  width: number;
  height: number;
  /** RGBA pixel buffer (ImageData.data.buffer), transferred to the worker. */
  buffer: ArrayBuffer;
}

export interface MathResponse {
  requestId: number;
  /** Mean perceptual luminance, 0–255. */
  brightness: number;
}

// Rec. 709 luma weights — same formula as production.
const R_W = 0.2126;
const G_W = 0.7152;
const B_W = 0.0722;

self.onmessage = (e: MessageEvent<MathRequest>) => {
  const { requestId, buffer } = e.data;
  const pixels = new Uint8ClampedArray(buffer);

  let sum = 0;
  let count = 0;
  // Sample every 4th pixel (stride 16 bytes) — plenty for an average, cheap.
  for (let i = 0; i < pixels.length; i += 16) {
    sum += R_W * pixels[i] + G_W * pixels[i + 1] + B_W * pixels[i + 2];
    count++;
  }

  const brightness = count > 0 ? sum / count : 0;
  const response: MathResponse = { requestId, brightness };
  (self as unknown as Worker).postMessage(response);
};
