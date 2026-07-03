/**
 * Proctoring architecture topology — geometry as data.
 *
 * The hand-drawn SVG in arch-proctoring.tsx placed every box by hand; this
 * lifts the node model out so <ExplorableArchitecture> can render + wire
 * interaction generically. Node copy for the reveal comes from the existing
 * case-study annotations (single source of truth).
 */

import { caseArchitecture } from "@/lib/proctoring-case-study";

export type ArchNode = {
  id: string;
  /** Matching annotation anchor, if this node is inspectable. */
  anchor?: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** On the hot path (drawn in signal orange). */
  critical?: boolean;
};

export const ARCH_VIEWBOX = { w: 800, h: 400 };

export const ARCH_NODES: ArchNode[] = [
  { id: "students", anchor: "students", label: "Clients", sub: "200+ browsers", x: 44, y: 92, w: 116, h: 210 },
  { id: "ai", anchor: "ai", label: "Browser inference", sub: "mediapipe · wasm", x: 40, y: 44, w: 168, h: 30 },
  { id: "sfu", anchor: "sfu", label: "SFU", sub: "mediasoup · rtp forward", x: 320, y: 158, w: 160, h: 84, critical: true },
  { id: "admin", label: "Admin", sub: "<200ms alerts", x: 642, y: 168, w: 118, h: 64, critical: true },
  { id: "redis", anchor: "redis", label: "Redis", sub: "pub/sub · presence", x: 350, y: 300, w: 104, h: 46 },
  { id: "postgres", label: "Postgres", sub: "composite idx", x: 500, y: 300, w: 120, h: 46 },
];

/** Invisible spine the SMIL packet rides: client edge → through SFU → admin. */
export const CRITICAL_SPINE = "M 160 200 L 642 200";

/** Faint stream curves from the client cluster into the SFU (drawn once, and
 *  re-used as the "extra load" lines when the load control spawns more). */
export const STREAM_CURVES = [
  "M 160 120 C 240 120, 285 168, 320 184",
  "M 160 200 L 320 200",
  "M 160 285 C 240 285, 285 232, 320 216",
];

export const annotationByAnchor = Object.fromEntries(
  caseArchitecture.annotations.map((a) => [a.anchor, a])
) as Record<string, (typeof caseArchitecture.annotations)[number]>;
