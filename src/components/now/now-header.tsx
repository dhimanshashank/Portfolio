import { nowHeader, isNowDraft, stripNowDraft } from "@/lib/now-content";
import { cn } from "@/lib/utils";

/**
 * <NowHeader>
 *
 * Page intro for /now. Eyebrow + "last updated" date + title + lede.
 * Editorial restraint — this page should read like a notebook, not a deck.
 */
export function NowHeader() {
  const ledeIsDraft = isNowDraft(nowHeader.lede);

  return (
    <section className="container-wide pt-24 pb-12 md:pt-32 md:pb-16">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          <span aria-hidden>▍</span> {nowHeader.eyebrow}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
          updated · {stripNowDraft(nowHeader.updatedAt)}
        </p>
      </div>

      <h1
        className="font-display text-ink"
        style={{
          fontSize: "clamp(40px, 6vw, 80px)",
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          fontWeight: 400,
          maxWidth: "20ch",
        }}
      >
        {nowHeader.title}
      </h1>

      <p
        className={cn(
          "mt-6 font-display italic text-ink-2",
          ledeIsDraft && "text-ink-3"
        )}
        style={{
          fontSize: "clamp(18px, 1.9vw, 24px)",
          lineHeight: 1.4,
          // italic — no negative tracking
          letterSpacing: "0",
          fontWeight: 400,
          maxWidth: "48ch",
        }}
      >
        {stripNowDraft(nowHeader.lede)}
      </p>
    </section>
  );
}
