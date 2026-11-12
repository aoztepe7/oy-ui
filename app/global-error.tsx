"use client";

import "./globals.css";

/**
 * The site's header / footer (site settings) could not be loaded and the page has never rendered successfully.
 * Replaces the root layout, so it brings its own document. No placeholder content.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="tr">
      <body className="flex min-h-dvh flex-col items-start justify-center bg-paper px-6 py-24 sm:px-16">
        <title>Okulum Yeryüzü</title>
        <p className="font-serif text-2xl text-moss">Okulum Yeryüzü</p>
        <h1 className="mt-4 text-4xl text-forest md:text-5xl">Sayfa şu an yüklenemedi</h1>
        <p className="mt-4 max-w-lg text-lg text-bark">Kısa süreli bir bağlantı sorunu yaşıyoruz. Lütfen birkaç saniye sonra tekrar deneyin.</p>
        <button type="button" onClick={() => retry()} className="btn btn-forest mt-8">
          Tekrar dene
        </button>
      </body>
    </html>
  );
}
