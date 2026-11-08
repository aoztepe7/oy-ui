import type { ReactNode } from "react";
import { blockEdit, NO_EDIT } from "@/lib/edit";
import type { Block, BlockStyle, BlockType, SiteSettings } from "@/lib/types";
import { ContactBlock } from "./ContactBlock";
import { CtaBlock } from "./CtaBlock";
import { EmbedBlock } from "./EmbedBlock";
import { FaqBlock } from "./FaqBlock";
import { FeaturesBlock } from "./FeaturesBlock";
import { GalleryBlock } from "./GalleryBlock";
import { HeroBlock } from "./HeroBlock";
import { ImageTextBlock } from "./ImageTextBlock";
import { PageHeaderBlock } from "./PageHeaderBlock";
import { ProgramsBlock } from "./ProgramsBlock";
import type { BlockComponentProps } from "./Section";
import { TeamBlock } from "./TeamBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { TextBlock } from "./TextBlock";
import { ThemesBlock } from "./ThemesBlock";

type Renderer<T extends BlockType> = (props: BlockComponentProps<T>) => ReactNode | Promise<ReactNode>;

const RENDERERS: { [T in BlockType]: Renderer<T> } = {
  hero: HeroBlock,
  pageHeader: PageHeaderBlock,
  text: TextBlock,
  imageText: ImageTextBlock,
  features: FeaturesBlock,
  programs: ProgramsBlock,
  themes: ThemesBlock,
  team: TeamBlock,
  cta: CtaBlock,
  gallery: GalleryBlock,
  faq: FaqBlock,
  testimonials: TestimonialsBlock,
  contact: ContactBlock,
  embed: EmbedBlock,
};

/** Responses from an older API may lack `style`; every key then counts as default. */
const NO_STYLE = {} as BlockStyle;

function isKnown(block: Block): boolean {
  return Object.hasOwn(RENDERERS, block.type) && typeof block.props === "object" && block.props !== null;
}

/** Renders one block (unknown types render nothing). */
function BlockRenderer({ block, primary, preview, site }: { block: Block; primary: boolean; preview: boolean; site?: SiteSettings }) {
  const Component = RENDERERS[block.type] as Renderer<BlockType>;
  return (
    <Component
      props={block.props}
      style={block.style ?? NO_STYLE}
      primary={primary}
      edit={preview ? blockEdit(block.id) : NO_EDIT}
      site={site}
    />
  );
}

/**
 * Renders a page's blocks in order. Exactly one block carries the <h1>: the first hero/page header,
 * else the first block when it has a title; otherwise a visually hidden <h1> with the page title is added.
 *
 * `preview` (visual editor): hidden and unknown blocks are kept (indexes match the editor's array),
 * each block is wrapped in an element carrying `data-block-id` / `data-block-index`, and fields get
 * inline-editing attributes. `site` = the editor's draft site settings.
 */
export function Blocks({
  blocks,
  pageTitle,
  preview = false,
  site,
}: {
  blocks: Block[];
  pageTitle: string;
  preview?: boolean;
  site?: SiteSettings;
}) {
  const visible = blocks.filter((b) => isKnown(b) && !b.hidden);
  const first = visible.find((b) => b.type === "hero" || b.type === "pageHeader")
    ?? (visible[0] && "title" in visible[0].props && visible[0].props.title ? visible[0] : undefined);
  const heading = !first && <h1 className="sr-only">{pageTitle}</h1>;

  if (!preview) {
    return (
      <>
        {heading}
        {visible.map((block) => (
          <BlockRenderer key={block.id} block={block} primary={block === first} preview={false} />
        ))}
      </>
    );
  }

  return (
    <>
      {heading}
      {blocks.length === 0 && (
        <div data-empty-page="" className="oy-empty-page">
          <p className="font-serif text-2xl text-forest">Sayfa henüz boş</p>
          <p className="mt-2 text-bark">Soldaki bileşenlerden birini buraya sürükleyin ya da tıklayarak ekleyin.</p>
        </div>
      )}
      {blocks.map((block, index) => (
        <div
          key={block.id}
          data-block-id={block.id}
          data-block-index={index}
          data-block-type={block.type}
          data-hidden={block.hidden ? "" : undefined}
          data-hide-mobile={block.style?.hideOnMobile ? "" : undefined}
          data-hide-desktop={block.style?.hideOnDesktop ? "" : undefined}
          className="oy-block"
        >
          {isKnown(block) ? <BlockRenderer block={block} primary={block === first} preview site={site} /> : null}
        </div>
      ))}
    </>
  );
}
