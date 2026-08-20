import { SKILL_GROUPS, SKILL_PROMPT } from "@/lib/skills";

const FLAG = "--all";

/**
 * <SkillsMobile> — the phone-only counterpart to <Workbench>'s drawn
 * monitor. Below tablet, the flight/desk sequence doesn't render at all
 * (see Workbench's MOBILE_BREAKPOINT guard), so mobile gets the desk
 * scene's essence instead: a small hand-drawn monitor (sketch-edge bezel)
 * with the skills as static terminal output and a blinking caret. No JS,
 * no scroll-linked motion; the caret blink is pure CSS (`.term-caret`,
 * with a reduced-motion override to a steady caret).
 *
 * This is the FULL list, not the desktop preview. The drawn monitor in
 * <Workbench> is capped at a 58-column screen and renders the curated
 * HOME_SKILL_GROUPS; this block is plain flowing text with no such limit,
 * so it prints every group and every item at resume wording. The prompt
 * carries `--all` to make the difference legible rather than look like the
 * two surfaces simply disagree.
 */
export function SkillsMobile() {
  return (
    <section className="border-t border-ink/10 bg-paper px-6 py-14 md:hidden">
      <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
        <span className="text-signal" aria-hidden>▍</span> The desk — toolkit
      </p>

      {/* Drawn monitor: paper bezel carries the pencil frame (the sketch
          strokes are ink-colored, invisible on the dark screen itself). */}
      <div className="sketch-edge mx-auto w-full max-w-[420px] bg-paper p-2">
        <div className="rounded-sm bg-void">
          {/* Chrome bar — same vocabulary as CodeFrame */}
          <div className="flex items-center gap-3 border-b border-bone-4/20 px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-bone-4/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-bone-4/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-bone-4/40" />
            </div>
            <p className="ml-2 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-bone-3">
              skills.sh
            </p>
          </div>

          {/* Screen — static typed output */}
          <div className="px-5 py-5 font-mono text-[12px] leading-relaxed">
            {/* SKILL_PROMPT already includes its own "$ " prefix */}
            <p className="text-bone">
              <span className="text-[#9BD2A6]">$</span>{" "}
              {SKILL_PROMPT.replace(/^\$\s*/, "")} {FLAG}
            </p>

            {SKILL_GROUPS.map((group) => (
              <div key={group.label} className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-signal">
                  ## {group.label}
                </p>
                <p className="mt-1 text-bone-2">
                  {group.items.map((s) => s.name).join("  ·  ")}
                </p>
              </div>
            ))}

            <p className="mt-5 text-bone">
              <span className="text-[#9BD2A6]">$</span>{" "}
              <span className="term-caret" aria-hidden>
                ▍
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
