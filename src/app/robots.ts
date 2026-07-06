import type { MetadataRoute } from "next";

/**
 * robots.txt — crawler policy.
 *
 * A portfolio WANTS to be read: search engines for ranking, AI crawlers for
 * answer engines (ChatGPT, Claude, Perplexity, Gemini). Each major AI agent
 * is allowed explicitly, so a future "block unknown bots" default rule can
 * never accidentally hide the site from the tools recruiters actually use
 * to ask "who is Shashank Dhiman?". /api/ stays off-limits for everyone.
 */

const AI_CRAWLERS = [
  // OpenAI — training, search index, and live browsing
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic — training and live browsing
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  // Perplexity — index and live browsing
  "PerplexityBot",
  "Perplexity-User",
  // Google — Gemini / AI Overviews grounding
  "Google-Extended",
  // Apple — Siri / Apple Intelligence
  "Applebot-Extended",
  // Common Crawl — feeds most open-model training sets
  "CCBot",
  // Meta AI
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/"],
      })),
    ],
    sitemap: "https://shashankdhiman.in/sitemap.xml",
    host: "https://shashankdhiman.in",
  };
}
