import type { Metadata } from "next";

export const SITE_URL = (process.env.SITE_URL || "https://okulumyeryuzu.com").replace(/\/$/, "");

/** Per-page metadata with canonical URL and OpenGraph. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const images = opts.image ? [{ url: opts.image }] : undefined;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: { title: opts.title, description: opts.description, url: opts.path, images },
  };
}
