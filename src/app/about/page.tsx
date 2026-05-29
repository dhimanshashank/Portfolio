import type { Metadata } from "next";
import { AboutHero } from "@/components/about/about-hero";
import { EssayBlock } from "@/components/about/essay-block";
import { DeskImageBand } from "@/components/about/desk-image-band";
import { ExperienceTimeline } from "@/components/about/experience-timeline";
import { MastersUnionBlock } from "@/components/about/masters-union-block";
import { HowIWork } from "@/components/about/how-i-work";
import { Testimonials } from "@/components/about/testimonials";
import { AboutSidebar } from "@/components/about/about-sidebar";
import { AboutOutro } from "@/components/about/about-outro";
import { aboutEssays } from "@/lib/about-content";

export const metadata: Metadata = {
  title: "About — Shashank Dhiman",
  description:
    "Backend engineer. One year shipped, four production systems at Masters' Union. Currently chasing real-time + LLM infrastructure problems.",
};

/**
 * /about — The Story.
 *
 * Phase 3.5 — full composition with timeline + MU explainer + How-I-work
 * + testimonials slot. Order is tuned for a recruiter / EM read-through:
 *
 *   1. AboutHero            — editorial opener, voice in one breath
 *   2. Essay 01 Origin      — where I came from
 *   3. DeskImageBand        — atmospheric break
 *   4. Essay 02 MU          — what production taught me
 *   5. ExperienceTimeline   — the dated facts behind the essay
 *   6. MastersUnionBlock    — one-line MU explainer for outsiders
 *   7. Essay 03 Next        — what I'm chasing
 *   8. HowIWork             — process / collaboration signal
 *   9. Testimonials         — invisible until quotes are added
 *  10. AboutSidebar         — facts: skills, education, contact
 *  11. AboutOutro           — closing line + CTAs (incl. Download CV)
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

      <ExperienceTimeline />
      <MastersUnionBlock />

      {/* 03 — What I'm chasing next */}
      <EssayBlock
        eyebrow={aboutEssays[2].eyebrow}
        title={aboutEssays[2].title}
        paragraphs={aboutEssays[2].paragraphs}
      />

      <HowIWork />
      <Testimonials />

      <AboutSidebar />
      <AboutOutro />
    </>
  );
}
