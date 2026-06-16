"use client";

// ─── useProctoringEngine ────────────────────────────────────────────────────
// React glue around the headless ProctoringEngine. Starts the engine when the
// quiz becomes active, pipes per-tick state into React, keeps a warnings log,
// and queues the warning popup. Mirrors how Quiz.js + useQuizFaultEvents wire
// the analyzer's confirmed faults into UI state.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ProctoringEngine,
  type EngineUpdate,
} from "@/lib/proctoring/engine";
import { emptyCategoryScores } from "@/lib/proctoring/scoring";
import { clearSessionTtl } from "@/lib/proctoring/ttl-store";
import type { ViolationFlag } from "@/lib/proctoring/violation-tags";

export interface WarningLogEntry {
  id: string;
  flag: ViolationFlag;
  timestamp: number;
}

const POPUP_AUTO_DISMISS_MS = 4500;

const INITIAL_STATE: EngineUpdate = {
  status: "idle",
  activeFlags: [],
  faceCount: 0,
  brightness: 128,
  riskScore: 0,
  categoryScores: emptyCategoryScores(),
  gaze: { away: 0, down: 0, yawDeg: 0, pitchDeg: 0 },
};

export function useProctoringEngine(args: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  quizId: string;
  studentId: string;
  active: boolean;
}) {
  const { videoRef, quizId, studentId, active } = args;
  const engineRef = useRef<ProctoringEngine | null>(null);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<EngineUpdate>(INITIAL_STATE);
  const [warningLog, setWarningLog] = useState<WarningLogEntry[]>([]);
  const [currentPopup, setCurrentPopup] = useState<{
    flag: ViolationFlag;
    timestamp: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dismissPopup = useCallback(() => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setCurrentPopup(null);
  }, []);

  const handleViolation = useCallback((flag: ViolationFlag, timestamp: number) => {
    setWarningLog((log) => [
      { id: `${timestamp}-${flag}`, flag, timestamp },
      ...log,
    ]);
    setCurrentPopup({ flag, timestamp });
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(
      () => setCurrentPopup(null),
      POPUP_AUTO_DISMISS_MS,
    );
  }, []);

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    if (!video) return;

    // Fresh session — clear any leftover TTL keys from a previous run.
    clearSessionTtl(quizId, studentId);

    const engine = new ProctoringEngine({
      video,
      quizId,
      studentId,
      onUpdate: setState,
      onViolation: handleViolation,
      onError: setErrorMessage,
    });
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, quizId, studentId]);

  return {
    state,
    warningLog,
    totalWarnings: warningLog.length,
    currentPopup,
    dismissPopup,
    errorMessage,
  };
}
