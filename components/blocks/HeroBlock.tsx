import type { BlockEdit } from "@/lib/edit";
import { cx, paddingClasses } from "@/lib/style";
import { accent, plain } from "../Accent";
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
    <div className={`block-actions mt-10 flex flex-wrap gap-3 animate-rise [animation-delay:450ms] ${className}`}>
      {buttons.map((b) => (
        <SmartLink key={b.path} href={b.href} className={b.className} {...edit.text(b.path)}>
          {b.text}
        </SmartLink>
      ))}
    </div>
  );
}

function Eyebrow({ text, edit, glass = false }: { text: string; edit: BlockEdit; glass?: boolean }) {
  if (!text) return null;
  return (
    <p
      className={cx(
        "block-eyebrow mb-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[0.78rem] font-extrabold uppercase tracking-[0.2em] text-eyebrow animate-rise",
        glass ? "bg-paper/10 ring-1 ring-paper/25 backdrop-blur-md" : "bg-forest/[0.06] ring-1 ring-forest/10",
      )}
      {...edit.text("eyebrow")}
    >
      <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-ochre" />
      {text}
    </p>
  );
}

/** Rotating circular text badge used on the split hero. */
function Seal({ text }: { text: string }) {
  const label = `${text} · Doğada büyüyen çocuklar ·`.toLocaleUpperCase("tr");
  return (
    <div
      aria-hidden="true"
      className="absolute -bottom-6 -left-4 h-32 w-32 rounded-full bg-ochre p-1 text-forest-deep shadow-(--shadow-lift) md:-left-10 md:h-40 md:w-40"
    >
      <svg viewBox="0 0 200 200" className="h-full w-full animate-spin-slow">
        <defs>
          <path id="seal-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        {/* textLength = circumference (2π·74 ≈ 465): the label fills the circle exactly, so the end never overlaps the start. */}
        <text className="fill-current font-sans text-[14px] font-extrabold">
          <textPath href="#seal-circle" textLength="462" lengthAdjust="spacing">
            {label}
          </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 64 64" className="absolute inset-0 m-auto h-10 w-10 md:h-12 md:w-12">
        <path d="M14 50C13 29 25 14 52 11c2 25-12 40-38 39z" fill="var(--color-forest-deep)" />
        <path d="M14 50c11-12 20-21 30-31" stroke="var(--color-ochre)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

/** Hero: `split` (text + arched photo), `cover` (full-bleed cinematic image), `centered` (no image). */
export function HeroBlock({ props: p, style, primary, edit }: BlockComponentProps<"hero">) {
  const Heading = primary ? "h1" : "h2";
  const id = anchorId(p.anchor);
  const titleAttrs = edit.text("title");
  const title = (size: string) => (
    <Heading className={cx("block-title text-heading animate-rise [animation-delay:120ms]", size)} {...titleAttrs}>
      {accent(p.title, titleAttrs)}
    </Heading>
  );
  const subtitle = (className = "") =>
    p.subtitle && (
      <p
        className={`block-text mt-7 max-w-xl whitespace-pre-line text-lg leading-relaxed text-muted animate-rise [animation-delay:300ms] md:text-xl ${className}`}
        {...edit.textarea("subtitle")}
      >
        {p.subtitle}
      </p>
    );

  if (p.layout === "cover") {
    const band = resolveBand(style, { className: "bg-forest-deep", dark: true });
    // The image sits under a dark overlay, so the text stays light whatever the background.
    return (
      <section id={id} className={cx("relative isolate overflow-hidden", band.className, p.image && !band.dark && "tone-dark")} style={band.style}>
        {p.image ? (
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 animate-kenburns">
              <MediaImage src={p.image} alt="" sizes="100vw" priority={primary} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/55 to-forest-deep/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/70 via-transparent to-transparent" />
          </div>
        ) : (
          <Contours className={`pointer-events-none absolute inset-0 -z-10 h-full w-full ${band.contours}`} cx={880} cy={260} rings={12} />
        )}
        <div
          className={cx(
            "container-page flex min-h-[min(92svh,58rem)] flex-col justify-end",
            paddingClasses(style, { top: "pt-28", bottom: "pb-16 md:pb-24" }),
          )}
        >
          <div className="max-w-4xl">
            <Eyebrow text={p.eyebrow} edit={edit} glass />
            {title("text-[clamp(2.9rem,7.4vw,6.6rem)]")}
            {subtitle()}
            <Buttons p={p} edit={edit} />
          </div>
          <div aria-hidden="true" className="mt-14 hidden items-center gap-4 text-xs font-extrabold uppercase tracking-[0.25em] text-muted md:flex">
            <span className="relative h-12 w-px overflow-hidden bg-current/30">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-float bg-ochre" />
            </span>
            Keşfetmek için kaydırın
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
          <div className="mx-auto max-w-5xl py-10 md:py-16">
            <Eyebrow text={p.eyebrow} edit={edit} glass={band.dark} />
            {title("text-[clamp(2.8rem,7vw,6.2rem)]")}
            {subtitle("mx-auto")}
            <Buttons p={p} edit={edit} className="justify-center" />
          </div>
        </div>
      </section>
    );
  }

  // split: text + arched photo with a rotating seal; the wave at the bottom blends into the page colour below.
  return (
    <section id={id} className={cx("relative overflow-hidden", band.className)} style={band.style}>
      <Contours className={`pointer-events-none absolute inset-0 h-full w-full ${band.contours}`} cx={880} cy={260} rings={12} />
      <div className={cx("container-page relative grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]", paddingClasses(style, SPLIT_PADDING))}>
        <div>
          <Eyebrow text={p.eyebrow} edit={edit} glass={band.dark} />
          {title("text-[clamp(2.7rem,6vw,5.6rem)]")}
          {subtitle()}
          <Buttons p={p} edit={edit} />
        </div>
        <div className="relative mx-auto w-full max-w-md animate-rise [animation-delay:200ms] lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[12rem] rounded-b-[2.75rem] shadow-(--shadow-lift)">
            <div className="absolute inset-0 animate-kenburns">
              <MediaImage
                src={p.image}
                alt={p.image ? plain(p.title) : ""}
                sizes="(min-width: 1024px) 36rem, 90vw"
                illustration="tree"
                priority={primary}
              />
            </div>
          </div>
          <Seal text="Okulum Yeryüzü" />
        </div>
      </div>
      <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full text-sand md:h-20">
        <path fill="currentColor" d="M0 48c160-36 320-44 520-20s380 40 560 12 260-30 360-18V80H0z" />
      </svg>
    </section>
  );
}
