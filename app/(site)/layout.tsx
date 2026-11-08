import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSite } from "@/lib/api";

/** Public pages: published header and footer. (The visual editor preview renders its own.) */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const site = await getSite();
  return (
    <>
      <Header site={site} />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer site={site} />
    </>
  );
}
