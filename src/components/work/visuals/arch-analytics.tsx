"use client";

import { cn } from "@/lib/utils";

/**
 * <ArchAnalytics>
 *
 * Horizontal pipeline diagram for the analytics card:
 *
 *   [LMS events] → [SQS] → [Lambda] → [ClickHouse] → [API]
 *
 * Signal-orange travelling dot animates left → right along the spine,
 * implying continuous ingest. ClickHouse box hangs slightly lower with
 * the "YYYYMM partitions" sublabel — it's the punchline of the pipeline.
 */
export function ArchAnalytics({ className }: { className?: string }) {
  // Node positions chosen to fit a 2:1 card aspect (viewBox 800×400)
  const stages = [
    { x:  60, label: "LMS",        sub: "events"            },
    { x: 220, label: "SQS",        sub: "queue"             },
    { x: 380, label: "LAMBDA",     sub: "classify · transform" },
    { x: 560, label: "CLICKHOUSE", sub: "yyyymm partitions" },
    { x: 720, label: "API",        sub: "multi-tenant"      },
  ];
  const NODE_W = 80;
  const NODE_H = 56;
  const Y = 180;

  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Analytics pipeline: LMS events flow through SQS to Lambda, classified into ClickHouse, served by an API."
    >
      <defs>
        <pattern id="ana-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
        </pattern>
        <marker id="ana-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--signal)" />
        </marker>
      </defs>

      <g className="text-ink">
        <rect width="800" height="400" fill="url(#ana-grid)" />

        {/* ─── Spine path (the "river" the dot travels along) ───────── */}
        {/* Drawn first so node fills sit on top of it */}
        <path
          id="ana-spine"
          d={
            // Connect node centers along Y, then plot the line under them
            stages
              .map((s, i) => `${i === 0 ? "M" : "L"} ${s.x + NODE_W / 2} ${Y + NODE_H / 2}`)
              .join(" ")
          }
          stroke="var(--signal)"
          strokeWidth="1.25"
          fill="none"
          opacity="0.85"
        />

        {/* ─── Stage nodes ─────────────────────────────────────────── */}
        {stages.map((s, i) => {
          const isClickHouse = s.label === "CLICKHOUSE";
          return (
            <g key={s.label}>
              <rect
                x={s.x} y={Y}
                width={NODE_W} height={NODE_H}
                rx="3"
                fill="var(--paper)"
                stroke={isClickHouse ? "var(--signal)" : "currentColor"}
                strokeOpacity={isClickHouse ? 1 : 0.45}
                strokeWidth={isClickHouse ? 1.5 : 1}
              />
              <text
                x={s.x + NODE_W / 2}
                y={Y + 22}
                textAnchor="middle"
                fill="var(--ink)"
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                  fontWeight: isClickHouse ? 500 : 400,
                }}
              >
                {s.label}
              </text>
              <text
                x={s.x + NODE_W / 2}
                y={Y + 38}
                textAnchor="middle"
                fill="var(--ink-3)"
                style={{
                  fontSize: 8,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                }}
              >
                {s.sub}
              </text>
              {/* Stage index above each node */}
              <text
                x={s.x + NODE_W / 2}
                y={Y - 14}
                textAnchor="middle"
                fill="var(--ink-4)"
                style={{
                  fontSize: 8,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.2em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </text>
            </g>
          );
        })}

        {/* ─── Arrowhead at the API node ─────────────────────────────── */}
        <line
          x1={stages[stages.length - 1].x - 12}
          y1={Y + NODE_H / 2}
          x2={stages[stages.length - 1].x - 2}
          y2={Y + NODE_H / 2}
          stroke="var(--signal)"
          strokeWidth="1.25"
          markerEnd="url(#ana-arrow)"
        />

        {/* ─── Travelling dot — implies continuous ingest ───────────── */}
        <circle r="4" fill="var(--signal)">
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            rotate="auto"
          >
            <mpath href="#ana-spine" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;1;0"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>

        {/* ─── ClickHouse callout — the punchline of the pipeline ───── */}
        <g>
          <line
            x1={stages[3].x + NODE_W / 2}
            y1={Y + NODE_H + 6}
            x2={stages[3].x + NODE_W / 2}
            y2={Y + NODE_H + 40}
            stroke="var(--signal)"
            strokeOpacity="0.4"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <text
            x={stages[3].x + NODE_W / 2}
            y={Y + NODE_H + 60}
            textAnchor="middle"
            fill="var(--signal)"
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            −55% query time
          </text>
        </g>

        {/* ─── Top label ─────────────────────────────────────────────── */}
        <text
          x="400"
          y="80"
          textAnchor="middle"
          fill="var(--ink-3)"
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          event-driven · columnar
        </text>
      </g>
    </svg>
  );
}
