import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
};

export default nextConfig;
