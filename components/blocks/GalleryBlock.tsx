import { MediaImage } from "../MediaImage";
import { BlockHeading, Section, type BlockComponentProps } from "./Section";

const COLUMNS = {
  "2": { grid: "sm:grid-cols-2", sizes: "(min-width: 640px) 36rem, 100vw" },
  "3": { grid: "sm:grid-cols-2 lg:grid-cols-3", sizes: "(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw" },
  "4": { grid: "grid-cols-2 lg:grid-cols-4", sizes: "(min-width: 1024px) 18rem, 50vw" },
} as const;

export function GalleryBlock({ props: p, style, primary, edit }: BlockComponentProps<"gallery">) {
  const images = (p.images ?? []).map((img, index) => ({ ...img, index })).filter((img) => img.image);
  if (images.length === 0) return null;
  const columns = COLUMNS[p.columns] ?? COLUMNS["3"];
  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} as={primary ? "h1" : "h2"} edit={edit} />
      <ul className={`grid gap-4 md:gap-6 ${columns.grid}`}>
        {images.map((img) => (
          <li key={img.index}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-sage-soft">
                <MediaImage src={img.image} alt={img.caption} sizes={columns.sizes} />
              </div>
              {img.caption && (
                <figcaption className="mt-2 text-sm text-muted" {...edit.text(`images.${img.index}.caption`)}>
                  {img.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
