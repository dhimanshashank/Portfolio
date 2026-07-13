import Image from "next/image";
import { person } from "@/lib/person";
import { assetUrl } from "@/lib/assets";

/**
 * <Footer>
 *
 * Bottom of every page. Mono caption row + a horizontal social/utility
 * strip. Includes a small Masters' Union mark and a Resume ↗ link so
 * recruiters reading bottom-up can still find both anchors.
 */

export function Footer() {
  return (
    <footer className="mt-section-sm hairline-b">
      <div className="container-wide flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
          {person.name} · {person.role} · {person.location}
        </p>

        {/* Mobile: 2-column grid of 44px-tall tap rows; md+: the original
            inline wrap row. */}
        <div className="grid grid-cols-2 gap-x-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 md:flex md:flex-wrap md:items-center md:gap-x-6 md:gap-y-3">
          <a
            href={person.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center py-2.5 md:min-h-0 md:py-0 hover:text-signal transition-colors sketch-link"
          >
            GitHub ↗
          </a>
          <a
            href={person.linkedin.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center py-2.5 md:min-h-0 md:py-0 hover:text-signal transition-colors sketch-link"
          >
            LinkedIn ↗
          </a>
          <a
            href={`mailto:${person.email}`}
            className="inline-flex min-h-11 items-center py-2.5 md:min-h-0 md:py-0 hover:text-signal transition-colors sketch-link"
          >
            Email ↗
          </a>
          <a
            href={person.leetcode.url}
            className="inline-flex min-h-11 items-center py-2.5 md:min-h-0 md:py-0 hover:text-signal transition-colors sketch-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leetcode ↗
          </a>

          {/* Small vertical divider — only on md+ where the row is horizontal */}
          <span aria-hidden className="hidden md:inline-block h-3 w-px bg-ink/15" />

          <a
            href="https://assets.shashankdhiman.in/Shashank_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center py-2.5 md:min-h-0 md:py-0 hover:text-signal transition-colors sketch-link"
          >
            Resume ↗
          </a>

          {/* MU brand pill — bigger sketch crop so it actually reads.
              The source file is a tall pencil-sketch with "masters' union"
              text baked into the bottom half. Cropping to the icon portion
              via object-position keeps the mark recognisable inline. */}
          <a
            href="https://mastersunion.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 items-center gap-2 py-2.5 max-md:col-span-2 md:min-h-0 md:py-0 hover:text-signal transition-colors"
            aria-label="Currently at Masters' Union (EdTech)"
          >
            <span
              aria-hidden
              className="relative inline-block h-[20px] w-[20px] shrink-0 overflow-hidden rounded-[2px] bg-paper border border-ink/10"
            >
              <Image
                src={assetUrl("/brands/masters-union.png")}
                alt=""
                fill
                sizes="20px"
                className="object-cover"
                style={{ objectPosition: "center 30%" }}
              />
            </span>
            Masters&apos; Union
          </a>
        </div>
      </div>
    </footer>
  );
}
