"use client";

// ─── useWebcam ──────────────────────────────────────────────────────────────
// Owns the real MediaStream. Ports the getUserMedia fallback ladder from
// QuizEnvironmentCheck.getPreferredProctoringMediaStream() (640x480@12 →
// 640x360@10 → generic). Attaches the stream to a <video> the consumer renders,
// and stops every track on cleanup so the camera light actually goes off.

import { useCallback, useRef, useState } from "react";

export type WebcamStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error";

const CONSTRAINT_LADDER: MediaStreamConstraints[] = [
  {
    video: {
      width: { ideal: 640, max: 640 },
      height: { ideal: 480, max: 480 },
      frameRate: { ideal: 12, max: 12 },
    },
    audio: false,
  },
  {
    video: {
      width: { ideal: 640 },
      height: { ideal: 360 },
      frameRate: { ideal: 10 },
    },
    audio: false,
  },
  { video: true, audio: false },
];

async function getPreferredStream(): Promise<MediaStream> {
  let lastErr: unknown;
  for (const constraints of CONSTRAINT_LADDER) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<WebcamStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const attach = useCallback((s: MediaStream) => {
    streamRef.current = s;
    setStream(s); // expose as state so <WebcamFeed> can attach it per-page
    if (videoRef.current) {
      videoRef.current.srcObject = s;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    setStatus("requesting");
    setError(null);
    try {
      const stream = await getPreferredStream();
      attach(stream);
      setStatus("granted");
      return stream;
    } catch (err) {
      const e = err as DOMException;
      if (e?.name === "NotAllowedError" || e?.name === "SecurityError") {
        setStatus("denied");
        setError("Camera permission was blocked. Allow access and retry.");
      } else if (e?.name === "NotFoundError" || e?.name === "DevicesNotFoundError") {
        setStatus("error");
        setError("No camera was found on this device.");
      } else {
        setStatus("error");
        setError(e?.message || "Could not start the camera.");
      }
      return null;
    }
  }, [attach]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, []);

  // NOTE: no unmount cleanup here — this hook lives in a long-lived provider so
  // the stream survives the "/" → "/quiz" navigation. The camera is released
  // explicitly via stop() when the exam ends.

  return { videoRef, streamRef, stream, status, error, start, stop };
}
