// ─── Session identity ───────────────────────────────────────────────────────
// The real engine keys its TTL storage by quizId + studentId. We mirror that:
// a fixed demo quiz id and a per-browser-session student id (so reloading mid
// quiz keeps the same TTL keys, which is the point of the persistence demo).

export const DEMO_QUIZ_ID = "demo-quiz";

const STUDENT_KEY = "proctoring-demo:studentId";

export function getStudentId(): string {
  if (typeof window === "undefined") return "demo-student";
  try {
    let id = window.sessionStorage.getItem(STUDENT_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `student-${Math.random().toString(36).slice(2)}`;
      window.sessionStorage.setItem(STUDENT_KEY, id);
    }
    return id;
  } catch {
    return "demo-student";
  }
}
