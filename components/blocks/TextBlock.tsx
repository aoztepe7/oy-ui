import { Markdown } from "../Markdown";
import { Section, type BlockComponentProps } from "./Section";

export function TextBlock({ props: p, style, primary, edit }: BlockComponentProps<"text">) {
  const Heading = primary ? "h1" : "h2";
  // The block's own align prop applies until the style sets one.
  const align = style.align || p.align;
  const center = align === "center";
  const width = p.width === "wide" ? "" : "max-w-3xl";
  const position = center ? "mx-auto text-center" : align === "right" ? "ml-auto" : "";
  return (
    <Section style={style} anchor={p.anchor}>
      <div className={`${width} ${position}`}>
        {p.title && (
          <Heading className="block-title text-4xl text-heading md:text-5xl" {...edit.text("title")}>
            {p.title}
          </Heading>
        )}
        <Markdown
          text={p.body}
          headingLevel={p.title || primary ? 3 : 2}
          className={`block-text ${p.title ? "mt-6" : ""} text-lg text-muted ${center ? "[&_:is(ul,ol)]:inline-block [&_:is(ul,ol)]:text-left" : ""}`}
          attrs={edit.markdown("body")}
        />
      </div>
    </Section>
  );
}
