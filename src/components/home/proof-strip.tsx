import { fallbackProof, type ProofStats } from "@/lib/proof-data";
import { fetchLeetcodeLive } from "@/lib/live/leetcode";
import { ProofStripView } from "./proof-strip-view";

/**
 * <ProofStrip> — server shell.
 *
 * Sits directly above <WorksOn> on the home page. Owns data acquisition;
 * <ProofStripView> owns presentation. The LeetCode fetcher runs at build
 * time and on each ISR revalidation (home page exports `revalidate`); it
 * returns null instead of throwing, so the strip degrades to the static
 * resume figures and the build can never fail on a third-party API.
 */
export async function ProofStrip() {
  const leetcode = await fetchLeetcodeLive();

  const stats: ProofStats = leetcode
    ? {
        source: "live",
        fetchedAt: new Date().toISOString(),
        leetcode,
      }
    : fallbackProof;

  return <ProofStripView stats={stats} />;
}
