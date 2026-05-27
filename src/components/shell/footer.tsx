import { person } from "@/lib/person";

/**
 * <Footer>
 *
 * Phase 0 placeholder. Full footer arrives in Phase 6 (Contact + Footer milestone)
 * with ASCII signature line, mono social links, and last-deployed timestamp.
 */

export function Footer() {
  return (
    <footer className="mt-section-sm hairline-b">
      <div className="container-wide flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
          {person.name} · {person.role} · {person.location}
        </p>
        <div className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
          <a
            href={person.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-signal transition-colors"
          >
            GitHub ↗
          </a>
          <a
            href={person.linkedin.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-signal transition-colors"
          >
            LinkedIn ↗
          </a>
          <a
            href={`mailto:${person.email}`}
            className="hover:text-signal transition-colors"
          >
            Email ↗
          </a>
          <a
            href={person.leetcode.url}
            className="hover:text-signal transition-colors"
            target="_blank"
          >
            Leetcode ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
