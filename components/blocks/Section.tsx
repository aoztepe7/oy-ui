import type { ReactNode } from "react";
import type { BlockEdit } from "@/lib/edit";
import { cx, paddingClasses, resolveStyle } from "@/lib/style";
import type { BlockProps, BlockStyle, BlockType, SiteSettings } from "@/lib/types";
import { accent } from "../Accent";
import { Contours } from "../Contours";
import { SmartLink } from "../SmartLink";

/** Props every block renderer receives. `primary` = this block carries the page's <h1>. */
export type BlockComponentProps<T extends BlockType> = {
  props: BlockProps<T>;
  style: BlockStyle;
  primary: boolean;
  /** Inline-editing attributes (no-ops outside the visual editor preview). */
  edit: BlockEdit;
  /** Site settings to show instead of the published ones (the editor's draft in preview). */
  site?: SiteSettings;
};

/** Built-in vertical padding of a block section (used while paddingTop/Bottom are default). */
export const SECTION_PADDING = { top: "pt-20 md:pt-32", bottom: "pb-20 md:pb-32" };

/** Anchor field → element id for in-page links (`#sss` / `sss` → `sss`; spaces become dashes). */
export function anchorId(anchor: string | undefined): string | undefined {
  const id = anchor?.trim().replace(/^#/, "").replace(/\s+/g, "-");
  return id || undefined;
}

/**
 * Outer wrapper applying the block's style (background + tone, colours, fonts, sizes, width, padding,
 * visibility; see lib/style.ts) and the optional anchor id. Forest backgrounds get the contour texture.
 */
export function Section({
  style,
  anchor,
  children,
  className = "",
  inner = "container-page",
  padding = SECTION_PADDING,
}: {
  style: BlockStyle | undefined;
  anchor?: string;
  children: ReactNode;
  className?: string;
  /** Classes of the inner wrapper (default: page container). */
  inner?: string;
  padding?: { top: string; bottom: string };
}) {
  const s = resolveStyle(style);
  const forest = s.background === "forest";
  return (
    <section id={anchorId(anchor)} className={cx(s.className, forest && "relative overflow-hidden", className)} style={s.style}>
      {forest && (
        <Contours className="pointer-events-none absolute inset-0 h-full w-full text-moss/60" cx={1050} cy={90} seed={6} />
      )}
      <div className={`reveal relative ${inner} ${paddingClasses(style, padding)}`}>{children}</div>
    </section>
  );
}

/** Block title + intro, with an optional "see all" link on the right. Renders nothing when empty. */
export function BlockHeading({
  title,
  intro,
  as: Heading = "h2",
  linkText,
  linkHref,
  edit,
  className = "mb-12 md:mb-16",
}: {
  title?: string;
  intro?: string;
  as?: "h1" | "h2";
  linkText?: string;
  linkHref?: string;
  /** Field paths default to `title`, `intro` and `linkText`. */
  edit: BlockEdit;
  className?: string;
}) {
  const link = linkText && linkHref ? { text: linkText, href: linkHref } : null;
  if (!title && !intro && !link) return null;
  const titleAttrs = edit.text("title");
  return (
    <div className={`block-heading flex flex-wrap items-end justify-between gap-6 ${className}`}>
      <div className="max-w-3xl">
        {title && (
          <Heading className="block-title text-[clamp(2.3rem,4.6vw,3.9rem)] text-heading" {...titleAttrs}>
            {accent(title, titleAttrs)}
          </Heading>
        )}
        {intro && (
          <p className={`block-text ${title ? "mt-5" : ""} max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted md:text-xl`} {...edit.textarea("intro")}>
            {intro}
          </p>
        )}
      </div>
      {link && (
        <SmartLink href={link.href} className="link" {...edit.text("linkText")}>
          {link.text}
        </SmartLink>
      )}
    </div>
  );
}

/** Notice shown when a data block has nothing to list. */
export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="tone-light flex items-center gap-5 rounded-card bg-paper p-8 text-lg text-bark shadow-(--shadow-soft) ring-1 ring-line/60">
      <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage-soft text-xl">
        🌿
      </span>
      {children}
    </div>
  );
}
