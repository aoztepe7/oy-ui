import type { Metadata } from "next";
import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

// CMS page "programlar". It needs this file because the programlar/ folder (program
// detail pages) would otherwise shadow app/[slug] for /programlar.
// Filters (?tur=…&yas=…) are applied in the browser, so the page stays static.

export function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata("programlar");
}

export default function ProgramsPage() {
  return <CmsPage slug="programlar" />;
}
