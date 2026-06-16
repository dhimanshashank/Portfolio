"use client";

/**
 * Re-export of @gsap/react's useGSAP hook for consistent import paths across
 * the app. Use this for any GSAP timeline that should auto-clean up.
 */

export { useGSAP } from "@gsap/react";
export { gsap, ScrollTrigger } from "./gsap";
