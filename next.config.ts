import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eqariahblob.blob.core.windows.net",
        pathname: "/eqariah/**", // atau "/eqariah/images/**" jika lebih spesifik
      },
      {
        // Tetap pertahankan untuk development local
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/static/uploads/**",
      },
    ],
    // Optional: Jika ingin nonaktifkan optimisasi Next.js sepenuhnya
    // unoptimized: true,
  },
};

export default nextConfig;
