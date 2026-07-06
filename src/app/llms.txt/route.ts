import { person } from "@/lib/person";
import { projects } from "@/lib/work-data";
import { experience, educationLine } from "@/lib/experience-data";
import { notes } from "@/lib/notes-content";

/**
 * /llms.txt — the AEO (answer-engine optimization) surface.
 *
 * The llms.txt convention (llmstxt.org) gives AI models a single, clean
 * markdown summary of the site: who this is, what he shipped, where to read
 * more. Generated from the same canonical data files the pages render from
 * (person.ts, work-data.ts, experience-data.ts, notes-content.ts) so it can
 * never drift from the visible site.
 *
 * Statically prerendered — pure build-time data, no request dependency.
 */

const BASE_URL = "https://shashankdhiman.in";

export const dynamic = "force-static";

function buildLlmsTxt(): string {
  const workLines = projects.map((p) => {
    const url = p.caseStudy ? `${BASE_URL}/work/${p.slug}` : `${BASE_URL}/work`;
    const metrics = p.metrics.map((m) => `${m.value} ${m.label}`).join(", ");
    const context = p.context ? ` Shipped at ${p.context}.` : "";
    return `- [${p.title}](${url}): ${p.tagline}. ${p.blurb}${context} Key metrics: ${metrics}. Stack: ${p.stack.join(", ")}.`;
  });

  const experienceLines = experience.map(
    (e) => `- ${e.role} — ${e.org} (${e.period}). ${e.summary}`
  );

  const writingLines = notes.map(
    (n) => `- [${n.title}](${n.url}) — ${n.readingTime}, published ${n.publishedAt}.`
  );

  return `# ${person.name} — ${person.role}

> ${person.name} is a ${person.role.toLowerCase()} based in ${person.location}, specialising in real-time systems, API & backend engineering, and LLM/AI infrastructure. He builds production systems — WebRTC media servers, event-driven pipelines, realtime messaging — that survive real load. ${person.locationDetail}.

Currently: ${experience[0].role} at ${experience[0].org} (${experience[0].period}).
Education: ${educationLine.degree}, ${educationLine.school} (${educationLine.years}, ${educationLine.note}).

## Selected Work

${workLines.join("\n")}

## Experience

${experienceLines.join("\n")}

## Writing

${writingLines.join("\n")}

## Pages

- [Home](${BASE_URL}/): portfolio overview — selected work, engineering log, live proof-of-work stats
- [Work](${BASE_URL}/work): all projects with case studies
- [About](${BASE_URL}/about): background, working principles, and the longer story
- [Log](${BASE_URL}/log): long-form engineering writing
- [Contact](${BASE_URL}/contact): get in touch
- [Resume (PDF)](${BASE_URL}/Shashank_Resume.pdf)

## Contact

- Email: ${person.email}
- GitHub: ${person.github.url}
- LinkedIn: ${person.linkedin.url}
- LeetCode: ${person.leetcode.url}
`;
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Cache at the edge for a day; content only changes on deploy anyway.
      "Cache-Control": "public, max-age=86400",
    },
  });
}
