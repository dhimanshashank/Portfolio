"use client";

// ─── WebcamProvider ─────────────────────────────────────────────────────────
// Holds the single webcam session in a context mounted in the root layout, so
// the live MediaStream survives client navigation from "/" (intro + env check)
// to "/quiz" (the exam) without re-prompting for the camera.

import { createContext, useContext } from "react";
import { useWebcam } from "@/hooks/use-webcam";

type WebcamContextValue = ReturnType<typeof useWebcam>;

const WebcamContext = createContext<WebcamContextValue | null>(null);

export function WebcamProvider({ children }: { children: React.ReactNode }) {
  const webcam = useWebcam();
  return <WebcamContext.Provider value={webcam}>{children}</WebcamContext.Provider>;
}

export function useWebcamContext(): WebcamContextValue {
  const ctx = useContext(WebcamContext);
  if (!ctx) {
    throw new Error("useWebcamContext must be used within <WebcamProvider>");
  }
  return ctx;
}
