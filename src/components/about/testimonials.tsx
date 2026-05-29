import { testimonials } from "@/lib/about-content";
import { SketchUnderline } from "@/components/ui/sketch-marks";

/**
 * <Testimonials>
 *
 * Renders nothing when `testimonials` is empty — by design. No "Coming
 * soon" placeholder; absence is cleaner than a stub when external proof
 * hasn't been collected yet.
 *
 * Once the user adds 1–2 entries to `src/lib/about-content.ts`, this
 * section appears between How-I-Work and the sidebar.
 */
export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="container-wide py-24 md:py-32 hairline-b">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[180px_1fr] md:gap-16 lg:gap-24">
        {/* Eyebrow */}
        <div className="flex flex-col items-start gap-3 md:sticky md:top-32 md:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            What others say
          </p>
        </div>

        {/* Quotes */}
        <div className="flex flex-col gap-12">
          {testimonials.map((t, i) => (
            <figure key={i} className="max-w-[60ch]">
              <blockquote
                className="font-display italic text-ink"
                style={{
                  fontSize: "clamp(20px, 2.2vw, 30px)",
                  lineHeight: 1.3,
                  letterSpacing: "-0.005em",
                  fontWeight: 400,
                }}
              >
                {/* Open-quote mark in signal */}
                <span aria-hidden className="mr-1 text-signal">&ldquo;</span>
                {t.quote}
                <span aria-hidden className="ml-1 text-signal">&rdquo;</span>
              </blockquote>

              {/* Sketch underline below the quote — hand-drawn rhythm mark */}
              <div className="mt-5 w-32 text-signal">
                <SketchUnderline color="currentColor" weight={1} />
              </div>

              <figcaption className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
                {t.name}
                <span aria-hidden className="mx-3 text-ink-4">·</span>
                {t.role}
                <span aria-hidden className="mx-3 text-ink-4">·</span>
                {t.org}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
