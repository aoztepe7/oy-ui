import type { CSSProperties } from "react";
import type { BlockStyle } from "./types";

/*
 * Block / header / footer styles (docs/VISUAL_EDITOR.md) → CSS custom properties + a few classes.
 *
 * `resolveStyle` returns the classes and ONE inline style holding only the variables that are set;
 * the rules that consume them live in app/globals.css ("Style system"). Components only mark their
 * parts with shared classes (`block-title`, `block-text`, `block-eyebrow`, `block-actions`) and read
 * the tone variables (`text-heading`, `text-muted`, `btn-primary`, …), so no style props are threaded.
 *
 * This file is the single place where style tokens get their values (colours point at the
 * brand palette in globals.css).
 */

type Style = Partial<BlockStyle>;

// ---- Brand scales -------------------------------------------------------------------------

/** Background token → classes (`band` = title bands: hero/page header, when it differs). */
const BACKGROUNDS: Record<string, { section: string; band?: string; dark?: boolean; ochre?: boolean }> = {
  paper: { section: "border-y border-line/70 bg-paper", band: "border-b border-line/70 bg-paper" },
  white: { section: "bg-white" },
  sand: { section: "bg-sand" },
  sage: { section: "bg-sage-soft/60", band: "bg-sage-soft" },
  forest: { section: "bg-forest", dark: true },
  ochre: { section: "bg-ochre", dark: true, ochre: true },
};

const TEXT_COLORS: Record<string, string> = {
  forest: "var(--color-forest)",
  ink: "var(--color-ink)",
  bark: "var(--color-bark)",
  ochre: "var(--color-ochre)",
  light: "var(--color-paper)",
};

/** Accent (buttons, links, eyebrow): colour + text colour on top of it. */
const ACCENTS: Record<string, { color: string; fg: string }> = {
  ochre: { color: "var(--color-ochre)", fg: "var(--color-forest-deep)" },
  forest: { color: "var(--color-forest)", fg: "var(--color-paper)" },
  moss: { color: "var(--color-moss)", fg: "var(--color-paper)" },
};

/** Title sizes in px at desktop width (scaled down fluidly on small screens). */
const HEADING_SIZES: Record<string, number> = { sm: 30, md: 36, lg: 48, xl: 60, "2xl": 72 };
/** Body text sizes in px. */
const TEXT_SIZES: Record<string, number> = { sm: 15, md: 17, lg: 20, xl: 24 };
/** Vertical padding at desktop width; `--space-scale` in globals.css shrinks it on phones. */
const PADDINGS: Record<string, string> = {
  none: "0px",
  xs: "1.5rem",
  sm: "3rem",
  md: "4.5rem",
  lg: "6rem",
  xl: "9rem",
  "2xl": "12rem",
};
/** Content max width (default = the page container, 76rem). */
const WIDTHS: Record<string, string> = { narrow: "48rem", wide: "90rem", full: "none" };
/** Corner radius of cards, images and panels inside the block. */
const RADII: Record<string, string> = { none: "0px", sm: "0.5rem", md: "1.25rem", lg: "2.25rem" };

const ALIGNS: Record<string, { margin: string; justify: string }> = {
  left: { margin: "0 auto", justify: "flex-start" },
  center: { margin: "auto", justify: "center" },
  right: { margin: "auto 0", justify: "flex-end" },
};

// ---- Value helpers --------------------------------------------------------------------------

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function pixels(value: string | undefined): number | null {
  const m = /^(\d{1,4})px$/.exec(value ?? "");
  return m ? Number(m[1]) : null;
}

