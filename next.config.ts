import type { NextConfig } from "next";

const backendUrl =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
