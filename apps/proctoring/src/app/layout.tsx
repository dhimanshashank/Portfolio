import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WebcamProvider } from "@/components/proctoring/webcam-provider";
import { LenisProvider } from "@/lib/motion/lenis-provider";
import { CustomCursor } from "@/components/shell/custom-cursor";

// ─── Fonts ────────────────────────────────────────────────────────────────
// Same trio as the parent portfolio so the demo reads as the same product.

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

export const metadata: Metadata = {
  title: "Proctoring Engine — Demonstration · Shashank Dhiman",
  description:
    "A browser-side exam-proctoring engine, demonstrated end to end: real webcam, environment checks, a MediaPipe computer-vision loop in a Web Worker, weighted risk scoring with localStorage TTL persistence, and live warning popups. Everything runs on-device — nothing is uploaded.",
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png" }],
  },
};

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
          <WebcamProvider>{children}</WebcamProvider>
        </LenisProvider>

        {/* Ink dot + trailing ring over the native cursor. Pointer-fine,
            hover-capable, motion-tolerant devices only. */}
        <CustomCursor />
      </body>
    </html>
  );
}
