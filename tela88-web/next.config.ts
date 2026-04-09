import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,

  experimental: {
    optimizePackageImports: ["three"],
  },

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    {
      // Cache estático agressivo para assets imutáveis
      source: "/_next/static/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      // Fontes com cache longo
      source: "/fonts/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],

  // Remover console.log em produção
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error"] }
      : false,
  },
};

export default nextConfig;
