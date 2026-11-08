import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getSite } from "@/lib/api";
import { pageMetadata } from "@/lib/site";
import type { Block } from "@/lib/types";
import { Blocks } from "./blocks/Blocks";

/** First image of the page's visual blocks, used as the social sharing image. */
function shareImage(blocks: Block[]): string | undefined {
  for (const block of blocks) {
    if ((block.type === "hero" || block.type === "imageText" || block.type === "contact") && block.props.image) {
      return block.props.image;
    }
    if (block.type === "gallery" && block.props.images?.[0]?.image) return block.props.images[0].image;
  }
  return undefined;
}

/** Metadata for a CMS page: seoTitle/seoDescription (falling back to title / tagline), canonical URL, OpenGraph. */
export async function cmsPageMetadata(slug: string): Promise<Metadata> {
  const [page, site] = await Promise.all([getPage(slug), getSite()]);
  if (!page) return { title: "Sayfa bulunamadı", robots: { index: false } };

  const isHome = slug === "home";
  // The front page leads with the brand unless the editor wrote a dedicated SEO title.
  const customSeoTitle = page.seoTitle && page.seoTitle !== page.title;
  const title = isHome && !customSeoTitle ? `${site.siteName} — ${site.tagline}` : page.seoTitle || page.title;
  const metadata = pageMetadata({
    title,
    description: page.seoDescription || site.tagline,
    path: page.path,
    image: shareImage(page.blocks),
  });
  if (isHome) metadata.title = { absolute: title };
  return metadata;
}

/** Renders a published CMS page by slug; 404 when it does not exist. */
export async function CmsPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();
  return <Blocks blocks={page.blocks} pageTitle={page.title} />;
}
