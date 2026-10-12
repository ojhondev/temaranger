import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Em dev, a demonstração roda em demo.localhost e a Central em ajuda.localhost.
  allowedDevOrigins: ["demo.localhost", "ajuda.localhost", "*.localhost"],
};

export default nextConfig;
