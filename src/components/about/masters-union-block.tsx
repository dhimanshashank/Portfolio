import Image from "next/image";
import { mastersUnion } from "@/lib/about-content";
import { SketchDivider } from "@/components/ui/sketch-marks";

/**
 * <MastersUnionBlock>
 *
 * One-line explainer + logo block for Masters' Union. Sits between the
 * MU essay (02) and the next-up essay (03), giving an out-of-India
 * recruiter the context the essay assumes.
 *
 * Compact, paper-soft card. Logo at left, heading + description + link
 * on the right.
 */
export function MastersUnionBlock() {
  return (
    <section className="container-wide pt-10 pb-24 md:pt-12 md:pb-32 hairline-b">
      {/* Sketch divider above — visual rhythm break */}
      <div className="mx-auto mb-12 w-40 text-ink-3">
        <SketchDivider color="currentColor" weight={1.1} />
      </div>

      <div
        className="
          mx-auto max-w-3xl
          rounded-sm border border-ink/10 bg-paper-soft/50
          px-6 py-7 md:px-10 md:py-9
        "
      >
        <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          Where the year was spent
        </p>

        <div className="grid grid-cols-[56px_1fr] gap-5 items-start md:grid-cols-[64px_1fr] md:gap-7">
          {/* Logo */}
          <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-paper border border-ink/10">
            <Image
              src={mastersUnion.logo}
              alt={`${mastersUnion.name} logo`}
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <h3
              className="font-display text-ink"
              style={{
                fontSize: "clamp(22px, 2.4vw, 32px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              {mastersUnion.name}
            </h3>

            <p
              className="mt-3 text-ink-2"
              style={{
                fontSize: "clamp(14px, 1.05vw, 16px)",
                lineHeight: 1.6,
                maxWidth: "56ch",
              }}
            >
              {mastersUnion.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
              <span>{mastersUnion.role}</span>
              <span aria-hidden className="text-ink-4">·</span>
              <span>{mastersUnion.period}</span>
              <span aria-hidden className="text-ink-4">·</span>
              <a
                href={mastersUnion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:text-signal transition-colors"
              >
                mastersunion.org ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
