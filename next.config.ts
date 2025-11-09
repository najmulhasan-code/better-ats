import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Mark pdf-parse as server-only external package
  // This prevents it from being bundled for the client and avoids browser API issues
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
