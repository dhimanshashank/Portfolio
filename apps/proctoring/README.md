# Proctoring Engine — Live Demo

A frontend-only mini-rebuild of the student-side exam-proctoring engine from
Masters Union. Take a short dummy quiz while a real browser-side detection loop
tracks your webcam for **webcam-derived flags** — multiple faces, face not
detected, looking away, downward gaze, low light, camera blocked.

Everything runs in the browser. **No backend, no upload, no recording is
stored.** This is a self-contained Next.js app living inside the `portfolio-v2`
monorepo-style folder, ready to deploy independently later (e.g. on
`proctoring.shashankdhiman.in`).

## What's real vs simplified

| Real | Simplified / mocked |
| --- | --- |
| Webcam via `getUserMedia` (fallback ladder) | No mediasoup/WebRTC uplink, no sockets |
| MediaPipe `FaceLandmarker` face + gaze detection | No audio/identity flags (face mismatch, voices) |
| Brightness computed in a Web Worker | No recording upload / segments |
| Weighted, capped, time-decayed risk score | No admin lock-sync, no backend |
| `localStorage` per-type TTL de-bounce | Quiz content is hardcoded |

## Architecture

```
src/
  app/page.tsx                 stage machine: intro → envcheck → quiz → results
  hooks/
    use-webcam.ts              getUserMedia ladder + stream lifecycle
    use-proctoring-engine.ts   engine ↔ React state, warnings log, popup queue
  lib/proctoring/
    engine.ts                  ProctoringEngine: MediaPipe load + ~1s tick
    detect.ts                  landmarks/blendshapes/brightness → flags
    scoring.ts                 weights, caps, decay → 0–100 score
    ttl-store.ts               localStorage TTL (violation:${quiz}:${student}:${type}:1)
    violation-tags.ts          flag display names / messages / categories
    mediapipe.ts               shared FaceLandmarker loader (CDN assets)
    env-check.ts               one-shot face + brightness probe
    session.ts                 demo quiz id + per-session student id
  workers/math.worker.ts       brightness off the main thread
  components/proctoring/*      intro, env-check, webcam-feed, quiz-runner, hud, popup, results
```

## Run

```bash
npm install
npm run dev    # http://localhost:3002
```

## Model assets

By default the MediaPipe WASM + `.task` model load from the MediaPipe CDN. To
self-host, drop the files in `public/` and set:

```
NEXT_PUBLIC_MEDIAPIPE_WASM_ROOT=/mediapipe/wasm
NEXT_PUBLIC_FACE_LANDMARKER_MODEL_PATH=/models/face_landmarker.task
```

## Deploy independently

Point a new Vercel project at this folder (Root Directory = `apps/proctoring`).
It has its own `package.json` and builds standalone.
