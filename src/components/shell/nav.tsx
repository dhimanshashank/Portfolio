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
  { href: "/log", label: "Log" },
  { href: "/contact", label: "Contact" },
];

// External / utility links rendered alongside the main nav.
// `Resume ↗` is the recruiter exit ramp — always one click from anywhere.
// Filename intentionally meaningful so it lands in the recruiter's
// downloads folder as `Shashank_Resume.pdf`, not a generic `resume.pdf`.
const utilityLinks = [
  { href: "https://assets.shashankdhiman.in/Shashank_Resume.pdf", label: "Resume ↗", external: true },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Summon the command terminal (TerminalMount listens for this).
  const openTerminal = () => window.dispatchEvent(new Event("open-terminal"));

  // Auto-close the mobile drawer whenever the route changes. We can't rely
  // on each Link's onClick to close it — the global RouteTransition listens
  // in the capture phase with stopPropagation, which prevents synthetic
  // onClicks from firing on the underlying <a>. Watching pathname is the
  // one signal that always fires after navigation, regardless of how the
  // click was routed. Adjusting state during render (instead of in an
  // effect) re-renders before paint, so the drawer never flashes open.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

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
                    "font-mono text-[11px] tracking-[0.18em] uppercase transition-colors sketch-link",
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
                className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink hover:text-signal transition-colors sketch-link"
              >
                {l.label}
              </a>
            ))}

            {/* Command terminal — ⌘K */}
            <button
              type="button"
              onClick={openTerminal}
              aria-label="Open command terminal (Command K)"
              className="group flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-3 hover:text-signal transition-colors"
            >
              <span aria-hidden className="text-signal">❯</span>
              <span className="rounded-[3px] border border-ink/15 px-1.5 py-0.5 group-hover:border-signal/40 transition-colors">
                ⌘K
              </span>
            </button>
          </nav>

          {/* Mobile controls — terminal chip + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={openTerminal}
              aria-label="Open command terminal"
              className="text-ink-3 hover:text-signal transition-colors p-1 font-mono text-[14px] leading-none tracking-tight"
            >
              ❯_
            </button>
            <button
              className="text-ink-3 hover:text-ink transition-colors p-1 -mr-1"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
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
