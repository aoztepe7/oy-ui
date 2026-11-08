import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/blocks/Blocks";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PreviewBridge } from "@/components/PreviewBridge";
import { getPreview } from "@/lib/api";
import { panelOrigins } from "@/lib/panel";
import "./preview.css";

// Visual editor preview (docs/VISUAL_EDITOR.md §3): the panel's unsaved state, rendered with the
// live site's components inside the panel's iframe. Always rendered on request, never cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Önizleme",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({ params }: PageProps<"/onizleme/[token]">) {
  const { token } = await params;
  const preview = await getPreview(token);
  if (!preview) notFound();
  const { page, site } = preview;

  return (
    <>
      <Header site={site} preview />
      <main id="icerik" className="flex-1">
        <Blocks blocks={page.blocks} pageTitle={page.title} site={site} preview />
      </main>
      <Footer site={site} preview />
      <PreviewBridge origins={panelOrigins()} />
    </>
  );
}
