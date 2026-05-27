import type { Metadata } from "next";
import { AboutHero } from "@/components/about/about-hero";
import { EssayBlock } from "@/components/about/essay-block";
import { DeskImageBand } from "@/components/about/desk-image-band";
import { AboutSidebar } from "@/components/about/about-sidebar";
import { AboutOutro } from "@/components/about/about-outro";
import { aboutEssays } from "@/lib/about-content";

export const metadata: Metadata = {
  title: "About — Shashank Dhiman",
  description:
    "Backend engineer. A year at Masters' Union. Currently chasing real-time systems and LLM infrastructure problems.",
};

/**
 * /about — The Story.
 *
 * Editorial. Reads top-to-bottom like a magazine essay. Burns the old
 * "Philosophy Cards" pattern. The desk image lives between Origin and MU
 * sections — the moment in the story where the work got real.
 *
 * Order:
 *   1. AboutHero        — editorial opener, voice in one breath
 *   2. Essay 01 Origin
 *   3. DeskImageBand    — parallax break
 *   4. Essay 02 MU
 *   5. Essay 03 Next
 *   6. AboutSidebar     — quiet facts (skills, education, contact)
 *   7. AboutOutro       — closing line + CTAs into contact / work
 *
 * All prose lives in src/lib/about-content.ts. Anything starting with
 * "DRAFT · " renders with a visible "Draft" chip in dev so it's obvious
 * what's seed copy vs. your own voice.
 */
export default function AboutPage() {
  return (
    <>
      <AboutHero />

      {/* 01 — Origin */}
      <EssayBlock
        eyebrow={aboutEssays[0].eyebrow}
        title={aboutEssays[0].title}
        paragraphs={aboutEssays[0].paragraphs}
      />

      <DeskImageBand />

      {/* 02 — What MU taught me */}
      <EssayBlock
        eyebrow={aboutEssays[1].eyebrow}
        title={aboutEssays[1].title}
        paragraphs={aboutEssays[1].paragraphs}
      />

      {/* 03 — What I'm chasing next */}
      <EssayBlock
        eyebrow={aboutEssays[2].eyebrow}
        title={aboutEssays[2].title}
        paragraphs={aboutEssays[2].paragraphs}
      />

      <AboutSidebar />
      <AboutOutro />
    </>
  );
}
