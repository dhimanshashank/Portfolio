"use client";

/**
 * Re-export of @gsap/react's useGSAP hook for consistent import paths
 * across the app. Use this for any GSAP timeline that should auto-clean up.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useGSAP(() => {
 *     gsap.to(".thing", { y: -50, scrollTrigger: { trigger: ref.current } });
 *   }, { scope: ref });
 */

export { useGSAP } from "@gsap/react";
export { gsap, ScrollTrigger } from "./gsap";
