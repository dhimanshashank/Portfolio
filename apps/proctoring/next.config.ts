import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to THIS app, not the parent portfolio.
  // Without it, Next walks up to portfolio-v2/package-lock.json and warns on
  // every build — and this app is meant to build/deploy fully standalone.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
