import { isExternal } from "@/lib/links";
import { cx, paddingClasses, resolveStyle } from "@/lib/style";
import type { SiteSettings } from "@/lib/types";
import { Contours } from "./Contours";
import { Logo } from "./Logo";
import { SmartLink } from "./SmartLink";

/** Site footer (dark forest by default); `site.footerStyle` restyles it. `preview` marks it as a selectable region. */
export function Footer({ site, preview = false }: { site: SiteSettings; preview?: boolean }) {
  const social = [
    { href: site.instagramUrl, label: "Instagram" },
    { href: site.youtubeUrl, label: "YouTube" },
  ].filter((s) => isExternal(s.href));
  const s = resolveStyle(site.footerStyle, { background: { className: "bg-forest-deep", dark: true } });
  const dark = s.dark;

  return (
    <footer
      data-region={preview ? "footer" : undefined}
      className={cx("relative mt-auto overflow-hidden text-muted", s.className)}
      style={s.style}
    >
      <Contours
        className={`pointer-events-none absolute -right-40 top-0 h-full w-[60rem] ${dark ? "text-moss/50" : "text-sage/60"}`}
        seed={4}
      />
      <div
        className={cx(
          "container-page relative grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]",
          paddingClasses(site.footerStyle, { top: "pt-16", bottom: "pb-16" }),
        )}
      >
        <div className="max-w-sm">
          <Logo name={site.siteName} />
          <p className={`mt-4 ${dark ? "text-sage" : "text-moss"}`}>{site.tagline}</p>
          <p className="mt-4 text-[0.95rem] text-muted/80">{site.footerText}</p>
        </div>
        <nav aria-label="Alt menü">
          <h2 className="font-serif text-lg text-heading">Sayfalar</h2>
          <ul className="mt-4 space-y-2">
            {site.footerNav.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <SmartLink href={link.href} className="hover:text-accent">
                  {link.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="font-serif text-lg text-heading">Bize ulaşın</h2>
          <address className="mt-4 space-y-2 not-italic">
            {site.address && <p>{site.address}</p>}
            {site.phone && (
              <p>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                  {site.phone}
                </a>
              </p>
            )}
            {site.email && (
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-accent">
                  {site.email}
                </a>
              </p>
            )}
          </address>
          {social.length > 0 && (
            <ul className="mt-5 flex gap-4">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} rel="noopener noreferrer" target="_blank" className="link hover:text-accent">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className={`container-page relative border-t py-6 text-sm ${dark ? "border-moss/40 text-sage" : "border-line text-bark"}`}>
        © {new Date().getFullYear()} {site.siteName}
      </div>
    </footer>
  );
}