function rgba(hex: string): [number, number, number, number] {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function luminance(hex: string): number {
  const [r, g, b] = rgba(hex)
    .slice(0, 3)
    .map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Dark enough that light text reads better than dark text (mostly transparent colours count as light). */
function isDark(hex: string): boolean {
  return rgba(hex)[3] >= 0.5 && luminance(hex) < 0.2;
}

/** Brand colour token or custom hex → CSS colour. */
function color(value: string | undefined, tokens: Record<string, string>): string | null {
  if (!value) return null;
  if (Object.hasOwn(tokens, value)) return tokens[value];
  return HEX.test(value) ? value : null;
}

/** Size that reaches `px` at a 1200px viewport and shrinks to `max(floor, px × ratio)` on phones. */
function fluid(px: number, ratio: number, floor: number): string {
  const min = Math.min(px, Math.max(floor, Math.round(px * ratio)));
  if (min >= px) return `${px}px`;
  return `clamp(${min}px, ${+(px / 12).toFixed(2)}vw, ${px}px)`;
}

function scaled(value: string | undefined, tokens: Record<string, number>, ratio: number, floor: number): string | null {
  if (!value) return null;
  const px = Object.hasOwn(tokens, value) ? tokens[value] : pixels(value);
  return px === null ? null : fluid(px, ratio, floor);
}

function length(value: string | undefined, tokens: Record<string, string>): string | null {
  if (!value) return null;
  if (Object.hasOwn(tokens, value)) return tokens[value];
  return pixels(value) === null ? null : value;
}

/** Joins class names, skipping empty ones. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---- Resolver ---------------------------------------------------------------------------------

export interface ResolvedStyle {
  /** Classes for the block's root element. */
  className: string;
  /** Custom properties that are set (undefined when none). */
  style: CSSProperties | undefined;
  /** Background token ("forest", …), "custom", or "" when the default background is used. */
  background: string;
  /** Dark background → light text (`.tone-dark`). */
  dark: boolean;
}

export interface StyleDefaults {
  /** Look of the "" background. Title bands default to forest; header/footer have their own. */
  background?: { className: string; dark: boolean };
  /** Use the title-band variant of the background tokens. */
  band?: boolean;
}

/**
 * Turns a style object into root classes + custom properties. Every value that is "" keeps the
 * component's built-in design, so an all-default style renders exactly like before styles existed.
 */
export function resolveStyle(style: Style | undefined, defaults: StyleDefaults = {}): ResolvedStyle {
  const s = style ?? {};
  const vars: Record<string, string> = {};
  const classes: (string | false | undefined)[] = [];

  // Background + tone
  let background = "";
  let dark = defaults.background?.dark ?? false;
  const token = s.background && Object.hasOwn(BACKGROUNDS, s.background) ? BACKGROUNDS[s.background] : null;
  if (token) {
    background = s.background!;
    dark = !!token.dark;
    classes.push((defaults.band && token.band) || token.section, token.ochre && "tone-ochre");
  } else if (s.background && HEX.test(s.background)) {
    background = "custom";
    dark = isDark(s.background);
    vars["--block-bg"] = s.background;
    classes.push("bg-(--block-bg)");
  } else {
    classes.push(defaults.background?.className);
  }
  if (dark) classes.push("tone-dark");

  const fg = color(s.textColor, TEXT_COLORS);
  if (fg) {
    vars["--block-fg"] = fg;
    classes.push("has-fg");
  }

  const accent = s.accentColor && Object.hasOwn(ACCENTS, s.accentColor)
    ? ACCENTS[s.accentColor]
    : s.accentColor && HEX.test(s.accentColor)
      ? { color: s.accentColor, fg: luminance(s.accentColor) > 0.4 ? "var(--color-forest-deep)" : "var(--color-paper)" }
      : null;
  if (accent) {
    vars["--block-accent"] = accent.color;
    vars["--block-accent-fg"] = accent.fg;
    classes.push("has-accent");
  }

  // Typography
  if (s.headingFont === "sans" || s.headingFont === "serif") vars["--heading-font"] = `var(--font-${s.headingFont})`;
  if (s.bodyFont === "sans" || s.bodyFont === "serif") {
    vars["--body-font"] = `var(--font-${s.bodyFont})`;
    classes.push("has-body-font");
  }
  const headingSize = scaled(s.headingSize, HEADING_SIZES, 0.45, 24);
  if (headingSize) {
    vars["--heading-size"] = headingSize;
    classes.push("has-heading-size");
  }
  const textSize = scaled(s.textSize, TEXT_SIZES, 0.8, 15);
  if (textSize) {
    vars["--text-size"] = textSize;
    classes.push("has-text-size");
  }
  const align = s.align && Object.hasOwn(ALIGNS, s.align) ? ALIGNS[s.align] : null;
  if (align) {
    vars["--align"] = s.align!;
    vars["--align-margin"] = align.margin;
    vars["--align-justify"] = align.justify;
    classes.push("has-align");
  }

  // Spacing + layout (padding is applied to the inner wrapper by `paddingClasses`)
  const top = length(s.paddingTop, PADDINGS);
  if (top) vars["--block-pt"] = top;
  const bottom = length(s.paddingBottom, PADDINGS);
  if (bottom) vars["--block-pb"] = bottom;
  const width = length(s.width, WIDTHS);
  if (width) {
    vars["--block-width"] = width;
    classes.push("has-width");
  }
  const radius = length(s.radius, RADII);
  if (radius) {
    // Re-points the brand radius tokens used by rounded-card / rounded-panel inside the block.
    vars["--radius-card"] = radius;
    vars["--radius-panel"] = radius;
  }

  if (s.hideOnMobile === true) classes.push("hide-mobile");
  if (s.hideOnDesktop === true) classes.push("hide-desktop");

  return {
    className: cx(...classes),
    style: Object.keys(vars).length ? (vars as CSSProperties) : undefined,
    background,
    dark,
  };
}

/**
 * Vertical padding classes for a block's inner wrapper: the component's built-in classes for each
 * side left at default, otherwise `pad-t` / `pad-b` (reading `--block-pt` / `--block-pb`).
 */
export function paddingClasses(style: Style | undefined, defaults: { top: string; bottom: string }): string {
  return cx(
    length(style?.paddingTop, PADDINGS) ? "pad-t" : defaults.top,
    length(style?.paddingBottom, PADDINGS) ? "pad-b" : defaults.bottom,
  );
}
