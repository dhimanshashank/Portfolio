import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project. Without it, Next picks
  // a parent package-lock.json and emits a warning on every build.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Retired routes — /now had only draft content, /blog merged into /log.
  async redirects() {
    return [
      { source: "/now", destination: "/about", permanent: true },
      { source: "/blog", destination: "/log", permanent: true },
    ];
  },
};

export default nextConfig;
