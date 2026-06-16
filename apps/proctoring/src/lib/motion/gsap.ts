/**
 * GSAP registration. Import this once from a client boundary before using
 * ScrollTrigger anywhere else. Safe to import multiple times —
 * gsap.registerPlugin dedupes internally.
 *
 * Mirrors the parent portfolio's motion setup so the demo feels identical.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
