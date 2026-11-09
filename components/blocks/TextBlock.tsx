import { accent } from "../Accent";
import { Markdown } from "../Markdown";
import { Section, type BlockComponentProps } from "./Section";

/**
 * Title + rich text. Wide texts with a title use an editorial two-column layout
 * (sticky title on the left); narrow texts stay a single readable column.
 */
export function TextBlock({ props: p, style, primary, edit }: BlockComponentProps<"text">) {
  const Heading = primary ? "h1" : "h2";
  // The block's own align prop applies until the style sets one.
  const align = style.align || p.align;
  const center = align === "center";
  const titleAttrs = edit.text("title");
  const body = (className: string) => (
    <Markdown
      text={p.body}
      headingLevel={p.title || primary ? 3 : 2}
      className={`block-text text-lg leading-relaxed text-muted ${className} ${center ? "[&_:is(ul,ol)]:inline-block [&_:is(ul,ol)]:text-left" : ""}`}
      attrs={edit.markdown("body")}
    />
  );

  if (!center && p.title && p.width !== "wide") {
    return (
      <Section style={style} anchor={p.anchor}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <span aria-hidden="true" className="mb-6 block h-1 w-14 rounded-full bg-ochre" />
            <Heading className="block-title text-[clamp(2.2rem,4vw,3.4rem)] text-heading" {...titleAttrs}>
              {accent(p.title, titleAttrs)}
            </Heading>
          </div>
          {body("max-w-[68ch] md:text-[1.15rem]")}
        </div>
      </Section>
    );
  }

  const width = p.width === "wide" ? "" : "max-w-3xl";
  const position = center ? "mx-auto text-center" : align === "right" ? "ml-auto" : "";
  return (
    <Section style={style} anchor={p.anchor}>
      <div className={`${width} ${position}`}>
        {p.title && (
          <Heading className="block-title text-[clamp(2.2rem,4vw,3.4rem)] text-heading" {...titleAttrs}>
            {accent(p.title, titleAttrs)}
          </Heading>
        )}
        {body(p.title ? "mt-7" : "")}
      </div>
    </Section>
  );
}
