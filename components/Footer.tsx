import { isExternal } from "@/lib/links";
import { cx, paddingClasses, resolveStyle } from "@/lib/style";
import type { SiteSettings } from "@/lib/types";
import { Contours } from "./Contours";
import { Logo } from "./Logo";
import { SmartLink } from "./SmartLink";

/** Site footer (dark forest by default) with a large brand statement; `site.footerStyle` restyles it. */
export function Footer({ site, preview = false }: { site: SiteSettings; preview?: boolean }) {
  const social = [
    { href: site.instagramUrl, label: "Instagram" },
    { href: site.youtubeUrl, label: "YouTube" },
  ].filter((s) => isExternal(s.href));
  const s = resolveStyle(site.footerStyle, { background: { className: "bg-forest-deep", dark: true } });
  const dark = s.dark;
  const phoneDigits = site.phone.replace(/[^\d+]/g, "");
  const whatsapp = phoneDigits ? `https://wa.me/${phoneDigits.replace(/^\+/, "").replace(/^0/, "90")}` : "";

  return (
    <footer
      data-region={preview ? "footer" : undefined}
      className={cx("relative isolate mt-auto overflow-hidden text-muted", s.className)}
      style={s.style}
    >
      <Contours
        className={`pointer-events-none absolute -right-40 top-0 -z-10 h-full w-[60rem] ${dark ? "text-moss/40" : "text-sage/60"}`}
        seed={4}
      />
      <div aria-hidden="true" className="absolute -left-40 top-10 -z-10 h-[28rem] w-[28rem] rounded-full bg-ochre/10 blur-[120px]" />
      <div className={cx("container-page relative", paddingClasses(site.footerStyle, { top: "pt-20 md:pt-28", bottom: "pb-14" }))}>
        <div className="grid gap-10 border-b pb-16 md:grid-cols-[1.5fr_1fr] md:items-end border-current/15">
          <p className="max-w-3xl font-serif text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05] tracking-tight text-heading">
            {site.footerText || site.tagline}
          </p>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                WhatsApp&apos;tan yazın
              </a>
            )}
            {site.phone && (
              <a href={`tel:${phoneDigits}`} className="btn btn-ghost btn-plain text-heading">
                {site.phone}
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-12 pt-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo name={site.siteName} size="lg" />
            <p className={`mt-5 ${dark ? "text-sage" : "text-moss"}`}>{site.tagline}</p>
          </div>
          <nav aria-label="Alt menü">
            <h2 className="eyebrow">Sayfalar</h2>
            <ul className="mt-5 space-y-2.5">
              {site.footerNav.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <SmartLink href={link.href} className="text-lg transition-colors hover:text-accent">
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="eyebrow">Bize ulaşın</h2>
            <address className="mt-5 space-y-2.5 text-lg not-italic">
              {site.address && <p>{site.address}</p>}
              {site.phone && (
                <p>
                  <a href={`tel:${phoneDigits}`} className="hover:text-accent">
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
              <ul className="mt-6 flex gap-3">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="inline-flex rounded-full px-4 py-2 text-sm font-extrabold ring-1 ring-current/25 transition hover:bg-ochre hover:text-forest-deep hover:ring-ochre"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className={`container-page relative flex flex-wrap justify-between gap-2 border-t py-6 text-sm ${dark ? "border-moss/40 text-sage" : "border-line text-bark"}`}>
        <span>
          © {new Date().getFullYear()} {site.siteName}
        </span>
        <span>Çocukluk dört duvara sığmaz.</span>
      </div>
    </footer>
  );
}
