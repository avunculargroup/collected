import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  outputFileTracingIncludes: {
    "/*": ["./drizzle/migrations/**/*"],
  },
};

export default nextConfig;
