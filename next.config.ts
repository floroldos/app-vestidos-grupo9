import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  // Excluir better-sqlite3 del bundle del cliente (compatible con Turbopack)
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
