import { cn } from "@/lib/utils";

/**
 * <Placeholder>
 *
 * Stand-in for every route during Phase 0. Shows what phase will build this
 * page out so it's obvious during dev what's not done yet. Designed to feel
 * intentional, not empty — even unbuilt routes should look like they belong.
 */

export function Placeholder({
  eyebrow,
  title,
  description,
  phase,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  phase: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "container-wide flex min-h-[calc(100vh-200px)] flex-col justify-center py-section",
        className
      )}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal mb-6">
        {eyebrow}
      </p>
      <h1
        className="font-display text-ink leading-[1.05]"
        style={{ fontSize: "var(--text-display)", letterSpacing: "var(--tracking-tightest)" }}
      >
        {title}
      </h1>
      <p
        className="mt-6 max-w-[640px] text-ink-2"
        style={{ fontSize: "var(--text-lead)", lineHeight: "var(--leading-relaxed)" }}
      >
        {description}
      </p>
      <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-4">
        {phase} · placeholder
      </p>
    </section>
  );
}
