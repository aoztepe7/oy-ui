import { resolveEmbed } from "@/lib/embed";
import { BlockHeading, Section, type BlockComponentProps } from "./Section";

/** YouTube (nocookie) / Vimeo video or Google Maps embed. Unknown URLs render nothing. */
export function EmbedBlock({ props: p, style, primary, edit }: BlockComponentProps<"embed">) {
  const embed = resolveEmbed(p.url);
  if (!embed) return null;
  const video = embed.kind === "video";
  return (
    <Section style={style} anchor={p.anchor}>
      <div className="mx-auto max-w-4xl">
        <BlockHeading title={p.title} as={primary ? "h1" : "h2"} edit={edit} />
        <figure>
          <div className={`relative overflow-hidden rounded-panel bg-forest-deep ${video ? "aspect-video" : "aspect-[4/3] md:aspect-[16/9]"}`}>
            <iframe
              src={embed.src}
              title={p.title || p.caption || (video ? "Video" : "Harita")}
              loading="lazy"
              allowFullScreen
              referrerPolicy={video ? "strict-origin-when-cross-origin" : "no-referrer-when-downgrade"}
              allow={video ? "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" : undefined}
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          {p.caption && (
            <figcaption className="block-text mt-3 text-center text-sm text-muted" {...edit.text("caption")}>
              {p.caption}
            </figcaption>
          )}
        </figure>
      </div>
    </Section>
  );
}
