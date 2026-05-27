import type { Metadata } from "next";
import { NowHeader } from "@/components/now/now-header";
import { NowBlock } from "@/components/now/now-block";
import { NowOutro } from "@/components/now/now-outro";
import { nowBlocks } from "@/lib/now-content";

export const metadata: Metadata = {
  title: "Now — Shashank Dhiman",
  description:
    "What I'm actively reading, building, and curious about. A live page, updated when the answer actually changes.",
};

/**
 * /now — Now / Exploring.
 *
 * Phase 6. A page in the /now tradition (nownownow.com) — signals forward
 * momentum, not past wins. Three blocks: Reading · Building · Curious about.
 *
 * Content in src/lib/now-content.ts. Anything starting "DRAFT · " renders
 * muted with a visible draft chip — strip the prefix to "approve" a line.
 */
export default function NowPage() {
  return (
    <>
      <NowHeader />

      <div className="container-wide">
        {nowBlocks.map((block) => (
          <NowBlock key={block.eyebrow} block={block} />
        ))}
      </div>

      <NowOutro />
    </>
  );
}
