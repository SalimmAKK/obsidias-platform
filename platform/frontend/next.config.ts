import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // "standalone" output is for self-hosting (Docker, the Dockerfile in this
  // folder). Vercel has its own serverless build target and doesn't need
  // it — leaving it on has been known to produce 404 NOT_FOUND on Vercel
  // because the build artifacts land somewhere its router doesn't expect.
  turbopack: {
    root: path.join(__dirname),
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
