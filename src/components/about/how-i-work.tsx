import { SketchAsterisk } from "@/components/ui/sketch-marks";

/**
 * <HowIWork>
 *
 * Three short cards covering process — answers the EM "do you collaborate?"
 * question that the case studies don't. Renders after Essay 03 (Next) on
 * /about, before Testimonials.
 *
 *   01 / Before I write code   — diagram, RFC, tradeoff list
 *   02 / While I write code    — small PRs, failure-mode tests, review
 *   03 / After I ship          — dashboards, error budgets, follow-ups
 */

type Card = {
  num: string;
  title: string;
  body: string;
};

const CARDS: readonly Card[] = [
  {
    num: "01",
    title: "Before I write code",
    body:
      "I diagram. I write a short RFC even when no one asked for one. I list what fails at 10× scale before I touch the keyboard.",
  },
  {
    num: "02",
    title: "While I write code",
    body:
      "Small PRs, tests written against the failure modes I expected — not the happy path. I treat code review as the work, not the wait.",
  },
  {
    num: "03",
    title: "After I ship",
    body:
      "Dashboards before launch. Error budgets, not error-free dreams. The follow-up ticket is part of the original ticket.",
  },
];

export function HowIWork() {
  return (
    <section className="container-wide py-24 md:py-32 hairline-b">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[180px_1fr] md:gap-16 lg:gap-24">
        {/* Eyebrow column */}
        <div className="flex flex-col items-start gap-3 md:sticky md:top-32 md:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            How I work
          </p>
        </div>

        {/* Cards column — 3 stacked on mobile, side-by-side on lg */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7">
          {CARDS.map((card) => (
            <article
              key={card.num}
              className="
                relative rounded-sm border border-ink/10 bg-paper-soft/40
                px-6 py-7 md:px-7 md:py-8
                flex flex-col
              "
            >
              <SketchAsterisk
                className="absolute top-5 right-5 text-ink-3"
                style={{ width: 12, height: 12, opacity: 0.5 }}
              />

              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal mb-3">
                {card.num} / {card.title}
              </p>

              <p
                className="text-ink-2"
                style={{
                  fontSize: "clamp(14px, 1.05vw, 16px)",
                  lineHeight: 1.6,
                }}
              >
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
