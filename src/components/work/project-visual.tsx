import type { WorkProject } from "@/lib/work-data";
import { ArchProctoring } from "./visuals/arch-proctoring";
import { ArchAnalytics } from "./visuals/arch-analytics";
import { CodeMessaging } from "./visuals/code-messaging";
import { CodeEventify } from "./visuals/code-eventify";

/**
 * <ProjectVisual>
 *
 * Resolves a project's `visualKind` + `id` into the right hand-built visual.
 * Adding a new project = adding one case here. Intentional, not magic.
 */
export function ProjectVisual({ project }: { project: WorkProject }) {
  switch (project.id) {
    case "proctoring":
      return <ArchProctoring />;
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
