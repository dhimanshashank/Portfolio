"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Lazy — the overlay (and Framer/portal work) loads only on first open, so
// it costs ~0 KB in the initial bundle. ssr:false is legal here because this
// is a client component (see node_modules/next/dist/docs/.../lazy-loading.md).
const CommandTerminal = dynamic(
  () => import("./command-terminal").then((m) => m.CommandTerminal),
  { ssr: false }
);

/**
 * <TerminalMount>
 *
 * Always-mounted, near-zero-weight controller for the command terminal:
 *  - ⌘K / Ctrl+K opens it (and `~` when not typing, desktop only);
 *  - a global "open-terminal" event opens it (the nav chips dispatch this);
 *  - shows a one-time, dismissible hint that ⌘K exists (desktop);
 *  - only renders the heavy overlay after the first open.
 */
export function TerminalMount() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const isTouchRef = useRef(false);

  const openTerminal = () => {
    setHasOpened(true);
    setOpen(true);
    setShowHint(false);
    try {
      localStorage.setItem("term-hint-seen", "1");
    } catch {}
  };

  useEffect(() => {
    isTouchRef.current = window.matchMedia("(hover: none)").matches;

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) setHasOpened(true);
          return !v;
        });
        setShowHint(false);
        try {
          localStorage.setItem("term-hint-seen", "1");
        } catch {}
        return;
      }
      // `~` opens, but only when the user isn't typing somewhere.
      if (k === "`" || k === "~") {
        const el = document.activeElement;
        const typing =
          el instanceof HTMLElement &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.isContentEditable);
        if (!typing && !isTouchRef.current) {
          e.preventDefault();
          openTerminal();
        }
      }
    };

    const onOpenEvent = () => openTerminal();

    window.addEventListener("keydown", onKey);
    window.addEventListener("open-terminal", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-terminal", onOpenEvent);
    };
  }, []);

  // First-visit hint (desktop only, once). Deferred so it never competes
  // with the initial curtain / hero entrance.
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    let seen = false;
    try {
      seen = localStorage.getItem("term-hint-seen") === "1";
    } catch {}
    if (seen) return;
    const inT = setTimeout(() => setShowHint(true), 3200);
    const outT = setTimeout(() => setShowHint(false), 11000);
    return () => {
      clearTimeout(inT);
      clearTimeout(outT);
    };
  }, []);

  return (
    <>
      {hasOpened && (
        <CommandTerminal open={open} onClose={() => setOpen(false)} />
      )}

      {showHint && (
        <button
          type="button"
          onClick={openTerminal}
          className="fixed bottom-6 right-6 z-[80] hidden items-center gap-2 rounded-sm border border-[var(--void-edge)] bg-[var(--void)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--bone-2)] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] transition-colors hover:text-[var(--bone)] motion-safe:animate-[term-hint-in_0.5s_ease-out,term-hint-pulse_1.5s_ease-in-out_1.6s_2] md:flex"
          aria-label="Open command terminal"
        >
          <span className="text-[var(--signal)]">❯</span>
          press{" "}
          <kbd className="rounded-[3px] border border-[var(--void-edge)] px-1.5 py-0.5 text-[var(--bone)]">
            ⌘K
          </kbd>
        </button>
      )}
    </>
  );
}
