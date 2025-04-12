import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/configurations",
        destination: "/configurations/packages",
        permanent: true,
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
