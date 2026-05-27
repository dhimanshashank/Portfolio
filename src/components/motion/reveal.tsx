"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * <Reveal>
 *
 * Small viewport-triggered fade for text blocks / cards that don't justify
 * a full GSAP timeline. Use this for simple "appears on scroll" cases.
 * Anything more elaborate → use GSAP via PinnedSection / useGSAP.
 *
 * Respects prefers-reduced-motion: snaps in with no transform.
 */
const baseVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "h1" | "h2" | "h3" | "p" | "span";
}) {
  const reduce = useReducedMotion();

  const MotionTag = motion[Tag] as typeof motion.div;

  if (reduce) {
    return <Tag className={cn(className)}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={baseVariants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
