"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type LightboxImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

type Props = {
  images: LightboxImage[];
  /** Index of the open image, or null when closed. */
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  /** Accessible name for the dialog, e.g. "Award photos". */
  label: string;
};

/**
 * <ImageLightbox>
 *
 * Minimal image viewer on the dark (void) surface — same overlay grammar as
 * the command terminal: portal to body, scrim click closes, Escape closes,
 * body scroll locked while open, focus parked inside and restored on exit.
 * Arrow keys step through the set.
 *
 * Deliberately not a gallery: no zoom, no pinch, no thumbnails. It exists so
 * a recruiter can read the certificate text, and nothing more.
 */
export function ImageLightbox({ images, index, onIndex, onClose, label }: Props) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = index !== null;
  const many = images.length > 1;

  // Portals need a DOM, and createPortal can't run during SSR. This is the
  // effect-free "am I hydrated yet" read: false on the server and through
  // hydration, true on every render after.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Keyboard: escape closes, arrows step. Bound only while open.
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" && many) {
        onIndex((index + 1) % images.length);
      } else if (e.key === "ArrowLeft" && many) {
        onIndex((index - 1 + images.length) % images.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, many, onIndex, onClose]);

  // Scroll lock + focus handoff and restore.
  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(id);
      restore?.focus?.();
    };
  }, [open]);

  // Lightweight focus trap — anything that escapes the panel gets pulled
  // back to the close button.
  useEffect(() => {
    if (!open) return;
    const onFocusIn = (e: FocusEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeRef.current?.focus();
      }
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [open]);

  if (!mounted) return null;

  const img = index === null ? null : images[index];
  const dur = reduce ? 0 : undefined;

  return createPortal(
    <AnimatePresence>
      {img && (
        <motion.div
          key="lightbox-scrim"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-[var(--void)]/85 p-4 backdrop-blur-sm md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur ?? 0.18 }}
          onMouseDown={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="flex w-full max-w-[1100px] flex-col items-center"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: dur ?? 0.22, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Title bar — mono, matches the terminal's chrome */}
            <div className="mb-3 flex w-full items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--bone-3)]">
              <span>
                {label}
                {many && (
                  <span className="ml-3 text-[var(--bone-4)]">
                    {(index ?? 0) + 1} / {images.length}
                  </span>
                )}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-[var(--bone-3)] transition-colors hover:text-[var(--bone)]"
              >
                Close ✕
              </button>
            </div>

            {/* The image itself — contained, never cropped */}
            <div className="relative w-full">
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(max-width: 768px) 92vw, 1100px"
                priority
                className="mx-auto h-auto max-h-[74svh] w-auto max-w-full rounded-sm border border-[var(--void-edge)] object-contain"
              />

              {many && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => onIndex(((index ?? 0) - 1 + images.length) % images.length)}
                    className="absolute left-1 top-1/2 -translate-y-1/2 rounded-sm bg-[var(--void)]/70 px-3 py-4 font-mono text-[var(--bone-2)] transition-colors hover:text-[var(--bone)] md:-left-12"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => onIndex(((index ?? 0) + 1) % images.length)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm bg-[var(--void)]/70 px-3 py-4 font-mono text-[var(--bone-2)] transition-colors hover:text-[var(--bone)] md:-right-12"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {/* Caption — the claim lives in text, not baked into the JPEG */}
            <p className="mt-4 max-w-[62ch] text-center font-mono text-[11px] leading-relaxed tracking-[0.06em] text-[var(--bone-2)]">
              {img.caption}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
