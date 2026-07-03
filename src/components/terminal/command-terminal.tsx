"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  commands,
  resolve,
  complete,
  type CommandResultLine,
  type Tone,
} from "@/lib/terminal/commands";
import { cn } from "@/lib/utils";

/**
 * <CommandTerminal> — the portfolio's summonable REPL.
 *
 * Void-surfaced overlay, mono type. A real command interpreter (not a fake
 * dashboard): navigate the site, open links, hit easter eggs. Rendered only
 * after the first open (lazy) by <TerminalMount>. createPortal → body, so
 * it sits above content but below the route-transition curtain.
 */

type Entry =
  | { kind: "input"; text: string }
  | { kind: "output"; lines: CommandResultLine[] };

const PROMPT = "shashank@portfolio:~$";
const TYPE_WORD_MS = 42;
const TYPE_LINE_PAUSE_MS = 80;

const toneClass: Record<Tone, string> = {
  normal: "text-[var(--bone)]",
  muted: "text-[var(--bone-3)]",
  signal: "text-[var(--signal)]",
  success: "text-[#7FB08A]",
  error: "text-[#D9704F]",
};

const BANNER: CommandResultLine[] = [
  { kind: "text", text: "portfolio interface — v1", tone: "muted" },
  { kind: "text", text: "type 'help' to see what you can do.", tone: "muted" },
];

