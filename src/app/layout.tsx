import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LenisProvider } from "@/lib/motion/lenis-provider";
import { Nav } from "@/components/shell/nav";
import { Footer } from "@/components/shell/footer";
import { ScrollProgress } from "@/components/shell/scroll-progress";
import { RouteTransition } from "@/components/shell/route-transition";
import { InitialCurtain } from "@/components/shell/initial-curtain";

// ─── Fonts ──────────────────────────────────────────────────────────────

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

// ─── SEO Metadata ───────────────────────────────────────────────────────

const BASE_URL = "https://shashankdhiman.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Shashank Dhiman — Backend Engineer",
    template: "%s · Shashank Dhiman",
  },
  description:
    "Backend & real-time systems engineer based in India. Building systems that survive production — WebSockets, event-driven architecture, distributed infrastructure.",

  keywords: [
    "Shashank Dhiman",
    "backend engineer",
    "ai engineer",
    "real-time systems",
    "Node.js",
    "WebSocket",
    "distributed systems",
    "India",
    "software engineer",
    "portfolio",
  ],

  authors: [{ name: "Shashank Dhiman", url: BASE_URL }],
  creator: "Shashank Dhiman",
  publisher: "Shashank Dhiman",

  // ── Canonical & alternates ──────────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
  },

  // ── Open Graph ──────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Shashank Dhiman",
    title: "Shashank Dhiman — Backend Engineer",
    description:
      "Backend & real-time systems engineer. Building things that survive production.",
    images: [
      {
        url: "/hero/portrait-halftone2.png",
        width: 1200,
        height: 630,
        alt: "Shashank Dhiman — Backend Engineer",
      },
    ],
    locale: "en_IN",
  },

  // ── Twitter / X card ────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Shashank Dhiman — Backend Engineer",
    description:
      "Backend & real-time systems engineer. Building things that survive production.",
    images: ["/hero/portrait-halftone2.png"],
  },

  // ── Robots ──────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Icons ────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png" },
    ],
    other: [
      { rel: "manifest", url: "/favicon/site.webmanifest" },
    ],
  },

  // ── Verification (add tokens once you connect Search Console) ───────
  // verification: {
  //   google: "YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN",
  // },
};

// ─── JSON-LD Person schema ───────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Shashank Dhiman",
  url: BASE_URL,
  jobTitle: "Backend Engineer",
  description:
    "Backend & real-time systems engineer based in India. Building systems that survive production.",
  sameAs: [
    "https://github.com/dhimanshashank",
    "https://www.linkedin.com/in/shashank-dhiman-358535219/",
  ],
  knowsAbout: [
    "Backend Engineering",
    "Real-time Systems",
    "WebSockets",
    "Node.js",
    "Distributed Systems",
    "Event-driven Architecture",
  ],
};

// ─── Root layout ────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-paper text-ink" suppressHydrationWarning>
        <LenisProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
          <ScrollProgress />
        </LenisProvider>

        {/* Vercel telemetry — page views + Web Vitals. Both inject scripts
            only in production and respect Do Not Track. Safe to leave on
            in dev (they no-op locally). */}
        <Analytics />
        <SpeedInsights />

        {/* Global route-change ceremony — two ink panels meet, sketch
            asterisk pencils in, panels split apart. */}
        <RouteTransition />

        {/* Cold-load / hard-reload welcome — panels start closed, asterisk
            pencils in, Delhi coordinates fade in, then panels open. Plays
            once per page load, then self-unmounts. */}
        <InitialCurtain />
      </body>
    </html>
  );
}
