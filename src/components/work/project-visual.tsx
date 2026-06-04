import Image from "next/image";
import type { WorkProject } from "@/lib/work-data";
import { ArchAnalytics } from "./visuals/arch-analytics";
import { CodeEventify } from "./visuals/code-eventify";

/**
 * <ProjectVisual>
 *
 * Resolves a project's `id` into the right visual.
 *
 * Proctoring + Messaging render real architecture images (the production
 * diagrams shipped at /public/work/.../*.png). The remaining two keep
 * their hand-built abstract SVGs until real diagrams are added.
 *
 * Adding a new project = adding one case here. Intentional, not magic.
 */
export function ProjectVisual({ project }: { project: WorkProject }) {
  switch (project.id) {
    case "proctoring":
      return (
        <RealArchitectureImage
          src="/work/proctoring/architecture-1.png"
          alt="Proctoring system architecture — production"
        />
      );
    case "messaging":
      return (
        <RealArchitectureImage
          src="/work/chat/chatSystemArchitecture.png"
          alt="Doubt & Discussion system architecture — production"
        />
      );
    case "analytics":
      return <ArchAnalytics />;
    case "eventify":
      return <CodeEventify />;
    default:
      return null;
  }
}

// ─── Real architecture image — shared frame ─────────────────────────────
// Wrapped here so each project card keeps its own caption while the framing
// stays consistent across the catalogue.
function RealArchitectureImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 700px"
        className="object-contain p-4 md:p-6"
      />
      <p className="absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-4 pointer-events-none">
        FIG. — system architecture, production
      </p>
    </div>
  );
}
