import { person } from "@/lib/person";

/**
 * <ContactSidebar>
 *
 * Right-column accompaniment to the form. Direct links as a fallback —
 * if mailto: doesn't work, or someone prefers their own client, the email
 * is right there to copy. Also surfaces LinkedIn / GitHub / LeetCode for
 * recruiters and collaborators who'd rather verify the work first.
 */
export function ContactSidebar() {
  return (
    <aside className="flex flex-col gap-12">
      {/* ── Direct email ────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          Or just email
        </p>
        <a
          href={`mailto:${person.email}`}
          className="
            group inline-flex items-baseline gap-2
            font-display text-ink hover:text-signal transition-colors
            break-all
          "
          style={{
            fontSize: "clamp(20px, 2.2vw, 28px)",
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            fontWeight: 400,
          }}
        >
          {person.email}
          <span
            aria-hidden
            className="opacity-60 transition-transform duration-300 group-hover:translate-x-1"
          >
            ↗
          </span>
        </a>
      </div>

      {/* ── Other channels ──────────────────────────────────────────── */}
      <div>
        <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          Elsewhere
        </p>
        <ul className="flex flex-col gap-3">
          <ChannelLink href={person.linkedin.url} label="LinkedIn" external />
          <ChannelLink href={person.github.url} label="GitHub" external />
          <ChannelLink href={person.leetcode.url} label="LeetCode" external muted />
        </ul>
      </div>

      {/* ── Response time / availability ───────────────────────────── */}
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
        India · UTC+5:30 · usually reply within 48h
      </p>
    </aside>
  );
}

function ChannelLink({
  href,
  label,
  external,
  muted,
}: {
  href: string;
  label: string;
  external?: boolean;
  muted?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`font-mono text-[12px] uppercase tracking-[0.18em] hover:text-signal transition-colors ${
          muted ? "text-ink-3" : "text-ink"
        }`}
      >
        {label} {external && "↗"}
      </a>
    </li>
  );
}
