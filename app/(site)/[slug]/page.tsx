import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";
import { getPages } from "@/lib/api";

/** Slugs served by their own route folder (static segments win over [slug]). */
const OWN_ROUTES = new Set(["home", "programlar"]);

/** Pages published after the build are rendered on first request, then cached. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await getPages();
  return pages.filter((p) => !OWN_ROUTES.has(p.slug)).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "home") return {};
  return cmsPageMetadata(slug);
}

export default async function Page({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  // The front page lives at "/", not "/home".
  if (slug === "home") notFound();
  return <CmsPage slug={slug} />;
}
