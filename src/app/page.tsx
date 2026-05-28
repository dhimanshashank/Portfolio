import { Hero } from "@/components/hero/hero";
import { ManifestoScroll } from "@/components/manifesto/manifesto-scroll";
import { SelectedWork } from "@/components/home/selected-work";
import { WorksOn } from "@/components/home/works-on";

/**
 * Home (/).
 *
 * Phase 3 — Field Cartography composition.
 *
 *   I.   Hero               — declaration, not description
 *   II.  Manifesto          — two italic lines, one scene, signal-tick between
 *   III. Selected Work      — four projects, scroll-revealed cards w/ visuals
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
      <WorksOn />
    </>
  );
}
