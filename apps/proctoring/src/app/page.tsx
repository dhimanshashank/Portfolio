"use client";

// ─── Landing: intro → environment check ─────────────────────────────────────
// Once the env check passes, we navigate to the dedicated /quiz route so the
// candidate visibly enters a separate "exam" page. The webcam stream is held in
// WebcamProvider (root layout), so it survives the navigation without a second
// permission prompt.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IntroScreen } from "@/components/proctoring/intro-screen";
import { EnvironmentCheck } from "@/components/proctoring/environment-check";
import { useWebcamContext } from "@/components/proctoring/webcam-provider";

export default function Home() {
  const [stage, setStage] = useState<"intro" | "envcheck">("intro");
  const webcam = useWebcamContext();
  const router = useRouter();

  return (
    <main>
      {stage === "intro" && <IntroScreen onStart={() => setStage("envcheck")} />}

      {stage === "envcheck" && (
        <EnvironmentCheck
          videoRef={webcam.videoRef}
          stream={webcam.stream}
          webcamStatus={webcam.status}
          webcamError={webcam.error}
          onRequestCamera={webcam.start}
          onContinue={() => router.push("/quiz")}
        />
      )}
    </main>
  );
}
