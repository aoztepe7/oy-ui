import type { ReactNode } from "react";
import type { BlockEdit } from "@/lib/edit";
import { cx, paddingClasses, resolveStyle } from "@/lib/style";
import type { BlockProps, BlockStyle, BlockType, SiteSettings } from "@/lib/types";
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
export const SECTION_PADDING = { top: "pt-16 md:pt-24", bottom: "pb-16 md:pb-24" };

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
      <div className={`relative ${inner} ${paddingClasses(style, padding)}`}>{children}</div>
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
  className = "mb-10 md:mb-12",
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
  return (
    <div className={`block-heading flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="max-w-2xl">
        {title && (
          <Heading className="block-title text-4xl text-heading md:text-5xl" {...edit.text("title")}>
            {title}
          </Heading>
        )}
        {intro && (
          <p className={`block-text ${title ? "mt-3" : ""} whitespace-pre-line text-lg text-muted`} {...edit.textarea("intro")}>
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
  return <div className="tone-light rounded-card bg-paper p-8 text-bark ring-1 ring-line/70">{children}</div>;
}
