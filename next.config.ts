import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blobstorageeqariah.blob.core.windows.net",
        pathname: "/eqariah-images/**",
      },
    ],
  },
};

export default nextConfig;
