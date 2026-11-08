import type { BlockEdit } from "@/lib/edit";
import { cx, paddingClasses, resolveStyle, type StyleDefaults } from "@/lib/style";
import type { BlockStyle } from "@/lib/types";
import { Contours } from "../Contours";
import { anchorId, SECTION_PADDING, type BlockComponentProps } from "./Section";

/** Title bands (hero, page header) are the site's forest-green signature, so their default background is forest. */
const FOREST: StyleDefaults["background"] = { className: "bg-forest", dark: true };

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
  return (
    <section id={anchorId(anchor)} className={cx("relative overflow-hidden", band.className)} style={band.style}>
      <Contours className={`pointer-events-none absolute inset-0 h-full w-full ${band.contours}`} cx={950} cy={120} seed={2} />
      <div className={cx("container-page relative", paddingClasses(style, SECTION_PADDING), center && "text-center")}>
        {kicker && (
          <p className="block-eyebrow mb-4 text-sm font-bold uppercase tracking-[0.14em] text-eyebrow" {...edit.text("eyebrow")}>
            {kicker}
          </p>
        )}
        {title && (
          <Heading className={cx("block-title max-w-3xl text-4xl text-heading md:text-6xl", center && "mx-auto")} {...edit.text("title")}>
            {title}
          </Heading>
        )}
        {intro && (
          <p
            className={cx("block-text mt-5 max-w-2xl whitespace-pre-line text-lg text-muted md:text-xl", center && "mx-auto")}
            {...edit.textarea("intro")}
          >
            {intro}
          </p>
        )}
      </div>
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
