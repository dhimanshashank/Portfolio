import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { PaperPlaneFlight } from "@/components/home/paper-plane-flight";
import { Experience } from "@/components/home/experience";
import { SelectedWork } from "@/components/home/selected-work";
import { EngineeringLog } from "@/components/problems/engineering-log";
import { ProofStrip } from "@/components/home/proof-strip";
import { WorksOn } from "@/components/home/works-on";

/**
 * ISR — re-render every 6 hours so the proof strip's GitHub/LeetCode
 * numbers stay fresh without a per-request fetch. Classic segment config;
 * cacheComponents is intentionally OFF in this project.
 */
export const revalidate = 21600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Home (/).
 *
 * Field Cartography composition:
 *
 *   I.   Hero               — declaration, not description
 *   II.  Experience         — current role + timeline, replaces the manifesto
 *   III. Selected Work      — three projects, scroll-revealed cards w/ visuals
 *   IV.  Engineering Log    — production investigations, clue → root cause → fix
 *        Proof Strip        — measured numbers: leetcode, throughput, latency
 *   V.   Territory + Story  — works-on bar + closing CTA into /about
 *
 * The "LLMs as infrastructure" plate now lives in the proctoring case study
 * (that's the work it describes); the analytics pipeline is /work-only.
 * The footer (rendered by the root layout) sits directly below. Clean exit.
 */
export default function HomePage() {
  return (
    // Relative wrapper: the paper plane overlay spans the full page height
    // (absolute inset-0) and flies down it as you scroll.
    <div className="relative">
      <PaperPlaneFlight />
      <Hero />
      <Experience />
      <SelectedWork />
      <EngineeringLog />
      <ProofStrip />
      <WorksOn />
    </div>
  );
}
