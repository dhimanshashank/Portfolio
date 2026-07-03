"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/motion/use-gsap";
import { cn } from "@/lib/utils";

const REDUCE_MQ = "(prefers-reduced-motion: reduce)";
function subscribeReduce(cb: () => void) {
  const m = window.matchMedia(REDUCE_MQ);
  m.addEventListener?.("change", cb);
  return () => m.removeEventListener?.("change", cb);
}
const getReduce = () => window.matchMedia(REDUCE_MQ).matches;
import {
  ARCH_NODES,
  ARCH_VIEWBOX,
  CRITICAL_SPINE,
  STREAM_CURVES,
  type ArchNode,
} from "@/lib/work/architecture-topology";

/**
 * <ExplorableArchitecture>
 *
 * The proctoring topology, made explorable. Hover (pointer) or tap (touch)
 * a node to inspect it — the node rings signal-orange and its annotation
 * reveals. An ambient packet rides the critical path (SMIL, dropped under
 * reduced motion). On the full variant, an "add load" control spawns more
 * streams and moves an honest CPU/latency readout: because the SFU forwards
 * rather than decodes, CPU stays roughly flat while latency only creeps —
 * a user-driven echo of the case study's collapse moment, inverted.
 *
 * A real instrument, not a fake dashboard: every number is derived and the
 * framing is honest.
 */
