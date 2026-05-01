import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - This property might not be in NextConfig types yet for Turbopack experimental
  allowedDevOrigins: ['172.16.91.118'],
};

export default nextConfig;
