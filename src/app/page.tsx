import { Hero } from "@/components/hero/hero";
import { ManifestoScroll } from "@/components/manifesto/manifesto-scroll";

/**
 * Home (/).
 *
 * Phase 1 ↻  Hero
 * Phase 2 ↻  ManifestoScroll  — its own closing CTA hands off to /work.
 *
 * Atmosphere strip + Phase-3 placeholder removed. The page ends with the
 * manifesto's closing CTA; the footer (rendered by the root layout) sits
 * directly below it. Clean exit, no orphaned scaffolding.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ManifestoScroll />
    </>
  );
}
