"use client";

// ─── EnvironmentCheck ───────────────────────────────────────────────────────
// Pre-exam gate. Mirrors QuizEnvironmentCheck + faceCheckService: confirm a
// compatible browser, camera access, adequate lighting, and a face centred
// inside the ROI circle. Lighting + face come from a LIVE MediaPipe monitor, so
// each row shows a spinner until it resolves and the Start-quiz button stays
// disabled until everything passes (and the face is currently in the circle).

import { useEffect, useMemo, useState } from "react";
import { WebcamFeed } from "./webcam-feed";
import { useEnvironmentMonitor } from "@/hooks/use-environment-monitor";
import type { WebcamStatus } from "@/hooks/use-webcam";
import { cn } from "@/lib/utils";

type CheckStatus = "pending" | "running" | "pass" | "fail";

interface CheckRow {
  key: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "running") {
    return (
      <span className="block h-4 w-4 rounded-full border-2 border-warn/30 border-t-warn proctor-spin" />
    );
  }
  if (status === "pass") return <span className="text-lg leading-none text-ok">✓</span>;
  if (status === "fail") return <span className="text-lg leading-none text-danger">✕</span>;
  return <span className="text-lg leading-none text-ink-4">○</span>;
}

export function EnvironmentCheck({
  videoRef,
  stream,
  webcamStatus,
  webcamError,
  onRequestCamera,
  onContinue,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  webcamStatus: WebcamStatus;
  webcamError: string | null;
  onRequestCamera: () => Promise<MediaStream | null>;
  onContinue: () => void;
}) {
  const cameraReady = webcamStatus === "granted";
  const monitor = useEnvironmentMonitor(videoRef, cameraReady);

  // Browser compatibility — synchronous, on mount.
  const [browserOk, setBrowserOk] = useState<boolean | null>(null);
  useEffect(() => {
    setBrowserOk(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia &&
        window.isSecureContext,
    );
  }, []);

  const checks: CheckRow[] = useMemo(() => {
    // Browser
    const browser: CheckRow = {
      key: "browser",
      label: "Compatible browser",
      status: browserOk == null ? "running" : browserOk ? "pass" : "fail",
      detail:
        browserOk == null
          ? "Checking…"
          : browserOk
            ? "getUserMedia available"
            : "Needs a secure context + modern browser",
    };

    // Camera
    let camera: CheckRow;
    if (webcamStatus === "requesting") {
      camera = { key: "camera", label: "Camera access", status: "running", detail: "Requesting permission…" };
    } else if (cameraReady) {
      camera = { key: "camera", label: "Camera access", status: "pass", detail: "Stream live" };
    } else if (webcamStatus === "denied" || webcamStatus === "error") {
      camera = { key: "camera", label: "Camera access", status: "fail", detail: webcamError || "Camera unavailable" };
    } else {
      camera = { key: "camera", label: "Camera access", status: "pending", detail: "Enable your camera to continue" };
    }

    // Lighting + face come from the live monitor (only meaningful once camera is on)
    const monitorLoading = cameraReady && !monitor.modelReady && !monitor.error;

    const lighting: CheckRow = {
      key: "lighting",
      label: "Adequate lighting",
      status: !cameraReady
        ? "pending"
        : monitorLoading
          ? "running"
          : monitor.brightnessOk
            ? "pass"
            : "fail",
      detail: !cameraReady
        ? "Waiting for camera"
        : monitorLoading
          ? "Loading detector…"
          : `Brightness ${Math.round(monitor.brightness)}/255`,
    };

    let faceStatus: CheckStatus;
    let faceDetail: string;
    if (!cameraReady) {
      faceStatus = "pending";
      faceDetail = "Waiting for camera";
    } else if (monitor.error) {
      faceStatus = "fail";
      faceDetail = monitor.error;
    } else if (monitorLoading) {
      faceStatus = "running";
      faceDetail = "Loading detector…";
    } else if (monitor.faceCount > 1) {
      faceStatus = "fail";
      faceDetail = "More than one face detected";
    } else if (monitor.faceInCircle) {
      faceStatus = "pass";
      faceDetail = "Face centred in the circle";
    } else if (monitor.facePresent) {
      faceStatus = "running";
      faceDetail = "Move your face into the circle";
    } else {
      faceStatus = "running";
      faceDetail = "Looking for your face…";
    }

    const face: CheckRow = {
      key: "face",
      label: "Face clearly visible",
      status: faceStatus,
      detail: faceDetail,
    };

    return [browser, camera, lighting, face];
  }, [browserOk, webcamStatus, cameraReady, webcamError, monitor]);

  const allPassed = checks.every((c) => c.status === "pass");

  const guide: "off" | "searching" | "ok" = !cameraReady
    ? "off"
    : monitor.faceInCircle
      ? "ok"
      : "searching";
  const guideHint = !cameraReady
    ? undefined
    : monitor.faceCount > 1
      ? "Only one person allowed"
      : monitor.faceInCircle
        ? "Perfect — hold still"
        : monitor.facePresent
          ? "Center your face in the circle"
          : "Position your face in the circle";

  return (
    <section className="container-base flex min-h-screen flex-col justify-center py-20">
      <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-signal">
        Step 1 · Environment check
      </p>
      <h1
        className="mt-4 font-display font-light tracking-[-0.02em]"
        style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
      >
        Let&apos;s make sure your setup is exam-ready.
      </h1>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_minmax(0,420px)]">
        {/* Checklist */}
        <div className="order-2 lg:order-1">
          <ul className="divide-y divide-hairline rounded-xl border border-hairline">
            {checks.map((c) => (
              <li key={c.key} className="flex items-center gap-4 px-5 py-4">
                <span className="flex h-5 w-5 items-center justify-center">
                  <StatusIcon status={c.status} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium">{c.label}</p>
                  {c.detail && (
                    <p className="font-mono text-[12px] text-ink-4">{c.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {!cameraReady ? (
              <button
                onClick={() => void onRequestCamera()}
                disabled={webcamStatus === "requesting"}
                className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-signal disabled:opacity-50"
              >
                {webcamStatus === "requesting" ? "Requesting…" : "Enable camera"}
              </button>
            ) : (
              <button
                onClick={onContinue}
                disabled={!allPassed}
                className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-signal disabled:cursor-not-allowed disabled:opacity-40"
              >
                {allPassed ? "Start exam" : "Complete the checks to continue"}
              </button>
            )}
          </div>
        </div>

        {/* Live preview with the ROI circle */}
        <div className="order-1 lg:order-2">
          <WebcamFeed
            videoRef={videoRef}
            stream={stream}
            guide={guide}
            guideHint={guideHint}
            className="aspect-[4/3] w-full"
          />
          <p className="mt-3 font-mono text-[12px] text-ink-4">
            Local preview · not recorded
          </p>
        </div>
      </div>
    </section>
  );
}
