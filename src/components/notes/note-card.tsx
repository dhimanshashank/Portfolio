import Link from "next/link";
import type { Note } from "@/lib/notes-content";
import { cn } from "@/lib/utils";

/**
 * <NoteCard>
 *
 * Used at two sizes on /blog: `featured` (full-width, larger type) and
 * `regular` (grid tile). Both share the same surface vocabulary —
 * eyebrow row + title + preview line + tag row + link.
 *
 * External links render with ↗ and open in a new tab.
 */
export function NoteCard({
  note,
  variant = "regular",
}: {
  note: Note;
  variant?: "featured" | "regular";
}) {
  const isFeatured = variant === "featured";
  const formattedDate = formatDate(note.publishedAt);

  const linkProps = note.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" as const }
    : {};

  return (
    <Link
      href={note.url}
      {...linkProps}
      className={cn(
        "group block hairline rounded-sm bg-paper-soft transition-colors duration-300",
        "hover:border-ink/40",
        isFeatured ? "p-8 md:p-12" : "p-6 md:p-8"
      )}
    >
      {/* ─── Eyebrow row: date · reading time ──────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
        <span>{formattedDate}</span>
        <span aria-hidden className="text-ink-4">·</span>
        <span>{note.readingTime} read</span>
        {isFeatured && (
          <>
            <span aria-hidden className="text-ink-4">·</span>
            <span className="text-signal">Featured</span>
          </>
        )}
      </div>

      {/* ─── Title ─────────────────────────────────────────────────── */}
      <h3
        className={cn(
          "mt-5 font-display text-ink",
          isFeatured ? "max-w-[24ch]" : "max-w-[20ch]"
        )}
        style={{
          fontSize: isFeatured
            ? "clamp(28px, 3.6vw, 48px)"
            : "clamp(20px, 2vw, 26px)",
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
          fontWeight: 400,
        }}
      >
        {note.title}
      </h3>

      {/* ─── Preview ───────────────────────────────────────────────── */}
      <p
        className={cn(
          "mt-5 font-display italic text-ink-2",
          isFeatured ? "max-w-[52ch]" : "max-w-[36ch]"
        )}
        style={{
          fontSize: isFeatured
            ? "clamp(18px, 1.7vw, 22px)"
            : "clamp(15px, 1.2vw, 17px)",
          lineHeight: 1.4,
          // italic — no negative letter-spacing
          letterSpacing: "0",
          wordSpacing: "0.02em",
          fontWeight: 400,
        }}
      >
        {note.preview}
      </p>

      {/* ─── Tag row + link affordance ─────────────────────────────── */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-hairline px-2.5 py-1"
            >
              {tag}
            </span>
          ))}
        </div>

        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2 group-hover:text-signal transition-colors">
          {note.external ? "Read on github pages" : "Read note"}
          <span
            aria-hidden
            className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
          >
            {note.external ? "↗" : "→"}
          </span>
        </span>
      </div>
    </Link>
  );
}

// Small util — "01 Sep 2025" style
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
