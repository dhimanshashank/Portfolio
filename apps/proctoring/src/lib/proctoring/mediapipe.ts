// ─── MediaPipe loader ───────────────────────────────────────────────────────
// Single place that knows where the WASM + model live and how to spin up a
// FaceLandmarker (with GPU→CPU fallback). Shared by the env-check face probe and
// the live ProctoringEngine so the asset paths never drift.

import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// Default to the MediaPipe CDN to keep the repo light. To self-host, drop the
// assets in public/ and set these env vars to "/mediapipe/wasm" and
// "/models/face_landmarker.task".
export const WASM_ROOT =
  process.env.NEXT_PUBLIC_MEDIAPIPE_WASM_ROOT ||
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
export const MODEL_PATH =
  process.env.NEXT_PUBLIC_FACE_LANDMARKER_MODEL_PATH ||
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let resolverPromise: ReturnType<typeof FilesetResolver.forVisionTasks> | null = null;

function getResolver() {
  if (!resolverPromise) {
    resolverPromise = FilesetResolver.forVisionTasks(WASM_ROOT);
  }
  return resolverPromise;
}

export async function loadFaceLandmarker(numFaces: number): Promise<FaceLandmarker> {
  const resolver = await getResolver();
  const base = {
    runningMode: "VIDEO" as const,
    numFaces,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  };
  try {
    return await FaceLandmarker.createFromOptions(resolver, {
      baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" },
      ...base,
    });
  } catch {
    // GPU delegate unavailable — fall back to CPU (slower but universal).
    return FaceLandmarker.createFromOptions(resolver, {
      baseOptions: { modelAssetPath: MODEL_PATH, delegate: "CPU" },
      ...base,
    });
  }
}
