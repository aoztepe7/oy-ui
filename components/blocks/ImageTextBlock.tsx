import { Markdown } from "../Markdown";
import { MediaImage } from "../MediaImage";
import { SmartLink } from "../SmartLink";
import { Section, type BlockComponentProps } from "./Section";

export function ImageTextBlock({ props: p, style, primary, edit }: BlockComponentProps<"imageText">) {
  const Heading = primary ? "h1" : "h2";
  return (
    <Section style={style} anchor={p.anchor}>
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className={`relative aspect-[5/4] overflow-hidden rounded-panel ${p.imagePosition === "left" ? "" : "md:order-2"}`}>
          <MediaImage src={p.image} alt={p.image ? p.title : ""} sizes="(min-width: 768px) 36rem, 100vw" illustration="leaf" />
        </div>
        <div className="max-w-xl">
          {p.eyebrow && (
            <p className="block-eyebrow mb-3 text-sm font-bold uppercase tracking-[0.14em] text-eyebrow" {...edit.text("eyebrow")}>
              {p.eyebrow}
            </p>
          )}
          {p.title && (
            <Heading className="block-title text-4xl text-heading md:text-5xl" {...edit.text("title")}>
              {p.title}
            </Heading>
          )}
          <Markdown
            text={p.body}
            headingLevel={p.title || primary ? 3 : 2}
            className={`block-text ${p.title ? "mt-6" : ""} text-lg text-muted`}
            attrs={edit.markdown("body")}
          />
          {p.buttonText && p.buttonHref && (
            <SmartLink href={p.buttonHref} className="link mt-7 inline-block" {...edit.text("buttonText")}>
              {p.buttonText}
            </SmartLink>
          )}
        </div>
      </div>
    </Section>
  );
}
