import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Contours } from "@/components/Contours";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { JsonLd } from "@/components/JsonLd";
import { MediaImage } from "@/components/MediaImage";
import { Markdown } from "@/components/Markdown";
import { getProgram, getPrograms, getSite } from "@/lib/api";
import {
  formatAge,
  formatDateRange,
  formatAmount,
  formatSchedule,
  headlinePrice,
  pricePackages,
  programTypeLabels,
} from "@/lib/format";
import { SITE_URL, pageMetadata } from "@/lib/site";
import type { ProgramDetail, SiteSettings } from "@/lib/types";

/** Shown instead of the form when pre-registration is off for the program: phone / WhatsApp. */
function ContactBox({ site, programTitle }: { site: SiteSettings; programTitle: string }) {
  const digits = site.phone.replace(/[^\d+]/g, "");
  const whatsapp = digits
    ? `https://wa.me/${digits.replace(/^\+/, "").replace(/^0/, "90")}?text=${encodeURIComponent(`Merhaba, ${programTitle} hakkında bilgi almak istiyorum.`)}`
    : "";
  return (
    <>
      <p className="eyebrow mb-3">Bilgi ve kayıt</p>
      <h2 id="on-kayit-baslik" className="text-4xl text-forest">
        Bize ulaşın
      </h2>
      <p className="mt-3 mb-7 text-bark">Bu program için kayıtlarımızı telefonla alıyoruz. Sorularınız için bize yazın ya da arayın.</p>
      <div className="space-y-3">
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-forest w-full">
            WhatsApp&apos;tan yazın
          </a>
        )}
        {site.phone && (
          <a href={`tel:${digits}`} className="btn btn-ghost btn-plain w-full text-forest">
            {site.phone}
          </a>
        )}
        {site.email && (
          <a href={`mailto:${site.email}`} className="block pt-2 text-center font-bold text-forest underline decoration-ochre decoration-2 underline-offset-4">
            {site.email}
          </a>
        )}
      </div>
    </>
  );
}

