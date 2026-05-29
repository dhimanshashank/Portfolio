import Image from "next/image";
import type { WorkProject } from "@/lib/work-data";
import { ArchAnalytics } from "./visuals/arch-analytics";
import { CodeMessaging } from "./visuals/code-messaging";
import { CodeEventify } from "./visuals/code-eventify";

/**
 * <ProjectVisual>
 *
 * Resolves a project's `id` into the right visual.
 *
 * Proctoring renders the real architecture image (the production diagram
 * shipped at /public/work/proctoring/architecture-1.png). The other three
 * keep their hand-built abstract SVGs until real diagrams are added.
 *
 * Adding a new project = adding one case here. Intentional, not magic.
 */
export function ProjectVisual({ project }: { project: WorkProject }) {
  switch (project.id) {
    case "proctoring":
      return <ProctoringRealImage />;
    case "messaging":
      return <CodeMessaging />;
    case "analytics":
      return <ArchAnalytics />;
    case "eventify":
      return <CodeEventify />;
    default:
      return null;
  }
}

// ─── Proctoring — real architecture image ────────────────────────────────
// Wrapped here so the parent <ProjectCard> stays agnostic of image vs SVG.
function ProctoringRealImage() {
  return (
    <div className="relative h-full w-full">
      <Image
        src="/work/proctoring/architecture-1.png"
        alt="Proctoring system architecture — production"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 700px"
        className="object-contain p-4 md:p-6"
      />
      {/* Mono FIG. caption — sits subtly at the bottom-left so it reads as
          a plate annotation, not an overlay. */}
      <p className="absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-4 pointer-events-none">
        FIG. — system architecture, production
      </p>
    </div>
  );
}
