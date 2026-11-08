import { cx, paddingClasses, resolveStyle } from "@/lib/style";
import type { SiteSettings } from "@/lib/types";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { SmartLink } from "./SmartLink";

/** Site header; `site.headerStyle` restyles it. `preview` marks it as a selectable region for the visual editor. */
export function Header({ site, preview = false }: { site: SiteSettings; preview?: boolean }) {
  const cta = site.headerCtaText && site.headerCtaHref ? { text: site.headerCtaText, href: site.headerCtaHref } : null;
  const s = resolveStyle(site.headerStyle, { band: true, background: { className: "bg-sand/95", dark: false } });
  const padding = paddingClasses(site.headerStyle, { top: "", bottom: "" });
  return (
    <header
      data-region={preview ? "header" : undefined}
      className={cx("relative z-30 border-b border-line/70", s.className)}
      style={s.style}
    >
      <a href="#icerik" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-paper">
        İçeriğe geç
      </a>
      <div className={cx("container-page flex items-center justify-between gap-6", padding ? `min-h-18 ${padding}` : "h-18")}>
        <Logo name={site.siteName} />
        {site.headerNav.length > 0 && (
          <nav aria-label="Ana menü" className="hidden lg:block">
            <NavLinks links={site.headerNav} />
          </nav>
        )}
        <div className="flex items-center gap-2">
          {cta && (
            <SmartLink href={cta.href} className="btn btn-primary hidden min-h-11 px-5 text-sm sm:inline-flex">
              {cta.text}
            </SmartLink>
          )}
          <MobileNav links={site.headerNav} cta={cta} />
        </div>
      </div>
    </header>
  );
}
