import type { Metadata } from "next";
import { ProjectCard } from "@/components/work/project-card";
import { featured, regular } from "@/lib/work-data";

export const metadata: Metadata = {
  title: "Selected Work — Shashank Dhiman",
  description:
    "Real-time systems, event-driven pipelines, and full-stack platforms shipped to production.",
};

/**
 * /work — Selected Work showcase.
 *
 * One featured project (Proctoring) anchors the page; three regular cards
 * round out the range below. Order encodes hierarchy without numerical
 * trumpets: featured is bigger because the case study is deeper, not because
 * the metric is louder.
 */
export default function WorkPage() {
  return (
    <>
      {/* ─── Intro ─────────────────────────────────────────────────── */}
      <section className="container-wide pt-24 pb-16 md:pt-32 md:pb-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal mb-8">
          <span aria-hidden>▍</span> Selected work
        </p>
        <h1
          className="font-display text-ink"
          style={{
            fontSize: "clamp(40px, 6vw, 80px)",
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
            fontWeight: 400,
            maxWidth: "18ch",
          }}
        >
          Four production systems.
        </h1>
        <p
          className="mt-6 font-display italic text-ink-2"
          style={{
            fontSize: "clamp(18px, 1.9vw, 24px)",
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            fontWeight: 400,
            maxWidth: "42ch",
          }}
        >
          One year. Mostly backend. Built where the failure modes mattered.
        </p>
      </section>

      {/* ─── Featured ──────────────────────────────────────────────── */}
      <section className="container-wide pb-12 md:pb-16">
        <ProjectCard project={featured} index={0} />
      </section>

      {/* ─── Regular grid (3-up on desktop, stacks on mobile) ───────── */}
      <section className="container-wide pb-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
          {regular.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i + 1} />
          ))}
        </div>

        {/* Footnote — sets honest expectations on what's deep vs surface */}
        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-4 text-center md:text-left">
          Only one case study is shipped today.
          The others sit on a queue —
          <span className="text-ink-3"> deep dives in the order I have something new to say.</span>
        </p>
      </section>
    </>
  );
}
