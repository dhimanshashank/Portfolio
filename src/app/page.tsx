import { Hero } from "@/components/hero/hero";
import { ManifestoScroll } from "@/components/manifesto/manifesto-scroll";
import { SelectedWork } from "@/components/home/selected-work";
import { AiSystems } from "@/components/home/ai-systems";
import { EngineeringLog } from "@/components/problems/engineering-log";
import { ProofStrip } from "@/components/home/proof-strip";
import { WorksOn } from "@/components/home/works-on";

/**
 * ISR — re-render every 6 hours so the proof strip's GitHub/LeetCode
 * numbers stay fresh without a per-request fetch. Classic segment config;
 * cacheComponents is intentionally OFF in this project.
 */
export const revalidate = 21600;

/**
 * Home (/).
 *
 * Field Cartography composition:
 *
 *   I.   Hero               — declaration, not description
 *   II.  Manifesto          — two italic lines, one scene, signal-tick between
 *   III. Selected Work      — four projects, scroll-revealed cards w/ visuals
 *   VI.  AI Systems         — LLMs as infrastructure, three production facts
 *   V.   Engineering Log    — production investigations, clue → root cause → fix
 *        Proof Strip        — measured numbers: leetcode, throughput, latency
 *   IV.  Territory + Story  — works-on bar + closing CTA into /about
 *
 * The footer (rendered by the root layout) sits directly below. Clean exit.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ManifestoScroll />
      <SelectedWork />
      <AiSystems />
      <EngineeringLog />
      <ProofStrip />
      <WorksOn />
    </>
  );
}
