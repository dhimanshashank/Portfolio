import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  SketchAsterisk,
  SketchDivider,
  SketchUnderline,
} from "@/components/ui/sketch-marks";

export const metadata: Metadata = {
  title: "Doubt & Discussion — Case Study · Shashank Dhiman",
  description:
    "Four chat surfaces — direct, group, course thread, announcement — on a single realtime layer. A general case study of the system's design.",
};

/**
 * /work/messaging-system
 *
 * General case study — no API routes, no specific filenames, no internal
 * jargon. Just the design story: what the product needed, why one realtime
 * layer beat four separate ones, how delivery and read-tracking work, and
 * the small UX move that made the product feel native.
 *
 * Composition is deliberately lean — editorial sections + the real
 * architecture image. No pinned animations, no scroll choreography. The
 * proctoring case study earns the production polish; this one is a quieter
 * read at the same visual register.
 */
export default function MessagingCaseStudy() {
  return (
    <main className="bg-paper">
      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section className="container-wide pt-20 pb-12 md:pt-28 md:pb-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3 mb-8">
          <span className="text-signal">▍</span> Case Study · Doubt &amp; Discussion
        </p>

        <h1
          className="font-display italic text-ink"
          style={{
            fontSize: "clamp(36px, 5.4vw, 76px)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            wordSpacing: "0.04em",
            fontWeight: 400,
            maxWidth: "18ch",
          }}
        >
          Four chat types,{" "}
          <span className="relative inline-block whitespace-nowrap">
            <span className="not-italic">one</span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 right-0"
              style={{ bottom: "-0.06em", color: "var(--signal)" }}
            >
              <SketchUnderline color="currentColor" weight={1} drawMs={900} />
            </span>
          </span>{" "}
          socket layer.
        </h1>

        <p
          className="mt-8 text-ink-2 max-w-[58ch]"
          style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: 1.65 }}
        >
          Inside a learning platform, students, instructors, and admins
          needed four kinds of conversation. This is how one module ended
          up handling all of them.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
          <span>Masters&apos; Union · production</span>
          <span aria-hidden>·</span>
          <span>2025 — present</span>
          <span aria-hidden>·</span>
          <span>node · socket.io · redis · postgres</span>
        </div>
      </section>

      {/* ─── Section 1 — Four conversations ──────────────────────────── */}
      <Section eyebrow="01 / Context" title="Four conversations, one module.">
        <p>
          The platform needed four kinds of conversation. A student asking
          a private question. A small group working through a problem
          together. A whole class discussing a topic with their instructor.
          Someone announcing something to everyone at once.
        </p>
        <p>
          Four interfaces. Four scopes. The easy path was four modules —
          built once each, owned by whoever needed them.
        </p>
        <p>
          We didn&apos;t take it.
        </p>
      </Section>

      {/* ─── Section 2 — One layer ───────────────────────────────────── */}
      <Section eyebrow="02 / The decision" title="One realtime layer.">
        <p>
          The decision that shaped every part of the build was the refusal
          to fragment. One realtime layer. One message shape. One delivery
          primitive. Whether you were sending a private message or a
          campus-wide announcement, the path was the same — only the
          routing changed.
        </p>
        <p>
          That call made every later feature cheaper. Read receipts worked
          the same way for a direct message and an announcement. Mentions,
          replies, file attachments — written once, available everywhere.
          What looked like four products from the outside was one engine on
          the inside.
        </p>
      </Section>

      {/* ─── Section 3 — Two-room delivery ───────────────────────────── */}
      <Section
        eyebrow="03 / Delivery"
        title="A user lives in two rooms at a time."
      >
        <p>
          Every connected person joins a personal room the moment they sign
          in. That&apos;s the address for anything aimed at them specifically —
          unread counts, new-message badges, conversation-list updates.
        </p>
        <p>
          When they open a chat, they also join the room for that
          conversation. Messages get sent to the room; everyone inside sees
          them in real time. Leave the chat, and you stop receiving its
          live traffic — the personal room is enough to know
          something new arrived.
        </p>
        <p>
          The two-room model was easy to reason about and easy to scale.
          Adding a feature meant choosing which room it belonged to. Nothing
          more.
        </p>
      </Section>

      {/* ─── Section 4 — Reading the room ────────────────────────────── */}
      <Section
        eyebrow="04 / The small move"
        title="Reading the room — literally."
      >
        <p>
          The most satisfying part of the build came from a small UX
          problem. If the recipient was already looking at the thread when
          a new message arrived, marking it unread felt wrong. The module
          should know they&apos;d already seen it.
        </p>
        <p>
          So the system kept a quiet, running record of which conversation
          each person was currently viewing — small, cheap to update,
          faster than any database hit. When a message arrived, the system
          checked: is the recipient already here? If yes, the message
          arrived already read. If no, it queued an unread badge for later.
        </p>
        <p>
          Nothing visible to the user except that the module just felt
          right inside the larger platform. The kind of detail nobody
          notices until you take it away.
        </p>
      </Section>

      {/* ─── Architecture image ──────────────────────────────────────── */}
      <section className="container-wide py-16 md:py-24">
        <div className="mx-auto w-24 text-ink-3 mb-12">
          <SketchDivider color="currentColor" weight={1} />
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal mb-6">
          <span aria-hidden>▍</span> Architecture
        </p>
        <h2
          className="font-display text-ink mb-10 max-w-[22ch]"
          style={{
            fontSize: "clamp(24px, 3.2vw, 38px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          The system on one page.
        </h2>

        <div className="relative aspect-[4/3] w-full max-w-[1100px] mx-auto overflow-hidden border border-ink/10 bg-paper-soft rounded-sm">
          <Image
            src="/work/chat/chatSystemArchitecture.png"
            alt="Doubt & Discussion system architecture — production"
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-contain p-4 md:p-8"
          />
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4 text-center">
          FIG. — System architecture, production
        </p>
      </section>

      {/* ─── Outro ───────────────────────────────────────────────────── */}
      <section className="bg-paper-soft py-24 md:py-32">
        <div className="container-wide flex flex-col items-center text-center gap-8">
          <SketchAsterisk
            className="text-ink-3"
            style={{ width: 18, height: 18, opacity: 0.55 }}
          />

          <p
            className="font-display italic text-ink max-w-[28ch]"
            style={{
              fontSize: "clamp(22px, 2.8vw, 36px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              fontWeight: 400,
            }}
          >
            What looked like four modules from the outside was one engine
            on the inside.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/work"
              className="
                group inline-flex items-center gap-3
                border border-ink/20
                px-5 py-3
                font-mono text-[11px] uppercase tracking-[0.18em] text-ink
                rounded-sm
                transition-colors duration-300
                hover:bg-ink hover:text-paper hover:border-ink
              "
            >
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
              >
                ←
              </span>
              Selected work
            </Link>

            <Link
              href="/contact"
              className="
                group inline-flex items-center gap-3
                bg-signal text-paper
                px-5 py-3
                font-mono text-[11px] uppercase tracking-[0.18em]
                rounded-sm
                transition-colors duration-300
                hover:bg-signal-low
              "
            >
              Talk shop
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// ─── Section shell — eyebrow + title + body, mirrors EssayBlock ─────────
function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-wide py-16 md:py-20 hairline-b">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[180px_1fr] md:gap-16 lg:gap-24">
        <div className="flex flex-col items-start gap-3 md:sticky md:top-32 md:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            {eyebrow}
          </p>
        </div>

        <div className="max-w-[62ch]">
          <h2
            className="font-display text-ink mb-8"
            style={{
              fontSize: "clamp(26px, 3.4vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              maxWidth: "20ch",
            }}
          >
            {title}
          </h2>

          <div
            className="text-ink-2 space-y-6"
            style={{
              fontSize: "clamp(15px, 1.15vw, 17px)",
              lineHeight: 1.7,
              wordSpacing: "0.03em",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
