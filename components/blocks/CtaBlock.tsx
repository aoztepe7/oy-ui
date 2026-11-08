import { Contours } from "../Contours";
import { SmartLink } from "../SmartLink";
import { Section, type BlockComponentProps } from "./Section";

/** Call to action: a full-width forest band on a forest background, otherwise the signature ochre panel. */
export function CtaBlock({ props: p, style, primary, edit }: BlockComponentProps<"cta">) {
  const Heading = primary ? "h1" : "h2";
  const band = style.background === "forest";
  const content = (
    <div className="relative max-w-2xl">
      {p.title && (
        <Heading className={`block-title text-4xl md:text-5xl ${band ? "text-heading" : ""}`} {...edit.text("title")}>
          {p.title}
        </Heading>
      )}
      {p.text && (
        <p className={`block-text mt-4 whitespace-pre-line text-lg ${band ? "text-muted" : ""}`} {...edit.textarea("text")}>
          {p.text}
        </p>
      )}
      {p.buttonText && p.buttonHref && (
        <div className="block-actions mt-8 flex">
          <SmartLink href={p.buttonHref} className={`btn ${band ? "btn-primary" : "btn-forest"}`} {...edit.text("buttonText")}>
            {p.buttonText}
          </SmartLink>
        </div>
      )}
    </div>
  );

  return (
    <Section style={style} anchor={p.anchor}>
      {band ? (
        content
      ) : (
        <div className="tone-light relative overflow-hidden rounded-panel bg-ochre px-6 py-14 text-forest-deep md:px-14 md:py-20">
          <Contours className="pointer-events-none absolute inset-0 h-full w-full text-forest-deep/20" cx={1100} cy={80} seed={7} />
          {content}
        </div>
      )}
    </Section>
  );
}
