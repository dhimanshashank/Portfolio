import { aboutHero, isDraft, stripDraft } from "@/lib/about-content";
import { cn } from "@/lib/utils";

/**
 * <AboutHero>
 *
 * The opening of /about. Editorial. Text only — no portrait, no badges.
 * Large italic Fraunces paragraph that introduces voice in one breath.
 *
 * Renders a small "draft" chip beside the eyebrow while the copy still
 * carries the DRAFT marker, so unedited prose is visible at a glance
 * during dev without breaking the design.
 */
export function AboutHero() {
  const paraIsDraft = isDraft(aboutHero.paragraph);
  const subIsDraft = isDraft(aboutHero.subline);

  return (
    <section className="relative bg-paper">
      <div className="container-wide flex min-h-[80vh] flex-col justify-center pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Eyebrow + optional draft chip */}
        <div className="mb-12 flex items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            <span aria-hidden>▍</span> {aboutHero.eyebrow}
          </p>
          {(paraIsDraft || subIsDraft) && <DraftChip />}
        </div>

        {/* Main paragraph — italic, display serif, the voice */}
        <p
          className={cn(
            "font-display italic text-ink",
            paraIsDraft && "text-ink-3"
          )}
          style={{
            fontSize: "clamp(32px, 4.4vw, 64px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            wordSpacing: "0.05em",
            fontWeight: 400,
            maxWidth: "26ch",
          }}
        >
          {stripDraft(aboutHero.paragraph)}
        </p>

        {/* Subline — smaller, mono-ish via Inter, sits below */}
        {aboutHero.subline && (
          <p
            className={cn(
              "mt-10 max-w-[44ch] text-ink-2",
              subIsDraft && "text-ink-4 italic"
            )}
            style={{
              fontSize: "clamp(16px, 1.3vw, 19px)",
              lineHeight: 1.55,
            }}
          >
            {stripDraft(aboutHero.subline)}
          </p>
        )}
      </div>
    </section>
  );
}

function DraftChip() {
  return (
    <span
      className="
        font-mono text-[9px] uppercase tracking-[0.22em] text-signal
        border border-signal/40 px-2 py-0.5 rounded-sm
      "
      title="Unedited DRAFT — replace with your voice in src/lib/about-content.ts"
    >
      Draft
    </span>
  );
}
