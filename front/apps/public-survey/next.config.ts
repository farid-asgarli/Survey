import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable transpilation of monorepo packages
  transpilePackages: ["@survey/types", "@survey/validation", "@survey/api-client", "@survey/ui"],

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
