import type { BlockEdit } from "@/lib/edit";
import { cx, paddingClasses, resolveStyle, type StyleDefaults } from "@/lib/style";
import type { BlockStyle } from "@/lib/types";
import { accent } from "../Accent";
import { Contours } from "../Contours";
import { anchorId, type BlockComponentProps } from "./Section";

/** Title bands (hero, page header) are the site's forest-green signature, so their default background is forest. */
const FOREST: StyleDefaults["background"] = { className: "bg-forest", dark: true };

const BAND_PADDING = { top: "pt-20 md:pt-28", bottom: "pb-24 md:pb-32" };

/** Style of a title band + the colour of its contour texture. */
export function resolveBand(style: BlockStyle | undefined, background = FOREST) {
  const s = resolveStyle(style, { band: true, background });
  let contours = "text-sage/70";
  if (s.dark) contours = s.background === "" || s.background === "forest" ? "text-moss/70" : "text-paper/15";
  else if (s.background === "sage") contours = "text-sage";
  return { ...s, contours };
}

/** Top-of-page title band. Also used by the contact block when it opens a page. */
export function PageBand({
  style,
  anchor,
  eyebrow,
  title,
  intro,
  align = "left",
  as: Heading = "h1",
  edit,
}: {
  style: BlockStyle | undefined;
  anchor?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  edit: BlockEdit;
}) {
  const band = resolveBand(style);
  const center = align === "center";
  // The seeded pages repeat the title as eyebrow; showing it twice adds nothing.
  const kicker = eyebrow && eyebrow.trim().toLocaleLowerCase("tr") !== title.trim().toLocaleLowerCase("tr") ? eyebrow : "";
  const titleAttrs = edit.text("title");
  return (
    <section id={anchorId(anchor)} className={cx("relative isolate overflow-hidden", band.className)} style={band.style}>
      <Contours className={`pointer-events-none absolute inset-0 h-full w-full ${band.contours}`} cx={950} cy={120} seed={2} />
      {band.dark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-ochre/20 blur-[120px]"
        />
      )}
      <div className={cx("container-page relative", paddingClasses(style, BAND_PADDING), center && "text-center")}>
        {kicker && (
          <p className={cx("block-eyebrow eyebrow mb-6 animate-rise", center && "eyebrow-center")} {...edit.text("eyebrow")}>
            {kicker}
          </p>
        )}
        {title && (
          <Heading
            className={cx("block-title max-w-4xl text-[clamp(2.8rem,6.4vw,5.8rem)] text-heading animate-rise [animation-delay:100ms]", center && "mx-auto")}
            {...titleAttrs}
          >
            {accent(title, titleAttrs)}
          </Heading>
        )}
        {intro && (
          <p
            className={cx(
              "block-text mt-7 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted animate-rise [animation-delay:220ms] md:text-xl",
              center && "mx-auto",
            )}
            {...edit.textarea("intro")}
          >
            {intro}
          </p>
        )}
      </div>
      <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-8 w-full text-sand md:h-12">
        <path fill="currentColor" d="M0 36c180-28 360-34 560-14s400 30 580 8 220-22 300-14V60H0z" />
      </svg>
    </section>
  );
}

export function PageHeaderBlock({ props: p, style, primary, edit }: BlockComponentProps<"pageHeader">) {
  return (
    <PageBand
      style={style}
      anchor={p.anchor}
      eyebrow={p.eyebrow}
      title={p.title}
      intro={p.intro}
      align={p.align}
      as={primary ? "h1" : "h2"}
      edit={edit}
    />
  );
}
