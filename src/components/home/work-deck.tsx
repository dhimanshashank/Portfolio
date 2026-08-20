"use client";

import { useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { homepageProjects as projects, type WorkProject } from "@/lib/work-data";
import { ProjectVisual } from "@/components/work/project-visual";
import { cn } from "@/lib/utils";

/**
 * <WorkDeck> — mobile-only looping card stack.
 *
 * The four projects sit as a deck: the top card is fully visible, two more
 * peek behind it (smaller, offset, dimmed). Swipe the top card off and the
 * stack advances — the next rises to the top while the swiped one cycles to
 * the back (circular, so it never runs out). Spring physics throughout.
 *
 * Under reduced motion the deck degrades to a plain readable list — no
 * drag, no stacking. Desktop never renders this (the parent gates it with
 * md:hidden and keeps its pinned scrub showcase).
 */

const VISIBLE = 3; // top card + two peeking behind
const SWIPE_DISTANCE = 96; // px past which a release counts as a fling
const SWIPE_VELOCITY = 420; // or a fast flick

export function WorkDeck() {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState<number[]>(() => projects.map((_, i) => i));

  // Rotate the stack — current top moves to the back (circular array).
  const advance = () =>
    setOrder((prev) => {
      const next = prev.slice(1);
      next.push(prev[0]);
      return next;
    });

  if (reduced) {
    return (
      <div className="container-wide flex flex-col gap-6 pb-24">
        {projects.map((p) => (
          <DeckCardSurface key={p.id} project={p} />
        ))}
      </div>
    );
  }

  const topIdx = order[0];

  return (
    <div className="container-wide pb-20 pt-2">
      <div
        className="relative mx-auto w-full max-w-[420px]"
        style={{ height: "clamp(460px, 76vh, 580px)" }}
      >
        {order.map((projIdx, depth) => (
          <DeckCard
            key={projects[projIdx].id}
            project={projects[projIdx]}
            depth={depth}
            isTop={depth === 0}
            total={projects.length}
            onSwipe={advance}
          />
        ))}
      </div>

      {/* Hint + progress dots */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
          <span className="text-signal">↔</span> Swipe to explore
        </p>
        <div className="flex gap-2">
          {projects.map((p, i) => (
            <span
              key={p.id}
              aria-hidden
              className={cn(
                "block h-[6px] rounded-full transition-all duration-300",
                i === topIdx ? "w-5 bg-signal" : "w-[6px] bg-ink/25"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── One card in the stack — owns its own drag/x so reorders never rebind ──
function DeckCard({
  project,
  depth,
  isTop,
  total,
  onSwipe,
}: {
  project: WorkProject;
  depth: number;
  isTop: boolean;
  total: number;
  onSwipe: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-10, 10]);
  const hidden = depth >= VISIBLE;

  const onDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const flung =
      Math.abs(info.offset.x) > SWIPE_DISTANCE ||
      Math.abs(info.velocity.x) > SWIPE_VELOCITY;

    if (flung) {
      const dir = info.offset.x < 0 ? -1 : 1;
      const off =
        (typeof window !== "undefined" ? window.innerWidth : 480) + 140;
      animate(x, dir * off, {
        type: "tween",
        duration: 0.32,
        ease: [0.4, 0, 0.2, 1],
        onComplete: () => {
          onSwipe(); // card becomes the back of the stack (hidden)
          x.set(0); // reset while invisible — no flash
        },
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 340, damping: 30 });
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: total - depth,
        pointerEvents: isTop ? "auto" : "none",
        // Let vertical page scroll pass through; we own the horizontal axis.
        touchAction: "pan-y",
      }}
      animate={{
        scale: 1 - depth * 0.05,
        y: depth * 16,
        opacity: hidden ? 0 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 30,
        // Snap hidden cards out instantly so the swiped card never ghosts
        // back through the centre; fade rising cards in gently.
        opacity: { duration: hidden ? 0 : 0.3, ease: "easeOut" },
      }}
      drag={isTop ? "x" : false}
      dragSnapToOrigin={false}
      dragMomentum={false}
      onDragEnd={isTop ? onDragEnd : undefined}
    >
      <DeckCardSurface project={project} draggable />
    </motion.div>
  );
}

// ─── The card's visual surface — shared by the deck and the reduced list ───
function DeckCardSurface({
  project,
  draggable = false,
}: {
  project: WorkProject;
  draggable?: boolean;
}) {
  const href = project.caseStudy ? `/work/${project.slug}` : "/work";

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-ink/15 bg-paper-soft",
        "shadow-[0_18px_50px_-20px_rgba(14,14,14,0.45)]",
        draggable && "cursor-grab select-none active:cursor-grabbing"
      )}
    >
      {/* Header bar — number + where it shipped. Its own row so the long
          context label never overlaps the index on a narrow card. */}
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-2.5">
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
          {project.num} <span className="text-ink-4">/ 0{projects.length}</span>
        </span>
        {project.context && (
          <span className="min-w-0 truncate font-mono text-[9px] uppercase tracking-[0.18em] text-ink-4">
            {project.context}
          </span>
        )}
      </div>

      {/* Visual */}
      <div className="relative min-h-0 flex-[1.05] border-b border-ink/10 bg-paper">
        <ProjectVisual project={project} />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-3 p-5">
        <div>
          <h3
            className="font-display text-ink"
            style={{
              fontSize: "clamp(24px, 7vw, 32px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {project.title}
          </h3>
          <p
            className="mt-1 font-display italic text-ink-2"
            style={{ fontSize: "15px", lineHeight: 1.35 }}
          >
            {project.tagline}
          </p>
        </div>

        {/* Metrics */}
        <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/10 pt-3">
          {project.metrics.slice(0, 3).map((m) => (
            <li key={m.label}>
              <span
                className="block font-display tabular-nums text-ink"
                style={{ fontSize: "20px", lineHeight: 1, letterSpacing: "-0.02em" }}
              >
                {m.value}
              </span>
              <span className="mt-1 block max-w-[14ch] font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
                {m.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Stack */}
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-4">
          {project.stack.slice(0, 5).join("  ·  ")}
        </p>

        {/* CTA */}
        <div className="mt-1 flex items-center gap-4">
          <Link
            href={href}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            className="group inline-flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-signal hover:bg-signal-cta hover:text-white"
          >
            {project.caseStudy ? "Case study" : "View"}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
              className="-my-2.5 -mr-3 inline-flex min-h-11 items-center px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-signal"
            >
              Live ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
