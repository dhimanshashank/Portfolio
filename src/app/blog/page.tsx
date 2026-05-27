import type { Metadata } from "next";
import { NoteCard } from "@/components/notes/note-card";
import { notes, notesHeader, notesFootnote } from "@/lib/notes-content";

export const metadata: Metadata = {
  title: "Notes — Shashank Dhiman",
  description:
    "Long-form writing on real-time systems, backend architecture, and what production teaches.",
};

/**
 * /blog — Notes index.
 *
 * Phase 7. Curated list of long-form pieces. Most link out to GitHub Pages
 * for now — the publishing setup is intentionally simple, the content is
 * the priority. One featured card on top; future regular cards in a grid below.
 *
 * Add a note: append to `notes` array in src/lib/notes-content.ts.
 */
export default function NotesIndexPage() {
  const featured = notes.find((n) => n.featured);
  const rest = notes.filter((n) => !n.featured);

  return (
    <>
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <section className="container-wide pt-24 pb-12 md:pt-32 md:pb-16">
        <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          <span aria-hidden>▍</span> {notesHeader.eyebrow}
        </p>
        <h1
          className="font-display text-ink"
          style={{
            fontSize: "clamp(40px, 6vw, 80px)",
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
            fontWeight: 400,
            maxWidth: "18ch",
          }}
        >
          {notesHeader.title}
        </h1>
        <p
          className="mt-6 font-display italic text-ink-2"
          style={{
            fontSize: "clamp(18px, 1.9vw, 24px)",
            lineHeight: 1.4,
            letterSpacing: "0",
            fontWeight: 400,
            maxWidth: "52ch",
          }}
        >
          {notesHeader.lede}
        </p>
      </section>

      {/* ─── Featured note ────────────────────────────────────────────── */}
      {featured && (
        <section className="container-wide pb-12 md:pb-16">
          <NoteCard note={featured} variant="featured" />
        </section>
      )}

      {/* ─── Regular notes grid ───────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="container-wide pb-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7">
            {rest.map((note) => (
              <NoteCard key={note.slug} note={note} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Footnote ─────────────────────────────────────────────────── */}
      <section className="container-wide pb-32">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-4 max-w-[60ch]">
          {notesFootnote.line}
        </p>
      </section>
    </>
  );
}
