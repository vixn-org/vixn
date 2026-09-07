import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Safety-net redirects: ensure www always redirects to non-www.
  // The middleware handles this too, but these redirects run at the
  // edge/CDN level on Vercel for maximum coverage.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.vixn.fun",
          },
        ],
        destination: "https://vixn.fun/:path*",
        permanent: true, // 301
      },
    ];
  },
};

export default nextConfig;
