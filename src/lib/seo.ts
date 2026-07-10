/**
 * Structured-data (JSON-LD) builders — one source of truth for schema.org.
 *
 * Everything derives from person.ts / work-data.ts so schema never drifts
 * from the visible site. Entities carry stable @id anchors (#person,
 * #website) so search engines and answer engines can join the graph across
 * pages instead of seeing disconnected blobs.
 */

import { person } from "@/lib/person";
import { projects, type WorkProject } from "@/lib/work-data";
import { experience, educationLine } from "@/lib/experience-data";
import { assetUrl } from "@/lib/assets";

export const BASE_URL = "https://shashankdhiman.in";

const PERSON_ID = `${BASE_URL}/#person`;
const WEBSITE_ID = `${BASE_URL}/#website`;

/** Enriched Person node — referenced by @id from every other entity. */
function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: person.name,
    url: BASE_URL,
    image: assetUrl("/hero/portrait-halftone2.png"),
    jobTitle: person.role,
    description:
      "Full stack engineer based in Chandigarh, India — real-time systems, API & backend engineering, LLM/AI infrastructure. Builds the EdTech learning platform (LMS) at Masters' Union: AI proctoring, real-time messaging, and event analytics in production.",
    email: `mailto:${person.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chandigarh",
      addressCountry: "IN",
    },
    worksFor: {
      "@type": "Organization",
      name: experience[0].org,
      url: experience[0].href,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: educationLine.school,
    },
    sameAs: [person.github.url, person.linkedin.url, person.leetcode.url],
    knowsAbout: [
      "Full Stack Engineering",
      "Backend Engineering",
      "Real-time Systems",
      "WebRTC",
      "WebSockets",
      "Node.js",
      "Distributed Systems",
      "Event-driven Architecture",
      "LLM Integration",
      "AI Infrastructure",
      "EdTech",
      "Learning Management Systems (LMS)",
    ],
  };
}

/** Site-wide graph — rendered once in the root layout. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personNode(),
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: BASE_URL,
        name: person.name,
        description:
          "Portfolio of Shashank Dhiman — full stack engineer. Real-time systems, APIs, LLM integration.",
        publisher: { "@id": PERSON_ID },
        inLanguage: "en",
      },
    ],
  };
}

/** Case-study graph — TechArticle + breadcrumbs for a /work/<slug> page. */
export function caseStudyGraph(projectId: string) {
  const p = projects.find((x) => x.id === projectId) as WorkProject;
  const url = `${BASE_URL}/work/${p.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}/#article`,
        headline: `${p.title} — ${p.tagline}`,
        description: p.blurb,
        url,
        author: { "@id": PERSON_ID },
        keywords: p.stack.join(", "),
        isPartOf: { "@id": WEBSITE_ID },
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Work", item: `${BASE_URL}/work` },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      },
    ],
  };
}
