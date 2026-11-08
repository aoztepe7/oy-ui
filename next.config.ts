import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import { panelOrigins } from "./lib/panel";

/** Image hosts: the API media host(s) plus anything in NEXT_PUBLIC_MEDIA_HOST (comma-separated URLs or hosts). */
function mediaPatterns(): RemotePattern[] {
  const hosts = [
    "http://localhost:8080",
    "https://service.okulumyeryuzu.com",
    ...(process.env.NEXT_PUBLIC_MEDIA_HOST ?? "").split(","),
  ];
  const patterns = new Map<string, RemotePattern>();
  for (const raw of hosts.map((h) => h.trim()).filter(Boolean)) {
    try {
      const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
      patterns.set(url.origin, {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/**",
      });
    } catch {
      console.warn(`[next.config] ignoring invalid media host "${raw}"`);
    }
  }
  return [...patterns.values()];
}

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Only the visual editor preview may be framed, and only by the panel (PANEL_ORIGINS, read at build time).
  async headers() {
    return [
      {
        source: "/:path((?!onizleme/).*)",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/onizleme/:path*",
        headers: [{ key: "Content-Security-Policy", value: ["frame-ancestors 'self'", ...panelOrigins()].join(" ") }],
      },
    ];
  },
  images: {
    remotePatterns: mediaPatterns(),
    formats: ["image/avif", "image/webp"],
    // The local API (localhost:8080) resolves to a private IP; allow it in development only.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
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
