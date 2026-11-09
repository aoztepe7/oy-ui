import { accent } from "../Accent";
import { Contours } from "../Contours";
import { SmartLink } from "../SmartLink";
import { Section, type BlockComponentProps } from "./Section";

/** Call to action: a full-width band on a forest background, otherwise a large forest panel with a glow. */
export function CtaBlock({ props: p, style, primary, edit }: BlockComponentProps<"cta">) {
  const Heading = primary ? "h1" : "h2";
  const band = style.background === "forest";
  const titleAttrs = edit.text("title");
  const content = (
    <div className="relative mx-auto max-w-3xl text-center">
      <span aria-hidden="true" className="mx-auto mb-8 block h-14 w-14 animate-float">
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <path d="M14 50C13 29 25 14 52 11c2 25-12 40-38 39z" fill="var(--color-ochre)" />
          <path d="M14 50c11-12 20-21 30-31" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
      </span>
      {p.title && (
        <Heading className="block-title text-[clamp(2.4rem,5.2vw,4.4rem)] text-heading" {...titleAttrs}>
          {accent(p.title, titleAttrs)}
        </Heading>
      )}
      {p.text && (
        <p className="block-text mx-auto mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted md:text-xl" {...edit.textarea("text")}>
          {p.text}
        </p>
      )}
      {p.buttonText && p.buttonHref && (
        <div className="block-actions mt-10 flex justify-center">
          <SmartLink href={p.buttonHref} className="btn btn-primary px-8 text-base" {...edit.text("buttonText")}>
            {p.buttonText}
          </SmartLink>
        </div>
      )}
    </div>
  );

  return (
    <Section style={style} anchor={p.anchor}>
      {band ? (
        <div className="py-6 md:py-10">{content}</div>
      ) : (
        <div className="tone-dark relative isolate overflow-hidden rounded-panel bg-forest px-6 py-20 shadow-(--shadow-lift) md:px-16 md:py-28">
          <Contours className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-moss/60" cx={1100} cy={80} seed={7} />
          <div aria-hidden="true" className="absolute -left-24 -bottom-32 -z-10 h-96 w-96 rounded-full bg-ochre/25 blur-[100px]" />
          <div aria-hidden="true" className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-sage/25 blur-[100px]" />
          {content}
        </div>
      )}
    </Section>
  );
}
