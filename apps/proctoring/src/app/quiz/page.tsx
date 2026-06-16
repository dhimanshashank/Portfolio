"use client";

// ─── /quiz — the proctored exam ─────────────────────────────────────────────
// Dedicated route so the candidate is visibly on a separate exam page. Reuses
// the webcam stream acquired during the env check (held in WebcamProvider). If
// someone lands here directly without a live stream, we send them back to the
// env check on "/".

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuizRunner, type QuizResult } from "@/components/proctoring/quiz-runner";
import { ResultsScreen } from "@/components/proctoring/results-screen";
import { useWebcamContext } from "@/components/proctoring/webcam-provider";
import { DEMO_QUIZ_ID, getStudentId } from "@/lib/proctoring/session";

export default function QuizPage() {
  const webcam = useWebcamContext();
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    setStudentId(getStudentId());
  }, []);

  // Must arrive via the env check — otherwise no camera has been granted.
  useEffect(() => {
    if (!webcam.streamRef.current) router.replace("/");
  }, [webcam.streamRef, router]);

  // Warn before reload / close / leaving while the exam is in progress, so the
  // candidate doesn't accidentally lose the session. The browser shows its
  // native "Reload site? / Leave site?" confirmation; once submitted (result
  // set) we drop the guard so they can leave freely.
  useEffect(() => {
    if (result) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // required for the prompt to appear in Chrome
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [result]);

  const handleComplete = (r: QuizResult) => {
    setResult(r);
    webcam.stop(); // monitoring is over — release the camera
  };

  const handleRestart = () => {
    webcam.stop();
    setResult(null);
    router.push("/");
  };

  if (result) {
    return <ResultsScreen result={result} onRestart={handleRestart} />;
  }

  // Redirecting (no stream) or waiting for the session id to resolve.
  if (!webcam.stream || !studentId) return null;

  return (
    <QuizRunner
      videoRef={webcam.videoRef}
      stream={webcam.stream}
      quizId={DEMO_QUIZ_ID}
      studentId={studentId}
      onComplete={handleComplete}
    />
  );
}
