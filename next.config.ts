import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/** Image hosts: the API media host(s) plus anything in NEXT_PUBLIC_MEDIA_HOST (comma-separated URLs or hosts). */
function mediaPatterns(): RemotePattern[] {
  const hosts = [
    "http://localhost:8080",
    "https://service.okulumyeryuzu.com",
    // DigitalOcean Spaces (API Storage:Spaces): the CDN and the bucket's origin endpoint.
    "https://okulumyeryuzu.fra1.cdn.digitaloceanspaces.com",
    "https://okulumyeryuzu.fra1.digitaloceanspaces.com",
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
  // No page may be framed except the visual editor preview, whose frame-ancestors header is set
  // per request from PANEL_ORIGINS (runtime) in proxy.ts.
  async headers() {
    return [
      {
        source: "/:path((?!onizleme/).*)",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
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
