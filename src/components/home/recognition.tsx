"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { recognition } from "@/lib/experience-data";
import { ImageLightbox } from "@/components/ui/image-lightbox";

const [photo, certificate] = recognition.assets;

/**
 * <Recognition> — tail block of Plate II (Experience).
 *
 * An award floating on its own means nothing; sitting three inches under
 * "owns the real-time backbone of the LMS" it reads as corroboration. So it
 * lives inside the Experience section rather than claiming a plate of its own.
 *
 * Composition: the handover photo, with the certificate dropped on its corner
 * like a print on a desk — both open the lightbox at full size. The award's
 * actual wording ("Execution Expert") is HTML beside the images, not something
 * the reader has to squint at: the handwritten name on the certificate is
 * illegible below ~600px, so the image is texture and the text is the claim.
 */
export function Recognition() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState<number | null>(null);

  const fade = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-12% 0px" },
        transition: {
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        },
      };

  return (
    <motion.div {...fade} className="mt-14 md:mt-20">
      <div className="rounded-sm border border-ink/10 bg-paper-soft/50 px-5 py-7 md:px-10 md:py-9">
        <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3 md:mb-9">
          <span className="text-signal">▍</span> Recognition
        </p>

        <div className="grid items-center gap-9 md:grid-cols-[1.12fr_1fr] md:gap-12">
          {/* ── Images ────────────────────────────────────────────────────
              Photo takes the frame; the certificate overlaps its bottom-right,
              which in this shot is potted plant and pillar — nothing worth
              keeping. Padding on the wrapper gives the rotated print room to
              sit outside the photo without clipping. */}
          <div className="relative pb-10 pr-4 sm:pb-12 sm:pr-8">
            <button
              type="button"
              onClick={() => setIndex(0)}
              aria-label={"Open photo — " + photo.alt}
              className="group block w-full cursor-zoom-in"
            >
              <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-sm border border-ink/12 bg-paper sm:aspect-[3/2]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 92vw, 46vw"
                  style={{ objectPosition: photo.focus }}
                  className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
                />
              </span>
            </button>

            {/* Certificate — a print dropped on the corner, straightening
                itself on hover. The inner scale trims the phone-shot desk
                edges running along the top and bottom of the original. */}
            <button
              type="button"
              onClick={() => setIndex(1)}
              aria-label={"Open certificate — " + certificate.alt}
              className="
                group absolute bottom-0 right-0 w-[46%] max-w-[210px] cursor-zoom-in
                rounded-[2px] bg-paper p-1.5
                shadow-[0_14px_34px_-14px_rgba(0,0,0,0.55)]
                transition-transform duration-500 ease-out
                motion-safe:-rotate-3 motion-safe:hover:rotate-0
              "
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden bg-paper-soft">
                <Image
                  src={certificate.src}
                  alt=""
                  fill
                  sizes="210px"
                  className="scale-[1.07] object-cover"
                />
              </span>
              <span className="mt-1.5 block text-center font-mono text-[8px] uppercase tracking-[0.16em] text-ink-4">
                The certificate
              </span>
            </button>
          </div>

          {/* ── The claim, in text ───────────────────────────────────────── */}
          <div>
            <h3
              className="font-display text-ink"
              style={{
                fontSize: "clamp(24px, 3vw, 38px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              {recognition.award}
            </h3>

            {/* ink-3, not signal: #FF5B1F on paper is 2.75:1, and this is
                10px metadata rather than emphasis. Orange stays where it
                works — the ▍ glyph and the rule beside the number, both
                decorative and exempt from the text contrast floor. */}
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
              {recognition.kind}
              <span className="mx-2 text-ink-4">·</span>
              {recognition.org}
              <span className="mx-2 text-ink-4">·</span>
              {recognition.issuedShort}
            </p>

            <p
              className="mt-5 text-ink-2"
              style={{
                fontSize: "clamp(13.5px, 1.05vw, 15px)",
                lineHeight: 1.65,
                maxWidth: "50ch",
              }}
            >
              {recognition.note}
            </p>

            {/* The number, in display type. A recruiter who reads nothing
                else in this block should still leave with this one. */}
            <div className="mt-7 border-l-2 border-signal pl-4 md:pl-5">
              <p
                className="font-display text-ink"
                style={{
                  fontSize: "clamp(28px, 3.4vw, 42px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  fontWeight: 400,
                }}
              >
                {recognition.impact.value}
              </p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
                {recognition.impact.unit}
              </p>
              <p
                className="mt-2.5 text-ink-2"
                style={{
                  fontSize: "clamp(12.5px, 0.95vw, 13.5px)",
                  lineHeight: 1.55,
                  maxWidth: "42ch",
                }}
              >
                {recognition.impact.detail}
              </p>
            </div>

            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
              Signed by {recognition.signedBy} — {recognition.signedByTitle}
            </p>

            <button
              type="button"
              onClick={() => setIndex(1)}
              className="
                group mt-6 inline-flex items-center gap-2
                font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3
                sketch-link transition-colors duration-300 hover:text-ink
              "
            >
              Read the certificate
              <span
                aria-hidden
                className="inline-block opacity-60 transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      <ImageLightbox
        images={recognition.assets}
        index={index}
        onIndex={setIndex}
        onClose={() => setIndex(null)}
        label="Execution Expert award"
      />
    </motion.div>
  );
}
