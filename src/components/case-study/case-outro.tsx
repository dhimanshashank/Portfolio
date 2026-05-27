import Link from "next/link";
import { caseOutro } from "@/lib/proctoring-case-study";

/**
 * <CaseOutro>
 *
 * Closing. Two CTAs:
 *   1. Primary — out to the full GitHub blog (the unabridged 7,500 words)
 *   2. Secondary — onward to the next case study slot (currently "soon")
 *
 * Editorial layout, no decoration. The page has done its work; this is
 * just the doorway out.
 */
export function CaseOutro() {
  return (
    <section className="bg-paper-soft py-32 md:py-40" aria-label="Read more">
      <div className="container-wide grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24">
        {/* Primary CTA — out to full blog */}
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            <span aria-hidden>▍</span> The full piece
          </p>
          <h2
            className="font-display text-ink"
            style={{
              fontSize: "clamp(28px, 3.6vw, 44px)",
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              fontWeight: 400,
              maxWidth: "20ch",
            }}
          >
            Want the unabridged version?
          </h2>
          <p
            className="mt-4 max-w-[42ch] text-ink-2"
            style={{ fontSize: "clamp(15px, 1.15vw, 17px)", lineHeight: 1.6 }}
          >
            {caseOutro.blogSub}
          </p>
          <a
            href={caseOutro.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group mt-8 inline-flex items-center gap-3
              bg-signal text-paper
              px-6 py-3.5
              font-mono text-[12px] uppercase tracking-[0.18em]
              rounded-sm
              transition-colors duration-300
              hover:bg-signal-low
            "
          >
            {caseOutro.blogCta}
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            >
              ↗
            </span>
          </a>
        </div>

        {/* Secondary — next in the queue */}
        <div className="md:border-l md:border-hairline md:pl-16 lg:pl-24">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
            Up next
          </p>
          <h2
            className="font-display italic text-ink"
            style={{
              fontSize: "clamp(24px, 3vw, 36px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              maxWidth: "20ch",
            }}
          >
            {caseOutro.next.label}
          </h2>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
            {caseOutro.next.sub}
          </p>
          <Link
            href={caseOutro.next.href}
            className="
              group mt-6 inline-flex items-center gap-3
              border border-ink/20
              px-5 py-3
              font-mono text-[11px] uppercase tracking-[0.18em] text-ink
              rounded-sm
              transition-colors duration-300
              hover:bg-ink hover:text-paper hover:border-ink
            "
          >
            Back to selected work
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
