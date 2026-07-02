import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const url = new URL(
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
);

const nextConfig: NextConfig = {
  // Self-contained server bundle for containerized deploys.
  output: "standalone",
  // Pin the workspace root — other lockfiles exist higher up the tree.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  images: {
    qualities: [50, 75, 90],
    remotePatterns: [
      {
        protocol: url.protocol.replace(":", "") as "https" | "http",
        hostname: url.hostname,
      },
      { protocol: "https", hostname: "itsoch.com" },
    ],
  },
};

export default nextConfig;
