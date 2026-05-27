import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * <CodeFrame>
 *
 * Editor-chrome container for code-as-visual project cards. Quietly
 * mimics a terminal/editor window without going full skeuomorphic:
 *
 *   ┌──────────────────────────────────────────────┐
 *   │  ◯ ◯ ◯       filename.ext                    │
 *   ├──────────────────────────────────────────────┤
 *   │                                              │
 *   │  <code goes here>                            │
 *   │                                              │
 *   └──────────────────────────────────────────────┘
 *
 * Children are pre-formatted JSX (so callers can hand-tokenize tokens
 * with whichever Tailwind text colors they want). Keeps Shiki out of
 * the bundle for a couple of short snippets.
 */
export function CodeFrame({
  filename,
  language,
  children,
  className,
}: {
  filename: string;
  language: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "code-frame relative h-full w-full overflow-hidden bg-void",
        "flex flex-col",
        className
      )}
    >
      {/* ─── Chrome bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-bone-4/20 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-bone-4/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-bone-4/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-bone-4/40" />
        </div>
        <p className="ml-2 flex-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-3">
          {filename}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-bone-4">
          {language}
        </p>
      </div>

      {/* ─── Code body ──────────────────────────────────────────────── */}
      <pre
        className="
          flex-1 overflow-hidden
          px-5 py-4
          font-mono text-bone
          leading-relaxed
        "
        style={{
          fontSize: "clamp(11px, 1.05vw, 13px)",
          lineHeight: 1.65,
          fontFeatureSettings: '"calt", "liga"',
        }}
      >
        <code>{children}</code>
      </pre>

      {/* ─── Subtle inset glow at bottom — gives the frame depth ────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
        }}
      />
    </div>
  );
}

/* ─── Tiny token helpers — hand-tokenization without a parser ──────────
   Used by the per-project snippets to color a few keywords / comments /
   strings consistently. Keeps everything inline & readable.
   ─────────────────────────────────────────────────────────────────── */

export const Kw = ({ children }: { children: ReactNode }) => (
  <span className="text-signal">{children}</span>
);

export const Cm = ({ children }: { children: ReactNode }) => (
  <span className="text-bone-3 italic">{children}</span>
);

export const Str = ({ children }: { children: ReactNode }) => (
  <span className="text-[#9BD2A6]">{children}</span>
);

export const Fn = ({ children }: { children: ReactNode }) => (
  <span className="text-[#E8C672]">{children}</span>
);

export const Dim = ({ children }: { children: ReactNode }) => (
  <span className="text-bone-2">{children}</span>
);
