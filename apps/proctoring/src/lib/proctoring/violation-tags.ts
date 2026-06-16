// ─── Violation taxonomy ─────────────────────────────────────────────────────
// Ported/simplified from the Masters Union student engine
// (lms-student-frontend/src/constants/proctoringTags.js). We keep only the
// webcam-derived flags — audio/identity flags (face_mismatch, multiple_voices,
// unusual_noise) need a baseline this frontend-only demo doesn't have.

export type ViolationFlag =
  | "multiple_faces"
  | "face_not_detected_long"
  | "camera_blackout"
  | "looking_away"
  | "downward_gaze"
  | "low_brightness";

export type RiskCategory = "high" | "medium" | "low";

/** Short label shown on chips / the warnings log. */
export const VIOLATION_DISPLAY_NAMES: Record<ViolationFlag, string> = {
  multiple_faces: "Multiple Faces",
  face_not_detected_long: "Face Not Detected",
  camera_blackout: "Camera Blocked",
  looking_away: "Looking Away",
  downward_gaze: "Downward Gaze",
  low_brightness: "Low Light",
};

/** Full sentence shown in the warning popup. */
export const VIOLATION_MESSAGES: Record<ViolationFlag, string> = {
  multiple_faces:
    "More than one face is visible in frame. Only the candidate should be present.",
  face_not_detected_long:
    "No face has been detected for a while. Stay centred and visible to the camera.",
  camera_blackout:
    "The camera feed is dark or blocked. Make sure nothing is covering the lens.",
  looking_away:
    "You appear to be looking away from the screen. Keep your attention on the exam.",
  downward_gaze:
    "Your gaze is angled downward repeatedly. Avoid looking at anything below the screen.",
  low_brightness:
    "The room is too dark for reliable monitoring. Add some light to your environment.",
};

/** Which risk bucket each flag contributes to. */
export const VIOLATION_CATEGORY: Record<ViolationFlag, RiskCategory> = {
  multiple_faces: "high",
  face_not_detected_long: "high",
  camera_blackout: "high",
  looking_away: "medium",
  downward_gaze: "medium",
  low_brightness: "low",
};

/**
 * Priority order for choosing the headline violation when several fire at once.
 * Higher-severity flags win (mirrors getPrimaryViolationTag in the real code).
 */
export const VIOLATION_PRIORITY: ViolationFlag[] = [
  "multiple_faces",
  "camera_blackout",
  "face_not_detected_long",
  "downward_gaze",
  "looking_away",
  "low_brightness",
];

export function getPrimaryViolation(flags: ViolationFlag[]): ViolationFlag | null {
  for (const flag of VIOLATION_PRIORITY) {
    if (flags.includes(flag)) return flag;
  }
  return flags[0] ?? null;
}

export const ALL_VIOLATION_FLAGS = Object.keys(
  VIOLATION_DISPLAY_NAMES,
) as ViolationFlag[];
