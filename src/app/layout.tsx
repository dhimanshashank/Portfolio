import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/lib/motion/lenis-provider";
import { Nav } from "@/components/shell/nav";
import { Footer } from "@/components/shell/footer";

// ─── Fonts ──────────────────────────────────────────────────────────────
// All three are variable fonts (best perf + flexibility). Loaded as CSS vars
// so globals.css can wire them into the @theme block without re-importing.

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

// ─── Metadata ───────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Shashank Dhiman — Backend Engineer",
  description:
    "Backend & real-time systems engineer. Building things that survive at 200 concurrent users.",
  metadataBase: new URL("https://dhimanshashank.dev"),
  openGraph: {
    title: "Shashank Dhiman — Backend Engineer",
    description:
      "Backend & real-time systems engineer. Building things that survive at 200 concurrent users.",
    type: "website",
  },
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
      <body className="min-h-screen bg-paper text-ink" suppressHydrationWarning>
        <LenisProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