export function ExplorableArchitecture({
  variant = "compact",
  activeAnchor,
  onActiveAnchor,
  className,
}: {
  variant?: "compact" | "full";
  /** Controlled highlight (e.g. from the annotation list). */
  activeAnchor?: string | null;
  onActiveAnchor?: (a: string | null) => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [load, setLoad] = useState(0); // 0..1, full variant only
  const reduced = useSyncExternalStore(subscribeReduce, getReduce, () => false);

  const cpuRef = useRef<SVGTextElement>(null);
  const latRef = useRef<SVGTextElement>(null);

  const active = activeAnchor ?? hovered ?? pinned;

  // Report the internally-driven active anchor upward (hover/tap only, so the
  // controlled `activeAnchor` from a parent list doesn't echo back).
  const internalActive = hovered ?? pinned;
  useEffect(() => {
    onActiveAnchor?.(internalActive);
  }, [internalActive, onActiveAnchor]);

  // Honest readout: SFU forwards (O(1)/stream) → CPU mild, latency creeps.
  useEffect(() => {
    if (variant !== "full") return;
    const cpu = 16 + load * 21; // 16 → 37 %
    const lat = 110 + load * 72; // 110 → 182 ms
    const proxy = { c: 0, l: 0 };
    const from = {
      c: Number(cpuRef.current?.dataset.v ?? 16),
      l: Number(latRef.current?.dataset.v ?? 110),
    };
    proxy.c = from.c;
    proxy.l = from.l;
    const tween = gsap.to(proxy, {
      c: cpu,
      l: lat,
      duration: reduced ? 0 : 0.5,
      ease: "power2.out",
      onUpdate: () => {
        if (cpuRef.current) {
          cpuRef.current.textContent = `${Math.round(proxy.c)}%`;
          cpuRef.current.dataset.v = String(proxy.c);
        }
        if (latRef.current) {
          latRef.current.textContent = `${Math.round(proxy.l)}ms`;
          latRef.current.dataset.v = String(proxy.l);
        }
      },
    });
    return () => {
      tween.kill();
    };
  }, [load, variant, reduced]);

  const setActive = (anchor: string) =>
    setPinned((p) => (p === anchor ? null : anchor));

  const streamCount = 3 + Math.round(load * 9); // 3 → 12 visible streams

  return (
    <div
      className={cn(
        "relative w-full",
        variant === "compact" && "flex h-full flex-col",
        className
      )}
    >
      <svg
        viewBox={`0 0 ${ARCH_VIEWBOX.w} ${ARCH_VIEWBOX.h}`}
        preserveAspectRatio="xMidYMid meet"
        className={cn("w-full", variant === "compact" && "min-h-0 flex-1")}
        role="img"
        aria-label="Explorable proctoring architecture: clients stream to an SFU router which forwards RTP to admin dashboards, with Redis and Postgres behind."
      >
        <defs>
          <pattern id="ea-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
          </pattern>
          <marker id="ea-arrow-signal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--signal)" />
          </marker>
          <marker id="ea-arrow-ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" opacity="0.5" />
          </marker>
        </defs>

        <g className="text-ink">
          <rect width={ARCH_VIEWBOX.w} height={ARCH_VIEWBOX.h} fill="url(#ea-grid)" />

          {/* Extra spawned streams (faint) — the "load" the SFU absorbs */}
          {Array.from({ length: streamCount }).map((_, i) => {
            const base = STREAM_CURVES[i % STREAM_CURVES.length];
            const jitter = (i - streamCount / 2) * 3;
            return (
              <path
                key={`stream-${i}`}
                d={base}
                transform={`translate(0 ${jitter})`}
                stroke="var(--signal)"
                strokeWidth="1"
                fill="none"
                opacity={i < 3 ? 0.85 : 0.18}
                markerEnd={i < 3 ? "url(#ea-arrow-signal)" : undefined}
              />
            );
          })}

          {/* Supporting edges */}
          <line x1="480" y1="200" x2="642" y2="200" stroke="var(--signal)" strokeWidth="1.5" markerEnd="url(#ea-arrow-signal)" />
          <line x1="400" y1="242" x2="400" y2="300" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" markerEnd="url(#ea-arrow-ink)" strokeDasharray="3 3" />
          <line x1="454" y1="322" x2="500" y2="322" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" markerEnd="url(#ea-arrow-ink)" strokeDasharray="3 3" />
          <path d="M 454 312 C 580 312, 642 250, 672 232" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" fill="none" markerEnd="url(#ea-arrow-ink)" strokeDasharray="3 3" />

          {/* Nodes */}
          {ARCH_NODES.map((n) => (
            <ArchNodeShape
              key={n.id}
              node={n}
              active={active === n.anchor}
              onEnter={() => n.anchor && setHovered(n.anchor)}
              onLeave={() => setHovered(null)}
              onActivate={() => n.anchor && setActive(n.anchor)}
            />
          ))}

          {/* Critical-path label */}
          <text x="561" y="188" textAnchor="middle" fill="var(--signal)" style={{ fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            critical path
          </text>

          {/* Ambient packet — SMIL, dropped under reduced motion */}
          {!reduced && (
            <>
              <path id="ea-spine" d={CRITICAL_SPINE} fill="none" stroke="none" />
              <circle r="3.5" fill="var(--signal)">
                <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#ea-spine" />
                </animateMotion>
                <animate attributeName="opacity" values="0;1;1;1;0" dur="4.5s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {/* Load readout (full only) */}
          {variant === "full" && (
            <g>
              <text x="44" y="372" fill="var(--ink-3)" style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                sfu cpu
              </text>
              <text ref={cpuRef} data-v="16" x="120" y="372" fill="var(--ink)" style={{ fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>16%</text>
              <text x="200" y="372" fill="var(--ink-3)" style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>alert latency</text>
              <text ref={latRef} data-v="110" x="320" y="372" fill="var(--ink)" style={{ fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>110ms</text>
            </g>
          )}
        </g>
      </svg>

      {/* Full: honest load control. */}
      {variant === "full" && (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
            add load
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(load * 100)}
              onChange={(e) => setLoad(Number(e.target.value) / 100)}
              aria-label="Add concurrent streams"
              className="h-1 w-40 cursor-pointer accent-[var(--signal)]"
            />
          </label>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-4">
            ~{6 + Math.round(load * 194)} concurrent streams · cpu stays flat (o(1) forward)
          </span>
        </div>
      )}
    </div>
  );
}

// ── One node ────────────────────────────────────────────────────────────────
function ArchNodeShape({
  node,
  active,
  onEnter,
  onLeave,
  onActivate,
}: {
  node: ArchNode;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onActivate: () => void;
}) {
  const interactive = !!node.anchor;
  const cx = node.x + node.w / 2;

  const box =
    node.id === "students" ? (
      <ClientCluster active={active} />
    ) : (
      <>
        <rect
          x={node.x}
          y={node.y}
          width={node.w}
          height={node.h}
          rx="3"
          fill={node.critical ? "var(--paper)" : "var(--paper-soft)"}
          stroke={node.critical ? "var(--signal)" : "currentColor"}
          strokeOpacity={node.critical ? 1 : 0.45}
          strokeWidth={node.critical ? 1.5 : 1}
        />
        <text x={cx} y={node.y + (node.h > 40 ? 30 : 19)} textAnchor="middle" fill="var(--ink)" style={{ fontSize: node.h > 40 ? 13 : 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {node.label}
        </text>
        {node.sub && (
          <text x={cx} y={node.y + (node.h > 40 ? 48 : 19) } textAnchor="middle" fill="var(--ink-3)" style={{ fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }} dy={node.h > 40 ? 0 : 12}>
            {node.sub}
          </text>
        )}
      </>
    );

  return (
    <g>
      {box}

      {/* Active ring */}
      {active && (
        <rect
          x={node.x - 5}
          y={node.y - 5}
          width={node.w + 10}
          height={node.h + 10}
          rx="5"
          fill="none"
          stroke="var(--signal)"
          strokeWidth="1.5"
          opacity="0.9"
        />
      )}

      {/* Oversized invisible hit target (interactive nodes only) */}
      {interactive && (
        <rect
          x={node.x - 8}
          y={node.y - 8}
          width={node.w + 16}
          height={node.h + 16}
          fill="transparent"
          role="button"
          tabIndex={0}
          aria-label={`Inspect ${node.label}`}
          data-cursor
          style={{ cursor: "pointer", outline: "none" }}
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
          onClick={(e) => {
            e.stopPropagation(); // don't let a swipe-deck read this as a fling
            onActivate();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onActivate();
            }
          }}
        />
      )}
    </g>
  );
}

// ── Client cluster (the "students" node region) ─────────────────────────────
function ClientCluster({ active }: { active: boolean }) {
  const dots = [
    { x: 60, y: 100 }, { x: 110, y: 92 },
    { x: 60, y: 175 }, { x: 110, y: 195 },
    { x: 60, y: 258 }, { x: 110, y: 286 },
  ];
  return (
    <g>
      {dots.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width="28" height="20" rx="2" fill="var(--paper-soft)" stroke={active ? "var(--signal)" : "currentColor"} strokeOpacity={active ? 0.9 : 0.4} strokeWidth="1" />
          <circle cx={p.x + 14} cy={p.y + 10} r="1.5" fill="currentColor" opacity="0.55" />
        </g>
      ))}
      <text x="100" y="330" textAnchor="middle" fill="var(--ink)" fillOpacity="0.55" style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
        200+ clients
      </text>
    </g>
  );
}
