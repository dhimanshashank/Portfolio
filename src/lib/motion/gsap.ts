/**
 * GSAP registration. Import this once from a client boundary before using
 * ScrollTrigger anywhere else. Safe to import multiple times — gsap.registerPlugin
 * dedupes internally.
 *
 * Lenis is the scroll authority. ScrollTrigger needs to read positions from
 * Lenis's virtual scroll, not the native one — that wiring lives in LenisProvider.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
