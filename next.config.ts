import type { NextConfig } from "next";

/**
 * A GitHub Pages build is a static export served from a repository subpath, so
 * it needs `basePath` and unoptimized images. Every other target — local dev,
 * CI, a Node host, Vercel — uses the framework defaults.
 */
const staticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = staticExport
  ? {
      output: "export",
      trailingSlash: true,
      basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
