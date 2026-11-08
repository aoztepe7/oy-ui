import type { Metadata } from "next";
import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";
import { JsonLd } from "@/components/JsonLd";
import { getSite } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

export function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata("home");
}

export default async function HomePage() {
  const site = await getSite();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: site.siteName,
          description: site.tagline,
          url: SITE_URL,
          logo: `${SITE_URL}/icon.svg`,
          email: site.email || undefined,
          telephone: site.phone || undefined,
          address: site.address ? { "@type": "PostalAddress", streetAddress: site.address, addressCountry: "TR" } : undefined,
          sameAs: [site.instagramUrl, site.youtubeUrl].filter(Boolean),
        }}
      />
      <CmsPage slug="home" />
    </>
  );
}
