"use client";

import { cn } from "@/lib/utils";

/**
 * <ArchProctoring>
 *
 * SVG topology for the proctoring system card. Reads left-to-right:
 *
 *     [students]  →  [SFU router]  →  [admin]
 *                         ↓
 *                       [redis]  →  [postgres]
 *
 * Critical path (students → SFU → admin) drawn in signal orange.
 * Storage path (redis/postgres) in ink-3 — supporting, not lead.
 *
 * A small pulsing dot at the SFU router implies "live system" without
 * the chart-junk of moving particles along every line.
 */
export function ArchProctoring({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Proctoring system architecture: students connect to an SFU router which forwards RTP to admin dashboards, with Redis and PostgreSQL behind."
    >
      {/* ─── Definitions ──────────────────────────────────────────────── */}
      <defs>
        {/* Faint grid backdrop — implies the "whiteboard sketch" feel */}
        <pattern id="proc-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
        </pattern>
        {/* Arrowhead — signal orange */}
        <marker id="proc-arrow-signal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--signal)" />
        </marker>
        {/* Arrowhead — ink (supporting paths) */}
        <marker id="proc-arrow-ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" opacity="0.5" />
        </marker>
      </defs>

      <g className="text-ink">
        <rect width="800" height="400" fill="url(#proc-grid)" />

        {/* ─── Students cluster (left) ─────────────────────────────── */}
        {/* Six small nodes implies "many" without drawing 200 of them. */}
        {[
          { x: 60,  y: 100 }, { x: 110, y: 90 },
          { x: 60,  y: 175 }, { x: 110, y: 195 },
          { x: 60,  y: 260 }, { x: 110, y: 290 },
        ].map((p, i) => (
          <g key={i}>
            <rect
              x={p.x} y={p.y} width="28" height="20" rx="2"
              fill="var(--paper-soft)"
              stroke="currentColor" strokeOpacity="0.4" strokeWidth="1"
            />
            {/* Tiny eye-mark — calls back to the proctoring subject without being literal */}
            <circle cx={p.x + 14} cy={p.y + 10} r="1.5" fill="currentColor" opacity="0.55" />
          </g>
        ))}
        <text
          x="100" y="340"
          textAnchor="middle"
          className="fill-current"
          style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.55 }}
        >
          200+ students
        </text>

        {/* ─── SFU router (center, the hot node) ───────────────────── */}
        <g>
          <rect
            x="320" y="160" width="160" height="80" rx="3"
            fill="var(--paper)"
            stroke="var(--signal)" strokeWidth="1.5"
          />
          <text
            x="400" y="190"
            textAnchor="middle"
            fill="var(--ink)"
            style={{ fontSize: 14, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}
          >
            SFU
          </text>
          <text
            x="400" y="210"
            textAnchor="middle"
            fill="var(--ink-3)"
            style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
          >
            mediasoup · rtp forward
          </text>
          <text
            x="400" y="224"
            textAnchor="middle"
            fill="var(--ink-4)"
            style={{ fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
          >
            no server decode · O(1) cpu/stream
          </text>

          {/* Pulse dot — implies live traffic without animating every edge */}
          <circle cx="400" cy="160" r="4" fill="var(--signal)">
            <animate attributeName="r" values="3;6;3" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.2;1" dur="2.2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ─── Admin dashboard (right) ─────────────────────────────── */}
        <g>
          <rect
            x="640" y="170" width="120" height="60" rx="3"
            fill="var(--paper-soft)"
            stroke="currentColor" strokeOpacity="0.45" strokeWidth="1"
          />
          <text x="700" y="195" textAnchor="middle" fill="var(--ink)" style={{ fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            ADMIN
          </text>
          <text x="700" y="212" textAnchor="middle" fill="var(--ink-3)" style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
            &lt;200ms alerts
          </text>
        </g>

        {/* ─── Redis (below SFU) ───────────────────────────────────── */}
        <g>
          <rect x="350" y="300" width="100" height="44" rx="3" fill="var(--paper-soft)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <text x="400" y="320" textAnchor="middle" fill="var(--ink)" style={{ fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            REDIS
          </text>
          <text x="400" y="335" textAnchor="middle" fill="var(--ink-3)" style={{ fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
            pub/sub · presence
          </text>
        </g>

        {/* ─── PostgreSQL (right of Redis) ─────────────────────────── */}
        <g>
          <rect x="500" y="300" width="120" height="44" rx="3" fill="var(--paper-soft)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <text x="560" y="320" textAnchor="middle" fill="var(--ink)" style={{ fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            POSTGRES
          </text>
          <text x="560" y="335" textAnchor="middle" fill="var(--ink-3)" style={{ fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
            composite idx
          </text>
        </g>

        {/* ─── Edges ──────────────────────────────────────────────── */}
        {/* Students → SFU (critical path, signal orange, multiple lines for "many") */}
        <g stroke="var(--signal)" strokeWidth="1.25" fill="none" markerEnd="url(#proc-arrow-signal)" opacity="0.85">
          <path d="M 145 110 C 230 110, 280 170, 320 185" />
          <path d="M 145 200 L 320 200" />
          <path d="M 145 290 C 230 290, 280 230, 320 215" />
        </g>
        {/* SFU → Admin (critical path) */}
        <line x1="480" y1="200" x2="640" y2="200"
          stroke="var(--signal)" strokeWidth="1.5"
          markerEnd="url(#proc-arrow-signal)"
        />
        {/* SFU → Redis (supporting) */}
        <line x1="400" y1="240" x2="400" y2="300"
          stroke="currentColor" strokeOpacity="0.45" strokeWidth="1"
          markerEnd="url(#proc-arrow-ink)"
          strokeDasharray="3 3"
        />
        {/* Redis → Postgres */}
        <line x1="450" y1="322" x2="500" y2="322"
          stroke="currentColor" strokeOpacity="0.45" strokeWidth="1"
          markerEnd="url(#proc-arrow-ink)"
          strokeDasharray="3 3"
        />
        {/* Redis → Admin (event fan-out) */}
        <path d="M 450 310 C 580 310, 640 250, 670 230"
          stroke="currentColor" strokeOpacity="0.45" strokeWidth="1"
          fill="none"
          markerEnd="url(#proc-arrow-ink)"
          strokeDasharray="3 3"
        />

        {/* ─── Critical-path label ─────────────────────────────────── */}
        <text
          x="555" y="190"
          textAnchor="middle"
          fill="var(--signal)"
          style={{ fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          critical path
        </text>
      </g>
    </svg>
  );
}
