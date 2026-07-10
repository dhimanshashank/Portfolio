/**
 * Skill groups typed onto the drawn monitor in the home page desk scene
 * (src/components/home/desk-skills.tsx).
 *
 * This is plain data on purpose — edit lines here anytime and the screen
 * updates; the desk artwork never needs regenerating.
 */
export const SKILL_PROMPT = "$ skills --list";

export const SKILL_GROUPS = [
  {
    label: "real-time systems",
    items: ["websockets at scale", "webrtc", "event-driven pipelines"],
  },
  {
    label: "ai infrastructure",
    items: ["llm integration", "inference queues", "adversarial robustness"],
  },
  {
    label: "backend & apis",
    items: ["node.js · typescript", "postgresql · redis", "rest + queue apis"],
  },
  {
    label: "shipping",
    items: ["next.js", "docker · ci/cd", "observability"],
  },
] as const;
