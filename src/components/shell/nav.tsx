"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * <Nav>
 *
 * Minimal top nav. Mono labels, signal-orange active indicator.
 * On mobile: collapses to a hamburger that reveals a full-width overlay drawer.
 * On desktop: horizontal link row as before.
 */

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/now", label: "Now" },
  { href: "/contact", label: "Contact" },
];

// External / utility links rendered alongside the main nav.
// `Resume ↗` is the recruiter exit ramp — always one click from anywhere.
// Filename intentionally meaningful so it lands in the recruiter's
// downloads folder as `Shashank_Resume.pdf`, not a generic `resume.pdf`.
const utilityLinks = [
  { href: "/Shashank_Resume.pdf", label: "Resume ↗", external: true },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md">
        <div className="container-wide flex items-center justify-between py-5">
          {/* Wordmark */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink hover:text-signal transition-colors"
          >
            Shashank Dhiman
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
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

            {/* Utility — Resume ↗ etc. */}
            {utilityLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink hover:text-signal transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-ink-3 hover:text-ink transition-colors p-1 -mr-1"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[57px] inset-x-0 z-40 bg-paper/95 backdrop-blur-md border-b border-[var(--hairline)] md:hidden"
          >
            <nav className="container-wide flex flex-col py-6 gap-0">
              {[{ href: "/", label: "Home" }, ...links].map((l, i) => {
                const active =
                  pathname === l.href ||
                  (l.href !== "/" && pathname.startsWith(l.href));
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block font-mono text-[12px] tracking-[0.18em] uppercase py-3.5 border-b border-[var(--hairline)] transition-colors",
                        active ? "text-signal" : "text-ink-3 hover:text-ink"
                      )}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Utility links — Resume ↗ etc., mirrored from desktop */}
              {utilityLinks.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (links.length + 1 + i) * 0.04, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noopener noreferrer" : undefined}
                    onClick={() => setOpen(false)}
                    className="block font-mono text-[12px] tracking-[0.18em] uppercase py-3.5 text-ink hover:text-signal transition-colors"
                  >
                    {l.label}
                  </a>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
