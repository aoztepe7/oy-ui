"use client";

import { Contours } from "@/components/Contours";

/**
 * A page that has never rendered successfully while the API is unreachable (cached pages keep showing their last
 * good version instead). No placeholder content: ask the visitor to try again.
 */
export default function SiteError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <Contours className="pointer-events-none absolute inset-0 h-full w-full text-sage" seed={5} />
      <div className="container-page relative flex min-h-[60vh] flex-col items-start justify-center py-24">
        <h1 className="text-4xl text-forest md:text-5xl">Sayfa şu an yüklenemedi</h1>
        <p className="mt-4 max-w-lg text-lg text-bark">Kısa süreli bir bağlantı sorunu yaşıyoruz. Lütfen birkaç saniye sonra tekrar deneyin.</p>
        <button type="button" onClick={() => retry()} className="btn btn-forest mt-8">
          Tekrar dene
        </button>
      </div>
    </section>
  );
}
