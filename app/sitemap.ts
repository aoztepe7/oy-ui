import type { MetadataRoute } from "next";
import { getPages, getPrograms } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, programs] = await Promise.all([getPages(), getPrograms()]);
  return [
    ...pages.map((p) => ({
      url: `${SITE_URL}${p.path === "/" ? "" : p.path}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: p.path === "/" ? 1 : 0.7,
    })),
    ...programs.map((p) => ({
      url: `${SITE_URL}/programlar/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/gizlilik`, changeFrequency: "yearly" as const, priority: 0.2 },
    { url: `${SITE_URL}/hesap-silme`, changeFrequency: "yearly" as const, priority: 0.1 },
  ];
}
