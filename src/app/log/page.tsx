import type { Metadata } from "next";
import Link from "next/link";
import { ProblemCard } from "@/components/problems/problem-card";
import { problems } from "@/lib/problems-data";
import { NoteCard } from "@/components/notes/note-card";
import { notes, notesFootnote } from "@/lib/notes-content";

export const metadata: Metadata = {
  title: "Log & Notes — Shashank Dhiman",
  description:
    "A running log of production investigations and long-form writing — the clue that cracked each one, the root cause, the fix.",
  alternates: { canonical: "/log" },
};

/**
 * /log — Engineering Log & Notes.
 *
 * Two registers on one page (merged from the old /blog):
 *   investigations — short-form production post-mortems from
 *                    `src/lib/problems-data.ts`, newest first
 *   notes          — curated long-form pieces from `src/lib/notes-content.ts`,
 *                    mostly linking out to GitHub Pages
 *
 * Composition:
 *   1. Page header  — eyebrow, italic title, intro paragraph
 *   2. Entry list   — one <ProblemCard /> per problem
 *   3. Notes        — featured NoteCard + grid for the rest
 *   4. Closing note — quiet footer signalling "more coming"
 */
export default function LogPage() {
  const featuredNote = notes.find((n) => n.featured);
  const restNotes = notes.filter((n) => !n.featured);

  return (
    <main className="bg-paper">
      {/* ─── Page header ─────────────────────────────────────────────── */}
      <section className="container-wide pt-20 pb-12 md:pt-28 md:pb-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 mb-8">
          <span className="text-signal">▍</span> Engineering Log
        </p>

        <h1
          className="font-display italic text-ink max-w-[20ch]"
          style={{
            fontSize: "clamp(36px, 5vw, 72px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            wordSpacing: "0.05em",
            fontWeight: 400,
          }}
        >
          Problems worth writing down.
        </h1>

        <p
          className="mt-6 text-ink-2 max-w-[58ch]"
          style={{ fontSize: "clamp(14px, 1.1vw, 17px)", lineHeight: 1.65 }}
        >
          Production breaks in ways tests never predicted. Each entry below is
          one investigation — the clue that surfaced it, the root cause once
          the dust settled, and what shipped to make it not happen again.
        </p>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
          {problems.length} {problems.length === 1 ? "entry" : "entries"} · newest first
        </p>
      </section>

      {/* ─── Entries ─────────────────────────────────────────────────── */}
      <section className="container-wide pb-24 md:pb-32 flex flex-col gap-12 md:gap-16">
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </section>

      {/* ─── Notes — long-form writing (merged from /blog) ───────────── */}
      <section className="container-wide pb-12 md:pb-16 hairline-t">
        <p className="pt-12 md:pt-16 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 mb-8">
          <span className="text-signal">▍</span> Notes — long-form
        </p>

        <p
          className="text-ink-2 max-w-[58ch] mb-10"
          style={{ fontSize: "clamp(14px, 1.1vw, 17px)", lineHeight: 1.65 }}
        >
          Pieces I&apos;ve sat with long enough to argue for. Most live on
          GitHub Pages while the publishing setup is intentionally simple.
        </p>

        {featuredNote && <NoteCard note={featuredNote} variant="featured" />}

        {restNotes.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7">
            {restNotes.map((note) => (
              <NoteCard key={note.slug} note={note} />
            ))}
          </div>
        )}

        <p className="mt-10 pb-12 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-4 max-w-[60ch]">
          {notesFootnote.line}
        </p>
      </section>

      {/* ─── Closing note ────────────────────────────────────────────── */}
      <section className="container-wide pb-24 md:pb-32 hairline-t">
        <div className="pt-12 md:pt-16 flex flex-col items-center text-center gap-6">
          <p
            className="font-display italic text-ink-2 max-w-[26ch]"
            style={{
              fontSize: "clamp(18px, 1.8vw, 24px)",
              lineHeight: 1.4,
              letterSpacing: "0",
              fontWeight: 400,
            }}
          >
            More gets added as more breaks — and gets put back together.
          </p>

          <Link
            href="/"
            className="
              group inline-flex items-center gap-3
              font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3
              transition-colors hover:text-signal
            "
          >
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:-translate-x-1.5"
            >
              ←
            </span>
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