export function CommandTerminal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [entries, setEntries] = useState<Entry[]>([{ kind: "output", lines: BANNER }]);
  const [value, setValue] = useState("");
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);

  const print = useCallback(
    (lines: CommandResultLine[]) =>
      setEntries((e) => [...e, { kind: "output", lines }]),
    []
  );
  const clear = useCallback(() => setEntries([]), []);

  // Curtain-aware internal navigation: a synthetic anchor click reuses the
  // global RouteTransition ceremony; falls back to router.push when the
  // curtain is disabled (reduced motion).
  const navigate = useCallback(
    (href: string) => {
      onClose();
      const noCurtain = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (noCurtain) {
        router.push(href);
        return;
      }
      const a = document.createElement("a");
      a.href = href;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click(); // RouteTransition's capture listener catches + preventDefaults
      document.body.removeChild(a);
    },
    [onClose, router]
  );

  const openExternal = useCallback((href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const line = raw.trim();
      setEntries((e) => [...e, { kind: "input", text: line }]);
      if (line) {
        historyRef.current = [
          line,
          ...historyRef.current.filter((h) => h !== line),
        ].slice(0, 50);
      }
      histIdxRef.current = -1;

      if (!line) return;
      const { cmd, args } = resolve(line);
      if (!cmd) {
        print([
          {
            kind: "text",
            text: `command not found: ${line.split(/\s+/)[0]} — try 'help'`,
            tone: "error",
          },
        ]);
        return;
      }
      cmd.run({ args, raw: line, navigate, openExternal, clear, print, registry: commands });
    },
    [navigate, openExternal, clear, print]
  );

  // ── open/close lifecycle: focus, scroll-lock, restore ──────────────────
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(id);
      (restoreFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  // Keep focus inside the panel while open (lightweight trap).
  useEffect(() => {
    if (!open) return;
    const onFocusIn = (e: FocusEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        inputRef.current?.focus();
      }
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [open]);

  // Auto-scroll to newest output.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, open]);

  // Keep following stdout while the typewriter mutates text nodes.
  useEffect(() => {
    const el = scrollRef.current;
    if (!open || !el) return;

    let frame = 0;
    const scrollToBottom = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    };
    const observer = new MutationObserver(scrollToBottom);

    observer.observe(el, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    scrollToBottom();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit(value);
      setValue("");
    } else if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = historyRef.current;
      if (!h.length) return;
      histIdxRef.current = Math.min(histIdxRef.current + 1, h.length - 1);
      setValue(h[histIdxRef.current] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = historyRef.current;
      histIdxRef.current = Math.max(histIdxRef.current - 1, -1);
      setValue(histIdxRef.current === -1 ? "" : h[histIdxRef.current] ?? "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const cands = complete(value);
      if (cands.length === 1) {
        const parts = value.split(/\s+/);
        parts[parts.length - 1] = cands[0];
        setValue(parts.join(" ") + " ");
      } else if (cands.length > 1) {
        print([{ kind: "text", text: cands.join("   "), tone: "muted" }]);
      }
    }
  };

  const dur = reduce ? 0 : undefined;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="term-scrim"
          className="fixed inset-0 z-[95] flex items-start justify-center bg-[var(--void)]/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur ?? 0.18 }}
          onMouseDown={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command terminal"
            className="mt-[8svh] flex max-h-[80svh] w-[92vw] max-w-[680px] flex-col overflow-hidden rounded-sm border border-[var(--void-edge)] bg-[var(--void)] text-[var(--bone)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] md:mt-[12vh]"
            style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: dur ?? 0.2, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-[var(--void-edge)] px-4 py-2.5">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--bone-3)]">
                {PROMPT}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close terminal"
                className="text-[10px] uppercase tracking-[0.18em] text-[var(--bone-3)] transition-colors hover:text-[var(--bone)]"
              >
                esc
              </button>
            </div>

            {/* Scrollback */}
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-[1.7]"
            >
              {entries.map((entry, i) =>
                entry.kind === "input" ? (
                  <p key={i} className="mt-2 break-words">
                    <span className="text-[var(--bone-3)]">
                      {PROMPT.replace(":~$", "")}
                      <span className="text-[var(--signal)]"> $</span>{" "}
                    </span>
                    <span className="text-[var(--bone-2)]">{entry.text}</span>
                  </p>
                ) : (
                  <div key={i} className="mt-1">
                    {(() => {
                      let delayMs = 0;

                      return entry.lines.map((ln, j) => {
                        const lineDelayMs = delayMs;
                        delayMs +=
                          lineWordCount(ln) * TYPE_WORD_MS + TYPE_LINE_PAUSE_MS;

                        return (
                          <ResultLine
                            key={j}
                            line={ln}
                            delayMs={lineDelayMs}
                            reduce={Boolean(reduce)}
                            onInternal={navigate}
                            onExternal={openExternal}
                          />
                        );
                      });
                    })()}
                  </div>
                )
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-[var(--void-edge)] px-4 py-3">
              <span aria-hidden className="text-[13px] text-[var(--signal)]">
                ❯
              </span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="send"
                aria-label="Command input"
                className="w-full bg-transparent text-[13px] text-[var(--bone)] caret-[var(--signal)] outline-none placeholder:text-[var(--bone-4)]"
                placeholder="type a command…  (help)"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ── One line of output ─────────────────────────────────────────────────────
function ResultLine({
  line,
  delayMs,
  reduce,
  onInternal,
  onExternal,
}: {
  line: CommandResultLine;
  delayMs: number;
  reduce: boolean;
  onInternal: (href: string) => void;
  onExternal: (href: string) => void;
}) {
  if (line.kind === "spacer") return <div className="h-2" aria-hidden />;

  if (line.kind === "text")
    return (
      <AnimatedText
        text={line.text}
        delayMs={delayMs}
        reduce={reduce}
        className={cn("break-words", toneClass[line.tone ?? "normal"])}
      />
    );

  if (line.kind === "link")
    return (
      <p>
        <LinkBit
          label={line.label}
          href={line.href}
          external={line.external}
          delayMs={delayMs}
          reduce={reduce}
          onInternal={onInternal}
          onExternal={onExternal}
        />
      </p>
    );

  // list
  return (
    <ul className="my-1 flex flex-col gap-1">
      {line.items.map((it, i) => {
        const currentDelayMs = itemDelayMs(line.items, i, delayMs);

        return (
          <li key={i} className="flex flex-wrap items-baseline gap-x-3">
            {it.href ? (
              <LinkBit
                label={it.label}
                href={it.href}
                external={it.external}
                delayMs={currentDelayMs}
                reduce={reduce}
                onInternal={onInternal}
                onExternal={onExternal}
              />
            ) : (
              <TypedSpan
                text={it.label}
                delayMs={currentDelayMs}
                reduce={reduce}
                className="text-[var(--bone)]"
              />
            )}
            {it.value && (
              <TypedSpan
                text={it.value}
                delayMs={
                  currentDelayMs +
                  wordCount(it.label) * TYPE_WORD_MS +
                  TYPE_LINE_PAUSE_MS / 2
                }
                reduce={reduce}
                className="text-[var(--bone-3)]"
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

function AnimatedText({
  text,
  delayMs,
  reduce,
  className,
}: {
  text: string;
  delayMs: number;
  reduce: boolean;
  className?: string;
}) {
  const typed = useTypedText(text, delayMs, !reduce);

  return (
    <p className={className}>
      {typed.text}
      {typed.started && !typed.done && (
        <span className="text-[var(--signal)]">_</span>
      )}
    </p>
  );
}

function TypedSpan({
  text,
  delayMs,
  reduce,
  className,
}: {
  text: string;
  delayMs: number;
  reduce: boolean;
  className?: string;
}) {
  const typed = useTypedText(text, delayMs, !reduce);

  return <span className={className}>{typed.text}</span>;
}

function useTypedText(text: string, delayMs: number, enabled: boolean) {
  const [typed, setTyped] = useState({
    done: !enabled,
    started: !enabled,
    text: enabled ? "" : text,
  });

  useEffect(() => {
    if (!enabled) return;

    const parts = text.match(/\S+\s*/g) ?? [text];
    let index = 0;
    let cancelled = false;
    let intervalId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setTyped({ done: parts.length <= 1, started: true, text: parts[0] ?? "" });
      index = 1;

      intervalId = window.setInterval(() => {
        if (cancelled) {
          window.clearInterval(intervalId);
          return;
        }
        index += 1;
        setTyped({
          done: index >= parts.length,
          started: true,
          text: parts.slice(0, index).join(""),
        });
        if (index >= parts.length) window.clearInterval(intervalId);
      }, TYPE_WORD_MS);
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [delayMs, enabled, text]);

  return enabled ? typed : { done: true, started: true, text };
}

function wordCount(text: string) {
  return text.match(/\S+/g)?.length ?? 0;
}

function lineWordCount(line: CommandResultLine) {
  if (line.kind === "spacer") return 0;
  if (line.kind === "text") return wordCount(line.text);
  if (line.kind === "link") return wordCount(line.label);
  return line.items.reduce(
    (total, item) =>
      total + wordCount(item.label) + wordCount(item.value ?? ""),
    0
  );
}

function itemDelayMs(items: { label: string; value?: string }[], index: number, baseDelayMs: number) {
  return items.slice(0, index).reduce(
    (total, item) =>
      total +
      wordCount(item.label) * TYPE_WORD_MS +
      wordCount(item.value ?? "") * TYPE_WORD_MS +
      TYPE_LINE_PAUSE_MS,
    baseDelayMs
  );
}

function LinkBit({
  label,
  href,
  external,
  delayMs,
  reduce,
  onInternal,
  onExternal,
}: {
  label: string;
  href: string;
  external?: boolean;
  delayMs: number;
  reduce: boolean;
  onInternal: (href: string) => void;
  onExternal: (href: string) => void;
}) {
  const isExternal =
    external ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    /\.[a-z0-9]{2,4}$/i.test(href);
  const typedLabel = useTypedText(label, delayMs, !reduce);

  return (
    <button
      type="button"
      onClick={() => (isExternal ? onExternal(href) : onInternal(href))}
      className="text-left text-[var(--signal)] underline decoration-[var(--signal-low)] underline-offset-2 transition-colors hover:text-[var(--signal-hi)]"
    >
      {typedLabel.text}
      {isExternal && typedLabel.done && <span aria-hidden> ↗</span>}
    </button>
  );
}
