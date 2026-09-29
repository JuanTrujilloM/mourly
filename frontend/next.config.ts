import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit so the minified bundle never ships readable sources to browsers.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
