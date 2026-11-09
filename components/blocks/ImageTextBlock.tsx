import { accent, plain } from "../Accent";
import { Markdown } from "../Markdown";
import { MediaImage } from "../MediaImage";
import { SmartLink } from "../SmartLink";
import { Section, type BlockComponentProps } from "./Section";

export function ImageTextBlock({ props: p, style, primary, edit }: BlockComponentProps<"imageText">) {
  const Heading = primary ? "h1" : "h2";
  const left = p.imagePosition === "left";
  const titleAttrs = edit.text("title");
  return (
    <Section style={style} anchor={p.anchor}>
      <div className="grid items-center gap-14 md:grid-cols-[1fr_1.05fr] md:gap-20">
        <div className={`relative ${left ? "" : "md:order-2"}`}>
          {/* Offset ochre frame behind the photo. */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 rounded-[2.75rem] bg-ochre/80 ${left ? "-translate-x-4 translate-y-4 -rotate-3" : "translate-x-4 translate-y-4 rotate-3"}`}
          />
          <div className="zoom-img relative aspect-[4/5] overflow-hidden rounded-[2.75rem] shadow-(--shadow-lift)">
            <MediaImage src={p.image} alt={p.image ? plain(p.title) : ""} sizes="(min-width: 768px) 36rem, 100vw" illustration="leaf" />
          </div>
        </div>
        <div className="max-w-xl">
          {p.eyebrow && (
            <p className="block-eyebrow eyebrow mb-5" {...edit.text("eyebrow")}>
              {p.eyebrow}
            </p>
          )}
          {p.title && (
            <Heading className="block-title text-[clamp(2.3rem,4.6vw,3.9rem)] text-heading" {...titleAttrs}>
              {accent(p.title, titleAttrs)}
            </Heading>
          )}
          <Markdown
            text={p.body}
            headingLevel={p.title || primary ? 3 : 2}
            className={`block-text ${p.title ? "mt-7" : ""} text-lg leading-relaxed text-muted`}
            attrs={edit.markdown("body")}
          />
          {p.buttonText && p.buttonHref && (
            <SmartLink href={p.buttonHref} className="link mt-9" {...edit.text("buttonText")}>
              {p.buttonText}
            </SmartLink>
          )}
        </div>
      </div>
    </Section>
  );
}
