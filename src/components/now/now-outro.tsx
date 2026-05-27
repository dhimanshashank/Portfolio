import Link from "next/link";
import { nowOutro, isNowDraft, stripNowDraft } from "@/lib/now-content";
import { cn } from "@/lib/utils";

/**
 * <NowOutro>
 *
 * Closing for /now. Single italic line + two CTAs (primary → /contact,
 * secondary → /work). Same shape as AboutOutro for consistency across pages.
 */
export function NowOutro() {
  const draft = isNowDraft(nowOutro.line);

  return (
    <section className="bg-paper-soft py-28 md:py-36">
      <div className="container-wide">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          <span aria-hidden>▍</span> Reach out
        </p>

        <p
          className={cn(
            "max-w-[36ch] font-display italic text-ink",
            draft && "text-ink-3"
          )}
          style={{
            fontSize: "clamp(26px, 3.4vw, 44px)",
            lineHeight: 1.18,
            letterSpacing: "0",
            wordSpacing: "0.04em",
            fontWeight: 400,
          }}
        >
          {stripNowDraft(nowOutro.line)}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href={nowOutro.primary.href}
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
            {nowOutro.primary.label}
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>
          <Link
            href={nowOutro.secondary.href}
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
            {nowOutro.secondary.label}
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
