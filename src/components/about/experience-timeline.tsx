"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * <ExperienceTimeline>
 *
 * Reverse-chronological card stack. Three rows: MU (present), Qspider
 * (intern), GNDEC (education). Each card carries the same shell — mono
 * dates eyebrow, display-serif role title, italic org line, bullet
 * highlights, plus a clickable org-logo slot anchored top-right.
 *
 * Logo treatment:
 *   - If `orgLogo` exists, render as a clickable image (links to orgUrl)
 *   - Else render a typographic mark (display-serif initials in a small
 *     paper-soft square) — still clickable when orgUrl is present
 *   - This way the layout never has empty space, even before more logos
 *     are added.
 *
 * Renders between Essay 02 and Essay 03 on /about.
 */

type Row = {
  period: string;
  role: string;
  org: string;             // italic org + context line under the role
  orgName: string;         // short label used by the typographic fallback
  orgInitials: string;     // 1–2 chars rendered when no logo is present
  orgLogo?: string;        // path under /public, e.g. /brands/masters-union.png
  orgLogoFocus?: string;   // CSS object-position when the source has padding
  orgUrl?: string;         // external homepage; logo + role become clickable
  bullets: readonly string[];
};

const ROWS: readonly Row[] = [
  {
    period: "JAN 2025 — PRESENT",
    role: "Associate Software Developer",
    org: "Venture Pact — Masters' Union · Edtech, India.",
    orgName: "Masters' Union",
    orgInitials: "MU",
    orgLogo: "/brands/masters-union.png",
    orgLogoFocus: "center 30%",
    orgUrl: "https://mastersunion.org",
    bullets: [
      "WebRTC proctoring at 200+ concurrent streams (Mediasoup)",
      "Real-time messaging — Redis-backed presence + keyset pagination",
      "Serverless event analytics — Lambda + ClickHouse",
    ],
  },
  {
    period: "JUN 2024 — JUL 2024",
    role: "Software Developer Intern",
    org: "Qspider · Chandigarh, India.",
    orgName: "Qspider",
    orgInitials: "Q",
    orgLogo: "/brands/qspider.png",
    orgUrl: "https://qspiders.com",
    bullets: [
      "Eventify — full-stack MERN platform with Stripe webhooks + RBAC",
      "Modular REST API with middleware error-boundary pattern",
    ],
  },
  {
    period: "AUG 2021 — JUN 2025",
    role: "B.Tech, Computer Science & Engineering",
    org: "Guru Nanak Dev Engineering College, Ludhiana.",
    orgName: "GNDEC",
    orgInitials: "GN",
    orgLogo: "/brands/gne.png",
    orgUrl: "https://www.gndec.ac.in",
    bullets: ["CGPA 8.45 / 10"],
  },
];

export function ExperienceTimeline() {
  return (
    <section className="container-wide py-24 md:py-32 hairline-b">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[180px_1fr] md:gap-16 lg:gap-24">
        {/* Eyebrow column */}
        <div className="flex flex-col items-start gap-3 md:sticky md:top-32 md:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            Experience
          </p>
        </div>

        {/* Cards column */}
        <ol className="flex flex-col gap-6 md:gap-8">
          {ROWS.map((row) => (
            <li
              key={row.period}
              className="
                relative rounded-sm border border-ink/10 bg-paper-soft/40
                px-6 py-7 md:px-8 md:py-8
              "
            >
              {/* Top-right — clickable org mark */}
              <OrgMark row={row} />

              {/* Right-padding so the role/org headline never collides with
                  the logo slot at narrow viewports. */}
              <div className="pr-[80px] md:pr-[96px]">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal mb-3">
                  {row.period}
                </p>

                <h3
                  className="font-display text-ink"
                  style={{
                    fontSize: "clamp(20px, 2.2vw, 28px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.015em",
                    fontWeight: 400,
                  }}
                >
                  {row.role}
                </h3>

                <p
                  className="mt-1 font-display italic text-ink-2"
                  style={{
                    fontSize: "clamp(14px, 1.1vw, 16px)",
                    lineHeight: 1.4,
                    letterSpacing: "0",
                  }}
                >
                  {row.org}
                </p>
              </div>

              <ul className="mt-5 flex flex-col gap-2">
                {row.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2"
                  >
                    <span aria-hidden className="text-signal/70 shrink-0">—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─── Org mark — clickable logo or typographic fallback ─────────────────── */
function OrgMark({ row }: { row: Row }) {
  const [errored, setErrored] = useState(false);
  const hasLogo = Boolean(row.orgLogo) && !errored;
  const Wrapper: "a" | "div" = row.orgUrl ? "a" : "div";

  const wrapperProps =
    row.orgUrl
      ? {
          href: row.orgUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": `${row.orgName} ↗`,
        }
      : { "aria-label": row.orgName };

  return (
    <Wrapper
      {...wrapperProps}
      className="
        group absolute top-5 right-5 md:top-6 md:right-6
        flex h-[52px] w-[52px] md:h-[64px] md:w-[64px]
        items-center justify-center
        overflow-hidden rounded-sm
        border border-ink/10 bg-paper
        transition-colors duration-300
        hover:border-ink/30
      "
    >
      {hasLogo ? (
        <Image
          src={row.orgLogo!}
          alt={`${row.orgName} logo`}
          fill
          sizes="64px"
          draggable={false}
          onError={() => setErrored(true)}
          className="object-cover"
          style={{ objectPosition: row.orgLogoFocus ?? "center" }}
        />
      ) : (
        // Typographic fallback — display-serif initials sit centred in the
        // square. Reads as intentional, not broken. Becomes a real logo the
        // moment the corresponding file is dropped under /public/brands/.
        <span
          className="font-display text-ink-2 leading-none transition-colors group-hover:text-signal"
          style={{
            fontSize: "clamp(18px, 1.6vw, 22px)",
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          {row.orgInitials}
        </span>
      )}
    </Wrapper>
  );
}
