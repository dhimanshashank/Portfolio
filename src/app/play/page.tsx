import type { Metadata } from "next";
import { Playboard } from "@/components/play/playboard";

export const metadata: Metadata = {
  title: "Play — The Drafting Table",
  description:
    "A spare sheet on the desk. Pencil, pen, marker, eraser — draw something, crumple it, or keep it.",
  alternates: { canonical: "/play" },
};

/**
 * /play — the drafting table.
 *
 * The whole site is drawn on one sheet of paper; this page hands the
 * visitor the pencil. No analytics on strokes, nothing leaves the
 * browser — the sketch lives in localStorage and can be downloaded.
 */
export default function PlayPage() {
  return (
    <div className="container-base py-16 md:py-24">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
        <span className="text-signal">▍</span> Off the record — Play
      </p>
      <h1
        className="font-display text-ink"
        style={{
          fontSize: "clamp(32px, 5vw, 64px)",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          fontWeight: 400,
        }}
      >
        The drafting table.
      </h1>
      <p
        className="mt-5 max-w-[52ch] text-ink-2"
        style={{ fontSize: "clamp(14px, 1.05vw, 16px)", lineHeight: 1.65 }}
      >
        Every page here is drawn on the same sheet of paper — this one is
        yours. Same graphite, same ink. Draw something, crumple it, or keep
        it. Nothing you draw leaves your browser.
      </p>

      {/* ─── The board ─────────────────────────────────────────────── */}
      <div className="mt-10 md:mt-14">
        <Playboard />
      </div>
    </div>
  );
}
