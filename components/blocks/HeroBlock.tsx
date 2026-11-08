import type { BlockEdit } from "@/lib/edit";
import { cx, paddingClasses } from "@/lib/style";
import { Contours } from "../Contours";
import { MediaImage } from "../MediaImage";
import { SmartLink } from "../SmartLink";
import { resolveBand } from "./PageHeaderBlock";
import { anchorId, SECTION_PADDING, type BlockComponentProps } from "./Section";

type HeroProps = BlockComponentProps<"hero">["props"];

/** Split hero leaves room at the bottom for the wave. */
const SPLIT_PADDING = { top: "pt-14 md:pt-20", bottom: "pb-28 lg:pb-36" };

function Buttons({ p, edit, className = "" }: { p: HeroProps; edit: BlockEdit; className?: string }) {
  const buttons = [
    { text: p.primaryText, href: p.primaryHref, path: "primaryText", className: "btn btn-primary" },
    { text: p.secondaryText, href: p.secondaryHref, path: "secondaryText", className: "btn btn-ghost text-heading" },
  ].filter((b) => b.text && b.href);
  if (buttons.length === 0) return null;
  return (
    <div className={`block-actions mt-9 flex flex-wrap gap-3 ${className}`}>
      {buttons.map((b) => (
        <SmartLink key={b.path} href={b.href} className={b.className} {...edit.text(b.path)}>
          {b.text}
        </SmartLink>
      ))}
    </div>
  );
}

function Eyebrow({ text, edit }: { text: string; edit: BlockEdit }) {
  if (!text) return null;
  return (
    <p className="block-eyebrow mb-5 text-sm font-bold uppercase tracking-[0.14em] text-eyebrow" {...edit.text("eyebrow")}>
      {text}
    </p>
  );
}

/** Hero: `split` (text + organic image, the classic home hero), `cover` (image behind a dark overlay), `centered` (no image). */
export function HeroBlock({ props: p, style, primary, edit }: BlockComponentProps<"hero">) {
  const Heading = primary ? "h1" : "h2";
  const id = anchorId(p.anchor);
  const title = (
    <Heading className="block-title text-[2.6rem] leading-[1.02] text-heading sm:text-6xl lg:text-7xl" {...edit.text("title")}>
      {p.title}
    </Heading>
  );
  const subtitle = (className = "") =>
    p.subtitle && (
      <p className={`block-text mt-6 max-w-xl whitespace-pre-line text-lg text-muted md:text-xl ${className}`} {...edit.textarea("subtitle")}>
        {p.subtitle}
      </p>
    );

  if (p.layout === "cover") {
    const band = resolveBand(style, { className: "bg-forest-deep", dark: true });
    // The image sits under a dark overlay, so the text stays light whatever the background.
    return (
      <section id={id} className={cx("relative isolate overflow-hidden", band.className, p.image && !band.dark && "tone-dark")} style={band.style}>
        {p.image ? (
          <div className="absolute inset-0 -z-10">
            <MediaImage src={p.image} alt="" sizes="100vw" priority={primary} />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/95 via-forest-deep/65 to-forest-deep/35" />
          </div>
        ) : (
          <Contours className={`pointer-events-none absolute inset-0 -z-10 h-full w-full ${band.contours}`} cx={880} cy={260} rings={12} />
        )}
        <div className={cx("container-page flex min-h-[min(80vh,44rem)] items-end", paddingClasses(style, SECTION_PADDING))}>
          <div className="max-w-3xl">
            <Eyebrow text={p.eyebrow} edit={edit} />
            {title}
            {subtitle()}
            <Buttons p={p} edit={edit} />
          </div>
        </div>
      </section>
    );
  }

  const band = resolveBand(style);

  if (p.layout === "centered") {
    return (
      <section id={id} className={cx("relative overflow-hidden", band.className)} style={band.style}>
        <Contours className={`pointer-events-none absolute inset-0 h-full w-full ${band.contours}`} cx={600} cy={300} rings={12} />
        <div className={cx("container-page relative text-center", paddingClasses(style, SECTION_PADDING))}>
          <div className="mx-auto max-w-4xl py-6 md:py-10">
            <Eyebrow text={p.eyebrow} edit={edit} />
            {title}
            {subtitle("mx-auto")}
            <Buttons p={p} edit={edit} className="justify-center" />
          </div>
        </div>
      </section>
    );
  }

  // split: the wave at the bottom blends into the page colour below.
  return (
    <section id={id} className={cx("relative overflow-hidden", band.className)} style={band.style}>
      <Contours className={`pointer-events-none absolute inset-0 h-full w-full ${band.contours}`} cx={880} cy={260} rings={12} />
      <div className={cx("container-page relative grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]", paddingClasses(style, SPLIT_PADDING))}>
        <div>
          <Eyebrow text={p.eyebrow} edit={edit} />
          {title}
          {subtitle()}
          <Buttons p={p} edit={edit} />
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[58%_42%_55%_45%/48%_55%_45%_52%] lg:max-w-none">
          <MediaImage
            src={p.image}
            alt={p.image ? p.title : ""}
            sizes="(min-width: 1024px) 36rem, 90vw"
            illustration="tree"
            priority={primary}
          />
        </div>
      </div>
      <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full text-sand md:h-20">
        <path fill="currentColor" d="M0 48c160-36 320-44 520-20s380 40 560 12 260-30 360-18V80H0z" />
      </svg>
    </section>
  );
}
