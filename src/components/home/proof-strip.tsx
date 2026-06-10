import { fallbackProof } from "@/lib/proof-data";
import { ProofStripView } from "./proof-strip-view";

/**
 * <ProofStrip> — server shell.
 *
 * Sits directly above <WorksOn> on the home page. This component owns data
 * acquisition; <ProofStripView> owns presentation. Currently serves the
 * static fallback — live GitHub/LeetCode fetchers slot in here without
 * touching the view.
 */
export async function ProofStrip() {
  return <ProofStripView stats={fallbackProof} />;
}
