"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export interface LightboxImage {
  src: string;
  caption: string;
}

/**
 * Full-screen viewer for a server-rendered gallery: any descendant button with `data-lightbox`
 * (its index) opens the image. Arrow keys / swipe-free buttons navigate, Escape closes.
 */
export function GalleryLightbox({ images, children }: { images: LightboxImage[]; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = index !== null;
  const go = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)), [images.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const current = index === null ? null : images[index];

  return (
    <div
      onClick={(e) => {
        const trigger = (e.target as HTMLElement).closest<HTMLElement>("[data-lightbox]");
        if (trigger) setIndex(Number(trigger.dataset.lightbox));
      }}
    >
      {children}
      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && setIndex(null)}
        aria-label="Fotoğraf görüntüleyici"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-forest-deep/95 p-0 text-paper backdrop:bg-transparent"
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 py-4 text-sm font-bold text-paper/80">
              <span>
                {index! + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setIndex(null)}
                className="grid h-11 w-11 place-items-center rounded-full bg-paper/10 text-xl transition hover:bg-paper/20"
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>
            <div className="relative mx-4 flex-1 md:mx-20" onClick={(e) => e.target === e.currentTarget && setIndex(null)}>
              <Image key={current.src} src={current.src} alt={current.caption} fill sizes="100vw" className="animate-rise object-contain" />
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-5">
              <button type="button" onClick={() => go(-1)} className="grid h-12 w-12 place-items-center rounded-full bg-paper/10 text-xl hover:bg-paper/20" aria-label="Önceki">
                ←
              </button>
              <p className="text-center text-paper/85">{current.caption}</p>
              <button type="button" onClick={() => go(1)} className="grid h-12 w-12 place-items-center rounded-full bg-paper/10 text-xl hover:bg-paper/20" aria-label="Sonraki">
                →
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
