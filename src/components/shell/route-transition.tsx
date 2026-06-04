"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * <RouteTransition>
 *
 * Global route-change ceremony: two ink-graphite panels meet in the middle,
 * hold while a signal-orange seam tick sits between them, then split apart
 * to reveal the new page. Total ~1440ms.
 *
 *   t=0      panels start sliding in from top + bottom        (540ms close)
 *   t=540    panels meet, signal tick at the seam visible     (360ms hold)
 *   t=900    panels start splitting apart, tick fades         (540ms open)
 *   t=1440   idle, no overlay, no listeners running
 *
 * Implementation notes:
 *   - Self-contained: mount once at the body level. No need to wrap content.
 *   - Click interception is document-level — listens to <a> clicks and
 *     re-routes them through router.push() AFTER the close finishes. No
 *     need to swap every <Link> in the codebase.
 *   - Skips: external URLs, target="_blank", hash links, modifier-key
 *     clicks (cmd/ctrl/shift), same-route clicks, prefers-reduced-motion.
 *   - Paper grain is the same SVG noise pattern used elsewhere — keeps the
 *     curtain on-brand with the rest of the warm-paper aesthetic.
 */

type Phase = "idle" | "closing" | "holding" | "opening";

const CLOSE_MS = 540;
const HOLD_MS = 360;
const OPEN_MS = 540;

export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");

  // Refs for clean-up so we can clear in-flight timeouts on unmount.
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearAll = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  // Read pathname + phase into refs so the click handler always sees the
  // latest values without re-binding the document listener every state tick.
  // Re-binding mid-transition (phase: closing → holding → opening) was
  // technically harmless but made tracing the failure mode noisier.
  const pathnameRef = useRef(pathname);
  const phaseRef = useRef(phase);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // The transition driver — preventDefault'd link clicks call this.
  const navigate = useCallback(
    (href: string) => {
      clearAll();
      setPhase("closing");

      timeouts.current.push(
        setTimeout(() => {
          router.push(href);
          setPhase("holding");

          timeouts.current.push(
            setTimeout(() => {
              setPhase("opening");

              timeouts.current.push(
                setTimeout(() => setPhase("idle"), OPEN_MS)
              );
            }, HOLD_MS)
          );
        }, CLOSE_MS)
      );
    },
    [router, clearAll]
  );

  // Document-level click interception.
  //
  // Bound in the CAPTURE phase so we run BEFORE Next.js's <Link> onClick
  // (which lives in React's synthetic event system, delegated at the React
  // root in the bubble phase). Calling stopPropagation here prevents that
  // delegated onClick from firing — so router.push() doesn't race ahead of
  // our curtain.
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return; // honour the OS pref — no ceremony

    const handler = (e: MouseEvent) => {
      // Only react to left-clicks without modifier keys
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.defaultPrevented) return;

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip externals, mailto/tel, target=_blank, hash-only links
      if (href.startsWith("http://") || href.startsWith("https://")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("#")) return;
      if (anchor.getAttribute("target") === "_blank") return;

      // Skip downloads (e.g. /Shashank_Resume.pdf) so the download dialog
      // still opens naturally
      if (anchor.hasAttribute("download")) return;
      if (/\.[a-z0-9]{2,4}$/i.test(href)) return;

      // Same-path click — let the browser scroll-restore but don't curtain
      if (href === pathnameRef.current) return;

      // Bail if we're already mid-transition — but still swallow the click
      // so a double-tap doesn't slip through to Next.js
      if (phaseRef.current !== "idle") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      navigate(href);
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [navigate]);

  // Clean up timeouts if the component unmounts (HMR, etc.)
  useEffect(() => clearAll, [clearAll]);

  return <CurtainOverlay phase={phase} />;
}

// ─── Overlay ─────────────────────────────────────────────────────────────

function CurtainOverlay({ phase }: { phase: Phase }) {
  // The two halves are translated off-screen when idle/opening, on-screen
  // when closing/holding. Transition timing & easing differ per direction:
  //   closing → ease-in-out (smooth arrival)
  //   opening → expo-out    (quick release)
  const isClosed = phase === "closing" || phase === "holding";
  const isAnimating = phase !== "idle";

  const closeEase = "cubic-bezier(0.7, 0, 0.3, 1)";
  const openEase = "cubic-bezier(0.16, 1, 0.3, 1)";

  const topTransform = isClosed ? "translateY(0)" : "translateY(-100%)";
  const bottomTransform = isClosed ? "translateY(0)" : "translateY(100%)";

  const transformTransition =
    phase === "closing"
      ? `transform ${CLOSE_MS}ms ${closeEase}`
      : phase === "opening"
      ? `transform ${OPEN_MS}ms ${openEase}`
      : "none";

  return (
    <div
      aria-hidden={!isAnimating}
      className="fixed inset-0 z-[100]"
      style={{
        pointerEvents: isAnimating ? "auto" : "none",
      }}
    >
      {/* Top panel — half viewport tall */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 bg-ink"
        style={{
          transform: topTransform,
          transition: transformTransition,
          willChange: "transform",
        }}
      >
        <PaperGrain />
      </div>

      {/* Bottom panel — half viewport tall */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
        style={{
          transform: bottomTransform,
          transition: transformTransition,
          willChange: "transform",
        }}
      >
        <PaperGrain />
      </div>

      {/* Signal-orange registration tick at the seam — the only thing that
          sits between the two halves while they're closed. Subtle rhythm
          marker; appears as they meet, fades gracefully as they split so
          the trailing edge of the tick rides out with the panels. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          opacity: phase === "holding" ? 1 : 0,
          transition:
            phase === "holding"
              ? "opacity 220ms ease-out 40ms"
              : "opacity 300ms ease-in",
        }}
      >
        <span className="block h-[2px] w-16 bg-signal" />
      </div>
    </div>
  );
}

// ─── Paper grain — matches the rest of the site's warm-paper texture ─────
function PaperGrain() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none mix-blend-soft-light"
      style={{
        opacity: 0.18,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}
