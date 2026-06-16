// ─── Dummy quiz ─────────────────────────────────────────────────────────────
// Hardcoded content. The questions are irrelevant to the proctoring engine —
// they just give the candidate something to do while the webcam tracks them.

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index of the correct option — used only for the results summary. */
  answer: number;
}

export const QUIZ_DURATION_SECONDS = 180;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "What is the time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    answer: 1,
  },
  {
    id: "q2",
    prompt: "Which HTTP status code means “Too Many Requests”?",
    options: ["403", "404", "429", "503"],
    answer: 2,
  },
  {
    id: "q3",
    prompt: "In React, which hook synchronises a component with an external system?",
    options: ["useMemo", "useEffect", "useRef", "useState"],
    answer: 1,
  },
  {
    id: "q4",
    prompt: "What does a Web Worker give you in the browser?",
    options: [
      "A second DOM tree",
      "Background JS off the main thread",
      "Direct GPU shaders",
      "Persistent storage",
    ],
    answer: 1,
  },
  {
    id: "q5",
    prompt: "Which format does MediaPipe ship its vision models in?",
    options: [".onnx", ".task", ".h5", ".pb"],
    answer: 1,
  },
];
