import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.robodialog.com",
      },
      {
        protocol: "https",
        hostname: "s3.robodialog.com",
      },
    ],
  },
};

export default nextConfig;
