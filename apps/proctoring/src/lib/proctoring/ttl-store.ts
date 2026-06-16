// ─── Violation TTL store ────────────────────────────────────────────────────
// Direct port of the localStorage de-bounce in the Masters Union analyzer
// (frontendProctoringAnalyzer.js: getEventKey + shouldPassViolation, mirrored in
// proctoringMathWorker.js). A given violation type may only "pass" (count toward
// the score / raise a popup) once per TTL window. The last pass timestamp lives
// in localStorage under a per-quiz, per-student, per-type key — so the de-bounce
// even survives a page reload mid-exam, which is the whole point of the TTL
// persistence requirement.

import type { ViolationFlag } from "./violation-tags";

/** Per-type cooldown windows (ms). Same numbers as production. */
export const VIOLATION_TTL_BY_TYPE_MS: Record<ViolationFlag, number> = {
  multiple_faces: 45_000,
  face_not_detected_long: 30_000,
  camera_blackout: 15_000,
  downward_gaze: 25_000,
  looking_away: 20_000,
  low_brightness: 20_000,
};

const STORAGE_PREFIX = "violation";

type StoredEntry = { frameId: string; ts: number };

/** `violation:${quizId}:${studentId}:${type}:1` — matches the real key shape. */
export function getEventKey(
  quizId: string,
  studentId: string,
  type: ViolationFlag,
): string {
  return `${STORAGE_PREFIX}:${quizId}:${studentId}:${type}:1`;
}

function safeGet(key: string): StoredEntry | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as StoredEntry;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: StoredEntry) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / blocked — de-bounce simply degrades to "always pass" */
  }
}

/**
 * Returns true the FIRST time a violation type is seen within its TTL window,
 * recording the new timestamp; returns false (suppressed) while the previous
 * timestamp is still inside the window. Identical semantics to production.
 */
export function shouldPassViolation(
  quizId: string,
  studentId: string,
  type: ViolationFlag,
  frameId: string,
  nowMs = Date.now(),
): boolean {
  if (typeof window === "undefined") return true;
  const key = getEventKey(quizId, studentId, type);
  const ttl = VIOLATION_TTL_BY_TYPE_MS[type] ?? 20_000;
  const existing = safeGet(key);

  if (existing && nowMs - existing.ts < ttl) {
    return false; // still cooling down
  }
  safeSet(key, { frameId, ts: nowMs });
  return true;
}

/** Clear every TTL key for a session (called on cleanup / restart). */
export function clearSessionTtl(quizId: string, studentId: string) {
  if (typeof window === "undefined") return;
  try {
    const prefix = `${STORAGE_PREFIX}:${quizId}:${studentId}:`;
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/** Read remaining cooldown (ms) for a type — used to show TTL state in the UI. */
export function getRemainingTtl(
  quizId: string,
  studentId: string,
  type: ViolationFlag,
  nowMs = Date.now(),
): number {
  if (typeof window === "undefined") return 0;
  const existing = safeGet(getEventKey(quizId, studentId, type));
  if (!existing) return 0;
  const ttl = VIOLATION_TTL_BY_TYPE_MS[type] ?? 20_000;
  return Math.max(0, ttl - (nowMs - existing.ts));
}
