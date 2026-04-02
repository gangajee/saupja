import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.kakaocdn.net" },
      { protocol: "https", hostname: "*.kakao.com" },
      { protocol: "https", hostname: "saupja.biz" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
