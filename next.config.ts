import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/#secao-login",
        permanent: false,
      },
      {
        source: "/signup",
        destination: "/#secao-login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
