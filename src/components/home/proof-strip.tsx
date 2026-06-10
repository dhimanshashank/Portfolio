import { fallbackProof, type ProofStats } from "@/lib/proof-data";
import { fetchGithubLive } from "@/lib/live/github";
import { fetchLeetcodeLive } from "@/lib/live/leetcode";
import { ProofStripView } from "./proof-strip-view";

/**
 * <ProofStrip> — server shell.
 *
 * Sits directly above <WorksOn> on the home page. Owns data acquisition;
 * <ProofStripView> owns presentation. Fetchers run at build time and on
 * each ISR revalidation (home page exports `revalidate`); both return
 * null instead of throwing, so the strip degrades to the static resume
 * figures and the build can never fail on a third-party API.
 */
export async function ProofStrip() {
  const [github, leetcode] = await Promise.all([
    fetchGithubLive(),
    fetchLeetcodeLive(),
  ]);

  const anyLive = github !== null || leetcode !== null;

  const stats: ProofStats = anyLive
    ? {
        source: "live",
        fetchedAt: new Date().toISOString(),
        leetcode: leetcode ?? fallbackProof.leetcode,
        github: github ?? fallbackProof.github,
      }
    : fallbackProof;

  return <ProofStripView stats={stats} />;
}
