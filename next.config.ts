import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Tell Turbopack that the project root is the current directory
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "development"
                ? "script-src 'self' 'unsafe-eval' 'unsafe-inline';"
                : "default-src 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;