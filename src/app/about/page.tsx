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
    "Full stack engineer. One year shipped, four production systems at Venture Pact (Masters' Union). Currently chasing real-time + LLM infrastructure problems.",
  alternates: { canonical: "/about" },
};

/**
 * /about — The Story.
 *
 * One condensed essay instead of three — tuned for a recruiter / EM
 * read-through:
 *
 *   1. AboutHero            — editorial opener, voice in one breath
 *   2. Essay                — origin → production lesson → direction
 *   3. DeskImageBand        — atmospheric break
 *   4. ExperienceTimeline   — the dated facts behind the essay
 *   5. MastersUnionBlock    — one-line employer explainer for outsiders
 *   6. HowIWork             — process / collaboration signal
 *   7. Testimonials         — invisible until quotes are added
 *   8. AboutSidebar         — facts: skills, education, contact
 *   9. AboutOutro           — closing line + CTAs (incl. Download CV)
 */
export default function AboutPage() {
  return (
    <>
      <AboutHero />

      <EssayBlock
        eyebrow={aboutEssays[0].eyebrow}
        title={aboutEssays[0].title}
        paragraphs={aboutEssays[0].paragraphs}
      />

      <DeskImageBand />

      <ExperienceTimeline />
      <MastersUnionBlock />

      <HowIWork />
      <Testimonials />

      <AboutSidebar />
      <AboutOutro />
    </>
  );
}
