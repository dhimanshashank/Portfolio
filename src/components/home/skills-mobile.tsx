import { SKILL_GROUPS, SKILL_PROMPT } from "@/lib/skills";

/**
 * <SkillsMobile> — the phone-only counterpart to <Workbench>'s drawn
 * monitor. Below tablet, the flight/desk sequence doesn't render at all
 * (see Workbench's MOBILE_BREAKPOINT guard), so skills need a plain,
 * static home — no GSAP, no scroll-linked motion, "no movement" per
 * design brief. Same data source (src/lib/skills.ts) as the desktop
 * terminal, so editing one place updates both.
 */
export function SkillsMobile() {
  return (
    <section className="border-t border-ink/10 bg-paper px-6 py-14 md:hidden">
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
        <span aria-hidden>▍</span> {SKILL_PROMPT}
      </p>
      <div className="flex flex-col gap-7">
        {SKILL_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink">
              {group.label}
            </p>
            <p className="mt-2 font-mono text-[13px] leading-relaxed text-ink-2">
              {group.items.join("  ·  ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
