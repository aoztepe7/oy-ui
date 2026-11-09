import Image from "next/image";
import { readFrame } from "@/lib/imageFrame";
import { GalleryLightbox } from "../GalleryLightbox";
import { BlockHeading, Section, type BlockComponentProps } from "./Section";

/** Masonry columns: photos keep their own proportions (never cropped). */
const COLUMNS = {
  "2": { cols: "sm:columns-2", sizes: "(min-width: 640px) 36rem, 100vw" },
  "3": { cols: "sm:columns-2 lg:columns-3", sizes: "(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw" },
  "4": { cols: "columns-2 lg:columns-4", sizes: "(min-width: 1024px) 18rem, 50vw" },
} as const;

export function GalleryBlock({ props: p, style, primary, edit }: BlockComponentProps<"gallery">) {
  const images = (p.images ?? [])
    .map((img, index) => ({ ...img, index, src: readFrame(img.image).src }))
    .filter((img) => img.image);
  if (images.length === 0) return null;
  const columns = COLUMNS[p.columns] ?? COLUMNS["3"];
  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} as={primary ? "h1" : "h2"} edit={edit} />
      <GalleryLightbox images={images.map((img) => ({ src: img.src, caption: img.caption }))}>
        <ul className={`gap-4 md:gap-5 ${columns.cols}`}>
          {images.map((img, i) => (
            <li key={img.index} className="mb-4 break-inside-avoid md:mb-5">
              <figure>
                <button
                  type="button"
                  data-lightbox={i}
                  aria-label={img.caption ? `${img.caption} — büyüt` : "Fotoğrafı büyüt"}
                  className="zoom-img group relative block w-full cursor-zoom-in overflow-hidden rounded-[1.5rem] bg-sage-soft shadow-(--shadow-soft)"
                >
                  <Image src={img.src} alt={img.caption} width={1200} height={900} sizes={columns.sizes} className="h-auto w-full" />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 grid place-items-center bg-forest-deep/0 text-3xl text-paper opacity-0 transition duration-500 group-hover:bg-forest-deep/30 group-hover:opacity-100"
                  >
                    ⤢
                  </span>
                </button>
                {img.caption && (
                  <figcaption className="mt-2 px-1 text-sm text-muted" {...edit.text(`images.${img.index}.caption`)}>
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </GalleryLightbox>
    </Section>
  );
}
