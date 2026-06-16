// ─── Detection snapshot ─────────────────────────────────────────────────────
// Port of deriveDetectionSnapshot() from the Masters Union analyzer. Turns a
// MediaPipe FaceLandmarker result + the worker-computed brightness into a set of
// raw violation flags for this single frame. Gaze leans on face blendshapes
// (robust across devices); head pose from the transformation matrix is a
// secondary, deliberately generous trigger so we don't fire on small movements.

import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import type { ViolationFlag } from "./violation-tags";

// Thresholds (mirrors the production constants, lightly tuned for a webcam demo)
export const BRIGHTNESS_BLACKOUT = 16; // below → camera_blackout
export const BRIGHTNESS_LOW = 45; // below → low_brightness
export const FACE_ABSENT_MS = 10_000; // no face this long → face_not_detected_long
const GAZE_AWAY_SUM = 1.0; // summed L/R eye-look (max 2.0)
const GAZE_DOWN_SUM = 0.9; // summed down eye-look (max 2.0)
const HEAD_YAW_DEG = 32; // |yaw| beyond this → looking away
const HEAD_PITCH_DOWN_DEG = 28; // pitch beyond this (chin down) → downward gaze

export interface DetectionState {
  /** Timestamp the face first went missing, or null while present. */
  noFaceSince: number | null;
}

export function createDetectionState(): DetectionState {
  return { noFaceSince: null };
}

export interface DetectionSnapshot {
  flags: ViolationFlag[];
  faceCount: number;
  brightness: number;
  /** Surfaced for the HUD/debug overlay. */
  gaze: { away: number; down: number; yawDeg: number; pitchDeg: number };
}

function blendshapeMap(
  result: FaceLandmarkerResult | null,
): Record<string, number> {
  const cats = result?.faceBlendshapes?.[0]?.categories;
  const map: Record<string, number> = {};
  if (!cats) return map;
  for (const c of cats) map[c.categoryName] = c.score;
  return map;
}

/**
 * Approximate yaw/pitch (degrees) from MediaPipe's 4x4 facial transformation
 * matrix (column-major). Used only as a coarse secondary signal, so a small
 * sign/convention drift across devices is acceptable.
 */
function headPose(result: FaceLandmarkerResult | null): {
  yawDeg: number;
  pitchDeg: number;
} {
  const m = result?.facialTransformationMatrixes?.[0]?.data;
  if (!m || m.length < 16) return { yawDeg: 0, pitchDeg: 0 };
  // Column-major rotation elements.
  const r20 = m[2];
  const r21 = m[6];
  const r22 = m[10];
  const r00 = m[0];
  const r10 = m[1];
  const yaw = Math.atan2(r20, r00); // rotation about vertical axis
  const pitch = Math.atan2(-r21, Math.hypot(r20, r22) || r22 || 1); // up/down
  const toDeg = 180 / Math.PI;
  return { yawDeg: yaw * toDeg, pitchDeg: pitch * toDeg + r10 * 0 };
}

export function deriveDetectionSnapshot(args: {
  result: FaceLandmarkerResult | null;
  brightness: number;
  now: number;
  state: DetectionState;
}): DetectionSnapshot {
  const { result, brightness, now, state } = args;
  const flags: ViolationFlag[] = [];
  const faceCount = result?.faceLandmarks?.length ?? 0;

  // ── Brightness (independent of face) ──────────────────────────────────
  if (brightness < BRIGHTNESS_BLACKOUT) {
    flags.push("camera_blackout");
  } else if (brightness < BRIGHTNESS_LOW) {
    flags.push("low_brightness");
  }

  // ── Face presence ─────────────────────────────────────────────────────
  if (faceCount === 0) {
    if (state.noFaceSince == null) state.noFaceSince = now;
    if (now - state.noFaceSince >= FACE_ABSENT_MS) {
      flags.push("face_not_detected_long");
    }
  } else {
    state.noFaceSince = null;
    if (faceCount > 1) flags.push("multiple_faces");
  }

  // ── Gaze / head pose (only meaningful with exactly one face) ──────────
  const bs = blendshapeMap(result);
  const leftGaze = (bs.eyeLookOutLeft ?? 0) + (bs.eyeLookInRight ?? 0);
  const rightGaze = (bs.eyeLookInLeft ?? 0) + (bs.eyeLookOutRight ?? 0);
  const away = Math.max(leftGaze, rightGaze);
  const down = (bs.eyeLookDownLeft ?? 0) + (bs.eyeLookDownRight ?? 0);
  const { yawDeg, pitchDeg } = headPose(result);

  if (faceCount === 1) {
    if (away > GAZE_AWAY_SUM || Math.abs(yawDeg) > HEAD_YAW_DEG) {
      flags.push("looking_away");
    }
    if (down > GAZE_DOWN_SUM || pitchDeg < -HEAD_PITCH_DOWN_DEG) {
      flags.push("downward_gaze");
    }
  }

  return {
    flags,
    faceCount,
    brightness,
    gaze: { away, down, yawDeg, pitchDeg },
  };
}
