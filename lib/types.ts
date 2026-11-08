// Types mirror docs/API.md (public endpoints). Keep in sync with the contract.

export type ProgramType = "WeeklyClass" | "Camp" | "Event" | "Workshop";
export type PricePeriod = "Monthly" | "OneTime";
export type ThemeKind = "Weekly" | "Monthly" | "SpecialDay";

export interface NavItem {
  label: string;
  href: string;
}

/** `GET /api/public/site` — menus and contact details shared by every page. */
export interface SiteSettings {
  siteName: string;
  tagline: string;
  footerText: string;
  phone: string;
  email: string;
  address: string;
  instagramUrl: string;
  youtubeUrl: string;
  headerCtaText: string;
  headerCtaHref: string;
  headerNav: NavItem[];
  footerNav: NavItem[];
  headerStyle: LayoutStyle;
  footerStyle: LayoutStyle;
}

// ---- Block CMS: "Block catalog" in docs/API.md (source of truth: oy-service Domain/Blocks.cs) ----

/**
 * Style of a block (docs/VISUAL_EDITOR.md; source of truth: oy-service Domain/Styles.cs).
 * Each string is "" (the block's built-in design), a brand token ("forest", "lg", …) or a
 * sanitised custom value ("#123abc", "48px"). Rendered by lib/style.ts.
 */
export interface BlockStyle {
  background: string;
  textColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  headingSize: string;
  textSize: string;
  align: string;
  paddingTop: string;
  paddingBottom: string;
  width: string;
  radius: string;
  hideOnMobile: boolean;
  hideOnDesktop: boolean;
}

/** Style fields of the global header and footer. */
export type LayoutStyle = Pick<BlockStyle, "background" | "textColor" | "accentColor" | "paddingTop" | "paddingBottom" | "width">;

/** Field every block has besides its own props. */
export interface BlockCommon {
  anchor: string;
}

export type FeatureIcon = "leaf" | "tree" | "mountain" | "sun" | "water" | "fire" | "compass" | "heart";
export type Columns = "2" | "3" | "4";
/** `events` = Camp + Event + Workshop. */
export type ProgramTypeFilter = "all" | "events" | ProgramType;

export interface BlockPropsMap {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    image: string;
    primaryText: string;
    primaryHref: string;
    secondaryText: string;
    secondaryHref: string;
    layout: "split" | "cover" | "centered";
  };
  pageHeader: { eyebrow: string; title: string; intro: string; align: "left" | "center" };
  text: { title: string; body: string; width: "narrow" | "wide"; align: "left" | "center" };
  imageText: {
    eyebrow: string;
    title: string;
    body: string;
    image: string;
    buttonText: string;
    buttonHref: string;
    imagePosition: "right" | "left";
  };
  features: { title: string; intro: string; items: { icon: FeatureIcon; title: string; text: string }[]; columns: Columns };
  programs: {
    title: string;
    intro: string;
    programType: ProgramTypeFilter;
    limit: number;
    featuredFirst: boolean;
    showFilters: boolean;
    linkText: string;
    linkHref: string;
    emptyText: string;
    layout: "slider" | "grid";
  };
  themes: { title: string; intro: string; limit: number };
  team: { title: string; intro: string; limit: number; linkText: string; linkHref: string; layout: "grid" | "compact" };
  cta: { title: string; text: string; buttonText: string; buttonHref: string };
  gallery: { title: string; images: { image: string; caption: string }[]; columns: Columns };
  faq: { title: string; items: { question: string; answer: string }[] };
  testimonials: { title: string; items: { quote: string; author: string; role: string }[] };
  contact: { title: string; intro: string; workingHours: string; mapEmbedUrl: string; image: string; showForm: boolean };
  embed: { title: string; url: string; caption: string };
}

export type BlockType = keyof BlockPropsMap;
export type BlockProps<T extends BlockType> = BlockPropsMap[T] & BlockCommon;

/** One page section. Types this site does not know (newer API) are skipped by the renderer. */
export type Block = {
  [T in BlockType]: { id: string; type: T; hidden: boolean; props: BlockProps<T>; style: BlockStyle };
}[BlockType];

/** `GET /api/public/pages/{slug}` */
export interface Page {
  slug: string;
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  blocks: Block[];
  publishedAt: string | null;
}

/** `GET /api/public/previews/{token}` — the editor's unsaved state; `blocks` include hidden ones. */
export interface Preview {
  page: { slug: string; path: string; title: string; blocks: Block[] };
  site: SiteSettings;
}

/** `GET /api/public/pages` item. */
export interface PageListItem {
  slug: string;
  path: string;
  title: string;
  updatedAt: string;
}

export interface ProgramSummary {
  id: string;
  slug: string;
  title: string;
  type: ProgramType;
  ageMin: number;
  ageMax: number;
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  capacity: number;
  enrolledCount: number;
  price: number;
  pricePeriod: PricePeriod;
  summary: string;
  coverImageUrl: string;
  location: string;
  /** Position among featured programs (1 = first); null when not featured. */
  featuredOrder: number | null;
}

export interface ProgramDetail extends ProgramSummary {
  description: string;
}

export interface Theme {
  id: string;
  kind: ThemeKind;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
}

export interface TeamMember {
  id: string;
  fullName: string;
  title: string;
  bio: string;
  photoUrl: string;
}

export interface EnrollmentRequest {
  programId: string;
  childName: string;
  childBirthDate: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  note: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
}

/** State shape shared by form server actions and their client forms. */
export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  /** Submitted values, echoed back so fields keep their input after an error. */
  values?: Record<string, string>;
}
