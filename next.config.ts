import type { NextConfig } from "next";

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  process.env.BACKEND_URL ||
  "";

const resolvedApiUrl = rawApiUrl
  ? rawApiUrl.endsWith("/api")
    ? rawApiUrl.replace(/\/+$/, "")
    : `${rawApiUrl.replace(/\/+$/, "")}/api`
  : "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: resolvedApiUrl || process.env.NEXT_PUBLIC_API_URL || "",
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
