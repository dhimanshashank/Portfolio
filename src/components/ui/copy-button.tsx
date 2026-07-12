"use client";

import { useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

/**
 * <CopyButton>
 *
 * Copies a code block's text to the clipboard. Two ways to source the text:
 *   - `text`      — pass the raw string directly (when the caller has it).
 *   - `targetRef` — point at the element whose `textContent` should be copied
 *                   (for tokenized/JSX code where there's no single string).
 *
 * `variant` tunes the palette for dark (void/terminal) vs light (paper) frames.
 * Falls back to a hidden-textarea copy when the async Clipboard API is
 * unavailable (e.g. non-secure origins).
 */
export function CopyButton({
  text,
  targetRef,
  variant = "dark",
  className,
}: {
  text?: string;
  targetRef?: RefObject<HTMLElement | null>;
  variant?: "dark" | "light";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const legacyCopy = (content: string) => {
    const ta = document.createElement("textarea");
    ta.value = content;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* give up silently — clipboard blocked */
    }
    document.body.removeChild(ta);
  };

  const onCopy = () => {
    const content = (text ?? targetRef?.current?.textContent ?? "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (!content) return;

    // Fire-and-forget: never await the Clipboard API. Awaiting it means a
    // slow or permission-blocked clipboard would freeze the button in place;
    // instead we flip the UI optimistically and let the write settle in the
    // background, falling back to execCommand only if the promise rejects.
    const write = navigator.clipboard?.writeText?.(content);
    if (write && typeof write.catch === "function") {
      write.catch(() => legacyCopy(content));
    } else {
      legacyCopy(content);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const palette =
    variant === "dark"
      ? "text-bone-3 hover:text-bone border-bone-4/25 hover:border-bone-4/50"
      : "text-ink-4 hover:text-ink border-ink/15 hover:border-ink/30";

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy code"}
      className={cn(
        "relative z-20 inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-1",
        "font-mono text-[9px] uppercase tracking-[0.18em] transition-colors",
        "cursor-pointer select-none",
        palette,
        className
      )}
    >
      {copied ? (
        <>
          copied
          {/* Pencil check — strokes itself in like a hand ticking a list.
              Deliberately imperfect path, same language as sketch-marks. */}
          <svg
            aria-hidden
            viewBox="0 0 14 12"
            className="h-[0.9em] w-[1.05em]"
            style={{ overflow: "visible" }}
          >
            <path
              d="M1.5 6.5 Q 4 8.5, 5.2 10 Q 8 4.5, 12.5 1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 18,
                strokeDashoffset: 18,
                animation: "copy-check-draw 260ms cubic-bezier(0.7,0,0.3,1) 40ms forwards",
              }}
            />
          </svg>
          <style>{`
            @keyframes copy-check-draw {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </>
      ) : (
        "copy"
      )}
    </button>
  );
}
