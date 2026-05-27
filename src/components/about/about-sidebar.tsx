import { person } from "@/lib/person";
import { aboutFacts } from "@/lib/about-content";
import { PortraitCard } from "./portrait-card";

/**
 * <AboutSidebar>
 *
 * Facts, not flexing. Sits at the bottom of /about as a quiet appendix.
 * Two-column on desktop (skills left, education + contact right).
 * Stacks on mobile.
 *
 * Skills are categorized but rendered as a tight list — small mono caps —
 * never a featured "skill cloud" grid. The visual weight stays on the essays.
 */
export function AboutSidebar() {
  return (
    <section className="container-wide py-24 md:py-32 hairline-b">
      <p className="mb-12 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
        <span aria-hidden>▍</span> Facts
      </p>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.4fr_1fr] md:gap-24">
        {/* SKILLS — categorized list */}
        <div>
          <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
            What I reach for
          </p>
          <ul className="flex flex-col gap-6">
            {aboutFacts.skills.map((group) => (
              <li key={group.group} className="grid grid-cols-1 gap-2 md:grid-cols-[180px_1fr]">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
                  {group.group}
                </span>
                <span className="text-ink-2" style={{ fontSize: "15px", lineHeight: 1.55 }}>
                  {group.items.join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* PORTRAIT + EDUCATION + CONTACT */}
        <div className="flex flex-col gap-12">
          {/* Portrait card — first visual of the person on this page.
              Magazine author-bio scale so it accompanies the essays rather
              than dominating them. */}
          <PortraitCard className="max-w-[260px]" />

          {/* Education */}
          <div>
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
              Education
            </p>
            <p className="font-display text-ink" style={{ fontSize: "20px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              {aboutFacts.education.degree}
            </p>
            <p className="mt-1 text-ink-2" style={{ fontSize: "14px", lineHeight: 1.5 }}>
              {aboutFacts.education.school}
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
              {aboutFacts.education.years} · {aboutFacts.education.note}
            </p>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
              Reach me
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${person.email}`}
                  className="group inline-flex items-baseline gap-3 font-mono text-[12px] uppercase tracking-[0.18em] text-ink hover:text-signal transition-colors"
                >
                  Email
                  <span className="text-ink-3 lowercase tracking-normal group-hover:text-signal transition-colors">
                    {person.email}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={person.linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink hover:text-signal transition-colors"
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a
                  href={person.github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink hover:text-signal transition-colors"
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href={person.leetcode.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-3 hover:text-signal transition-colors"
                >
                  LeetCode ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
