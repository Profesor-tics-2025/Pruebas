import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress punycode deprecation warning
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, punycode: false };
    return config;
  },
};

export default nextConfig;
