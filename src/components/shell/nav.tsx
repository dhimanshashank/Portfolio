"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * <Nav>
 *
 * Minimal top nav. Mono labels, hairline underline on active. No logo image —
 * the wordmark IS the logo. No mobile drawer yet (Phase 0 placeholder); will
 * graduate to a sliding overlay in Phase 7.
 */

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/now", label: "Now" },
  { href: "/blog", label: "Notes" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md">
      <div className="container-wide flex items-center justify-between py-5">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink hover:text-signal transition-colors"
        >
          Shashank Dhiman
        </Link>

        <nav className="flex items-center gap-8">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "font-mono text-[11px] tracking-[0.18em] uppercase transition-colors",
                  active ? "text-signal" : "text-ink-3 hover:text-ink"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
