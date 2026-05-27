import Link from "next/link";
import { aboutOutro, isDraft, stripDraft } from "@/lib/about-content";
import { cn } from "@/lib/utils";

/**
 * <AboutOutro>
 *
 * Closing of /about. Two CTAs side by side — primary into /contact,
 * secondary into /work. The closing italic line gets one more chance
 * to land voice before the visitor leaves the page.
 */
export function AboutOutro() {
  const lineIsDraft = isDraft(aboutOutro.line);

  return (
    <section className="bg-paper-soft py-32 md:py-40">
      <div className="container-wide">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          <span aria-hidden>▍</span> {aboutOutro.eyebrow}
        </p>

        <p
          className={cn(
            "max-w-[40ch] font-display italic text-ink",
            lineIsDraft && "text-ink-3"
          )}
          style={{
            fontSize: "clamp(28px, 3.6vw, 48px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            wordSpacing: "0.05em",
            fontWeight: 400,
          }}
        >
          {stripDraft(aboutOutro.line)}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href={aboutOutro.primary.href}
            className="
              group inline-flex items-center gap-3
              bg-signal text-paper
              px-6 py-3.5
              font-mono text-[12px] uppercase tracking-[0.18em]
              rounded-sm
              transition-colors duration-300
              hover:bg-signal-low
            "
          >
            {aboutOutro.primary.label}
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>
          <Link
            href={aboutOutro.secondary.href}
            className="
              group inline-flex items-center gap-3
              border border-ink/20
              px-5 py-3
              font-mono text-[11px] uppercase tracking-[0.18em] text-ink
              rounded-sm
              transition-colors duration-300
              hover:bg-ink hover:text-paper hover:border-ink
            "
          >
            {aboutOutro.secondary.label}
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
