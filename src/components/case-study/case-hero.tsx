import Link from "next/link";
import { caseHero } from "@/lib/proctoring-case-study";

/**
 * <CaseHero>
 *
 * Cinematic open for the proctoring case study. Same editorial language
 * as the main site hero but in the register of a single project's deep dive:
 * dense eyebrow with breadcrumb, title in display serif, italic subtitle.
 *
 * No portrait here — this page is about the system, not the engineer.
 */
export function CaseHero() {
  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-paper">
      <div className="container-wide flex h-full flex-col justify-center">
        {/* Breadcrumb / eyebrow row */}
        <div className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]">
          <Link href="/work" className="text-ink-3 hover:text-signal transition-colors">
            Selected work
          </Link>
          <span className="text-ink-4" aria-hidden>/</span>
          <span className="text-signal">{caseHero.eyebrow}</span>
        </div>

        {/* Title */}
        <h1
          className="font-display text-ink"
          style={{
            fontSize: "clamp(40px, 6vw, 88px)",
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
            fontWeight: 400,
            maxWidth: "22ch",
          }}
        >
          {caseHero.title}
        </h1>

        {/* Subtitle — italic Fraunces, the case study's tagline */}
        <p
          className="mt-6 font-display italic text-ink-2"
          style={{
            fontSize: "clamp(18px, 1.9vw, 24px)",
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            wordSpacing: "0.1em",
            fontWeight: 400,
            maxWidth: "40ch",
          }}
        >
          {caseHero.subtitle}
        </p>

        {/* Context line — quiet bottom anchor */}
        <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-4">
          {caseHero.context}
        </p>
      </div>

      {/* Scroll cue — bottom-left, same rhythm as the home hero */}
      <div className="absolute bottom-8 left-6 md:left-10 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
        <span className="text-signal">▍</span> Scroll
      </div>
    </section>
  );
}
