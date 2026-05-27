import type { Metadata } from "next";
import { CaseHero } from "@/components/case-study/case-hero";
import { NarrativeReveal } from "@/components/case-study/narrative-reveal";
import { ArchitectureSection } from "@/components/case-study/architecture-section";
import { CollapseMoment } from "@/components/case-study/collapse-moment";
import { CodeReveal } from "@/components/case-study/code-reveal";
import { BeforeAfter } from "@/components/case-study/before-after";
import { EditorialLessons } from "@/components/case-study/editorial-lessons";
import { CaseOutro } from "@/components/case-study/case-outro";

export const metadata: Metadata = {
  title: "Proctoring System Case Study — Shashank Dhiman",
  description:
    "How an SFU-based proctoring system survives 200 concurrent students. One year, three architectures, a few near-collapses.",
};

/**
 * /work/proctoring-system
 *
 * Phase 4 — the centerpiece case study, assembled. Scroll order intentional:
 *
 *   1. Hero            — set the stakes, frame the project
 *   2. Narrative       — voice setter, pinned paragraph reveal
 *   3. Architecture    — diagram + annotations, pinned scroll-through
 *   4. Collapse        — the dramatic CPU climb to 100% at 5 users
 *   5. Code            — 2–3 production snippets, line-by-line reveal
 *   6. Before / After  — parallax metric comparison
 *   7. Lessons         — nine editorial-typography blocks (the voice)
 *   8. Outro           — out to the full blog, link back to /work
 *
 * Content slots live in src/lib/proctoring-case-study.ts. Until those
 * TODOs are filled in, placeholder copy renders in muted italic so it's
 * obvious what still needs your prose.
 */
export default function ProctoringCaseStudy() {
  return (
    <>
      <CaseHero />
      <NarrativeReveal />
      <ArchitectureSection />
      <CollapseMoment />
      <CodeReveal />
      <BeforeAfter />
      <EditorialLessons />
      <CaseOutro />
    </>
  );
}
