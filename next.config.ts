import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/concentric-rectangle",
  images: { unoptimized: true },
};

export default nextConfig;