/** Package prices as cards (cheapest highlighted), add-ons as "+" rows below. */
function PriceTable({ program }: { program: ProgramDetail }) {
  const options = program.priceOptions ?? [];
  const packages = options.filter((o) => !o.isAddon);
  const addons = options.filter((o) => o.isAddon);
  const min = Math.min(...packages.map((o) => o.price));
  const period = program.pricePeriod === "Monthly" ? " / ay" : "";
  return (
    <section id="ucretler" aria-labelledby="ucretler-baslik" className="mt-16 scroll-mt-28">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="h-1 w-14 rounded-full bg-ochre" />
        <h2 id="ucretler-baslik" className="text-[clamp(2rem,4vw,3rem)] text-forest">
          Ücretler
        </h2>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {packages.map((o) => {
          const best = o.price === min;
          return (
            <li
              key={o.label}
              className={`relative flex flex-col justify-between gap-4 overflow-hidden rounded-card p-6 shadow-(--shadow-soft) ring-1 ${
                best ? "bg-forest text-paper ring-forest" : "bg-paper ring-line/60"
              }`}
            >
              <div>
                <p className={`text-lg font-bold ${best ? "text-paper" : "text-forest"}`}>{o.label}</p>
                {o.note && <p className={`mt-1 text-sm ${best ? "text-sage" : "text-bark"}`}>{o.note}</p>}
              </div>
              <p className={`font-serif text-4xl ${best ? "text-ochre" : "text-forest"}`}>
                {formatAmount(o.price)}
                <span className="text-lg">{period}</span>
              </p>
            </li>
          );
        })}
      </ul>
      {addons.length > 0 && (
        <ul className="mt-4 divide-y divide-line/70 rounded-card bg-sage-soft/60 px-6">
          {addons.map((o) => (
            <li key={o.label} className="flex flex-wrap items-baseline justify-between gap-2 py-4">
              <span>
                <span className="font-bold text-forest">{o.label}</span>
                {o.note && <span className="ml-2 text-sm text-bark">{o.note}</span>}
              </span>
              <span className="font-serif text-2xl text-forest">+{formatAmount(o.price)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/programlar/[slug]">): Promise<Metadata> {
  const program = await getProgram((await params).slug);
  if (!program) return { title: "Program bulunamadı" };
  return pageMetadata({
    title: program.title,
    description: program.summary,
    path: `/programlar/${program.slug}`,
    image: program.coverImageUrl,
  });
}

function structuredData(p: ProgramDetail, site: SiteSettings) {
  const url = `${SITE_URL}/programlar/${p.slug}`;
  const organizer = { "@type": "EducationalOrganization", name: site.siteName, url: SITE_URL };
  const location = { "@type": "Place", name: p.location || site.siteName, address: p.location || site.address };
  const packages = pricePackages(p);
  const offers = {
    ...(packages.length > 1
      ? {
          "@type": "AggregateOffer",
          lowPrice: Math.min(...packages.map((o) => o.price)),
          highPrice: Math.max(...packages.map((o) => o.price)),
          offerCount: packages.length,
        }
      : { "@type": "Offer", price: p.price }),
    priceCurrency: "TRY",
    url,
  };
  const image = p.coverImageUrl ? [p.coverImageUrl] : undefined;
  const audience = { "@type": "PeopleAudience", suggestedMinAge: p.ageMin, suggestedMaxAge: p.ageMax };

  if (p.type === "WeeklyClass") {
    return {
      "@context": "https://schema.org",
      "@type": "Course",
      name: p.title,
      description: p.summary,
      url,
      image,
      provider: organizer,
      audience,
      offers,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "Onsite",
        startDate: p.startDate,
        endDate: p.endDate,
        location,
      },
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: p.title,
    description: p.summary,
    url,
    image,
    startDate: `${p.startDate}T${p.startTime}:00+03:00`,
    endDate: `${p.endDate}T${p.endTime}:00+03:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location,
    organizer,
    audience,
    offers,
  };
}

export default async function ProgramPage({ params }: PageProps<"/programlar/[slug]">) {
  const { slug } = await params;
  const [program, site] = await Promise.all([getProgram(slug), getSite()]);
  if (!program) notFound();

  const isWeekly = program.type === "WeeklyClass";
  const listHref = isWeekly ? "/programlar" : "/etkinlikler";

  const facts = [
    { label: "Program saatleri", value: formatSchedule(program) },
    { label: "Tarihler", value: formatDateRange(program.startDate, program.endDate) },
    { label: "Yaş grubu", value: formatAge(program.ageMin, program.ageMax) },
    { label: "Yer", value: program.location },
    { label: "Kontenjan", value: `${program.capacity} çocuk` },
  ].filter((f) => f.value);
  const headline = headlinePrice(program);
  const packages = pricePackages(program);
  // Set per program in the panel ("Ön kayıt formu"); older APIs don't send it → open.
  const enrollmentOpen = program.enrollmentEnabled !== false;

  return (
    <>
      <JsonLd data={structuredData(program, site)} />

      <section className="tone-dark relative isolate overflow-hidden bg-forest text-paper">
        <Contours className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-moss/70" cx={1000} cy={100} seed={5} />
        <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-ochre/20 blur-[120px]" />
        <div className="container-page relative grid gap-14 pb-24 pt-14 md:pb-32 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm font-bold text-sage animate-rise">
              <Link href={listHref} className="hover:text-paper">
                {isWeekly ? "Programlar" : "Kamp ve etkinlikler"}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="rounded-full bg-paper/10 px-3 py-1 text-paper ring-1 ring-paper/20">{programTypeLabels[program.type]}</span>
            </nav>
            <h1 className="mt-6 text-[clamp(2.6rem,6vw,5.4rem)] animate-rise [animation-delay:100ms]">{program.title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sage-soft animate-rise [animation-delay:200ms] md:text-xl">{program.summary}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4 animate-rise [animation-delay:300ms]">
              <a href="#on-kayit" className="btn btn-primary">
                {enrollmentOpen ? "Ön kayıt yap" : "Bilgi al"}
              </a>
              <p className="font-serif text-3xl text-ochre">
                {headline.amount}
                {headline.from && <span className="ml-1.5 font-sans text-base font-bold text-sage-soft">’den başlayan</span>}
              </p>
              {packages.length > 0 && (
                <a href="#ucretler" className="text-sm font-bold text-sage underline decoration-ochre decoration-2 underline-offset-4 hover:text-paper">
                  Tüm fiyatlar
                </a>
              )}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md animate-rise [animation-delay:200ms] lg:max-w-none">
            <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rotate-2 rounded-[2.5rem] bg-ochre/80" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-forest-deep shadow-(--shadow-lift)">
              <MediaImage
                src={program.coverImageUrl}
                alt={program.coverImageUrl ? program.title : ""}
                sizes="(min-width: 1024px) 32rem, 100vw"
                illustration={isWeekly ? "tree" : "mountain"}
                priority
              />
            </div>
          </div>
        </div>
        <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-8 w-full text-sand md:h-12">
          <path fill="currentColor" d="M0 36c180-28 360-34 560-14s400 30 580 8 220-22 300-14V60H0z" />
        </svg>
      </section>

      <div className="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-[1fr_25rem] lg:gap-20">
        <div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl bg-paper px-5 py-4 shadow-(--shadow-soft) ring-1 ring-line/60">
                <dt className="text-xs font-extrabold uppercase tracking-[0.16em] text-moss">{f.label}</dt>
                <dd className="mt-1 text-lg font-semibold text-forest">{f.value}</dd>
              </div>
            ))}
            <div className="rounded-2xl bg-paper px-5 py-4 shadow-(--shadow-soft) ring-1 ring-line/60">
              <dt className="text-xs font-extrabold uppercase tracking-[0.16em] text-moss">Ücret</dt>
              <dd className="mt-1 text-lg font-semibold text-forest">
                {headline.amount}
                {headline.from && <span className="font-normal text-bark">’den başlayan</span>}
              </dd>
            </div>
          </dl>

          {packages.length > 0 && <PriceTable program={program} />}

          <div className="mt-16 flex items-center gap-4">
            <span aria-hidden="true" className="h-1 w-14 rounded-full bg-ochre" />
            <h2 className="text-[clamp(2rem,4vw,3rem)] text-forest">Program hakkında</h2>
          </div>
          <Markdown text={program.description} headingLevel={3} className="mt-8 max-w-[68ch] text-lg leading-relaxed text-bark" />
        </div>

        {enrollmentOpen ? (
          // Short summary that follows the reader; the form itself is the full-width section below.
          <aside aria-label="Ön kayıt özeti" className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-panel bg-forest p-7 text-paper shadow-(--shadow-lift) md:p-9">
              <p className="eyebrow mb-3 text-sage">Yerinizi ayırtın</p>
              <p className="font-serif text-4xl text-ochre">
                {headline.amount}
                {headline.from && <span className="ml-1.5 font-sans text-base font-bold text-sage-soft">’den başlayan</span>}
              </p>
              <p className="mt-3 text-sage-soft">Formu doldurun, ekibimiz sizi arayıp ayrıntıları konuşsun.</p>
              <a href="#on-kayit" className="btn btn-primary mt-6 w-full">
                Ön kayıt formuna git
              </a>
            </div>
          </aside>
        ) : (
          <aside id="on-kayit" className="scroll-mt-24 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-panel bg-paper p-7 shadow-(--shadow-lift) ring-1 ring-line/60 md:p-9">
              <ContactBox site={site} programTitle={program.title} />
            </div>
          </aside>
        )}
      </div>

      {enrollmentOpen && (
        <section id="on-kayit" aria-labelledby="on-kayit-baslik" className="scroll-mt-24 pb-20 md:pb-28">
          <div className="container-page">
            <div className="rounded-panel bg-paper p-6 shadow-(--shadow-lift) ring-1 ring-line/60 sm:p-10 lg:p-14">
              <div className="mb-10 flex flex-col gap-4 border-b border-line/70 pb-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="eyebrow mb-3">Yerinizi ayırtın</p>
                  <h2 id="on-kayit-baslik" className="text-[clamp(2.2rem,4vw,3.2rem)] text-forest">
                    Ön kayıt
                  </h2>
                </div>
                <p className="max-w-md text-bark md:text-right">
                  <span className="font-semibold text-forest">{program.title}</span> için formu doldurun, ekibimiz sizi arayıp ayrıntıları konuşsun.
                </p>
              </div>
              <EnrollmentForm
                programId={program.id}
                programTitle={program.title}
                packages={packages.map((o) => ({ label: o.label, price: formatAmount(o.price) }))}
                config={program.enrollmentForm ?? undefined}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
