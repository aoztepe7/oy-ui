import { getSite } from "@/lib/api";
import { mapEmbedSrc } from "@/lib/embed";
import { isExternal } from "@/lib/links";
import { ContactForm } from "../ContactForm";
import { MediaImage } from "../MediaImage";
import { PageBand } from "./PageHeaderBlock";
import { BlockHeading, Section, type BlockComponentProps } from "./Section";

/**
 * Contact details (from site settings) + working hours, a map (or image) and the contact form.
 * When it opens a page (no page header before it), its title becomes the page's title band.
 */
export async function ContactBlock({ props: p, style, primary, edit, site: draft }: BlockComponentProps<"contact">) {
  const site = draft ?? (await getSite());
  const mapUrl = p.mapEmbedUrl ? mapEmbedSrc(p.mapEmbedUrl) : null;

  const details = [
    { label: "Adres", value: site.address },
    { label: "Telefon", value: site.phone, href: `tel:${site.phone.replace(/[^\d+]/g, "")}` },
    { label: "E-posta", value: site.email, href: `mailto:${site.email}` },
    { label: "Çalışma saatleri", value: p.workingHours, path: "workingHours" },
  ].filter((d) => d.value);
  const social = [
    { label: "Instagram", href: site.instagramUrl },
    { label: "YouTube", href: site.youtubeUrl },
  ].filter((s) => isExternal(s.href));
  const FormHeading = p.title && !primary ? "h3" : "h2";

  const visual = (className: string) => (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-panel ${className}`}>
      {mapUrl ? (
        <iframe
          src={mapUrl}
          title="Konumumuz haritada"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
        />
      ) : (
        <MediaImage src={p.image} alt={p.image ? p.title : ""} sizes="(min-width: 1024px) 28rem, 100vw" illustration="mountain" />
      )}
    </div>
  );

  const body = (
    <div className={`grid gap-12 lg:gap-16 ${p.showForm ? "lg:grid-cols-[1fr_1.3fr]" : "md:grid-cols-2"}`}>
      <div>
        <dl className="space-y-6">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-sm font-semibold text-eyebrow">{d.label}</dt>
              <dd className="mt-0.5 whitespace-pre-line font-serif text-xl text-heading md:text-2xl" {...(d.path ? edit.text(d.path) : {})}>
                {d.href ? (
                  <a href={d.href} className="hover:text-eyebrow">
                    {d.value}
                  </a>
                ) : (
                  d.value
                )}
              </dd>
            </div>
          ))}
          {social.length > 0 && (
            <div>
              <dt className="text-sm font-semibold text-eyebrow">Sosyal medya</dt>
              <dd className="mt-1 flex flex-wrap gap-4">
                {social.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="link">
                    {s.label}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
        {p.showForm && visual("mt-10")}
      </div>
      {p.showForm ? (
        <div id="form" className="tone-light scroll-mt-6 rounded-panel bg-paper p-6 ring-1 ring-line/70 md:p-10">
          <FormHeading className="text-3xl text-forest">Bize yazın</FormHeading>
          <p className="mt-2 mb-8 text-bark">Mesajınızı bırakın, iki iş günü içinde dönüş yapalım.</p>
          <ContactForm />
        </div>
      ) : (
        visual("")
      )}
    </div>
  );

  if (primary) {
    // Title band takes the top padding, the body section the bottom padding.
    return (
      <>
        <PageBand style={{ ...style, paddingBottom: "" }} anchor={p.anchor} title={p.title} intro={p.intro} edit={edit} />
        <Section style={{ ...style, paddingTop: "" }}>{body}</Section>
      </>
    );
  }

  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} intro={p.intro} edit={edit} />
      {body}
    </Section>
  );
}
