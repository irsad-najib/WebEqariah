import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // protocol: "https",
        // hostname: "blobstorageeqariah.blob.core.windows.net",
        // pathname: "/eqariah-images/**",
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/static/uploads/**",
      },
    ],
  },
};

export default nextConfig;
