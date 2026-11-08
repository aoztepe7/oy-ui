import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Contours } from "@/components/Contours";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { JsonLd } from "@/components/JsonLd";
import { MediaImage } from "@/components/MediaImage";
import { Prose } from "@/components/Prose";
import { SeatsNote } from "@/components/SeatsNote";
import { getProgram, getPrograms, getSite } from "@/lib/api";
import {
  formatAge,
  formatDateRange,
  formatPrice,
  formatSchedule,
  programTypeLabels,
  remainingSeats,
} from "@/lib/format";
import { SITE_URL, pageMetadata } from "@/lib/site";
import type { ProgramDetail, SiteSettings } from "@/lib/types";

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
  const offers = {
    "@type": "Offer",
    price: p.price,
    priceCurrency: "TRY",
    availability: remainingSeats(p) > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
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

  const remaining = remainingSeats(program);
  const isWeekly = program.type === "WeeklyClass";
  const listHref = isWeekly ? "/programlar" : "/etkinlikler";

  const facts = [
    { label: "Program saatleri", value: formatSchedule(program) },
    { label: "Tarihler", value: formatDateRange(program.startDate, program.endDate) },
    { label: "Yaş grubu", value: formatAge(program.ageMin, program.ageMax) },
    { label: "Yer", value: program.location },
    { label: "Kontenjan", value: `${program.capacity} çocuk` },
  ].filter((f) => f.value);

  return (
    <>
      <JsonLd data={structuredData(program, site)} />

      <section className="relative overflow-hidden bg-forest text-paper">
        <Contours className="pointer-events-none absolute inset-0 h-full w-full text-moss/70" cx={1000} cy={100} seed={5} />
        <div className="container-page relative grid gap-10 py-12 md:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <nav aria-label="Sayfa yolu" className="text-sm text-sage">
              <Link href={listHref} className="hover:text-paper">
                {isWeekly ? "Programlar" : "Kamp ve etkinlikler"}
              </Link>
              <span aria-hidden="true"> / </span>
              <span>{programTypeLabels[program.type]}</span>
            </nav>
            <h1 className="mt-4 text-4xl md:text-6xl">{program.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-sage-soft md:text-xl">{program.summary}</p>
            <p className="mt-6 font-serif text-3xl text-ochre">{formatPrice(program.price, program.pricePeriod)}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-panel">
            <MediaImage
              src={program.coverImageUrl}
              alt={program.coverImageUrl ? program.title : ""}
              sizes="(min-width: 1024px) 32rem, 100vw"
              illustration={isWeekly ? "tree" : "mountain"}
              priority
            />
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-[1fr_24rem] lg:gap-16">
        <div>
          <dl className="grid gap-x-8 gap-y-5 rounded-card bg-paper p-6 ring-1 ring-line/70 sm:grid-cols-2 md:p-8">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-sm font-semibold text-moss">{f.label}</dt>
                <dd className="mt-0.5 text-lg">{f.value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-sm font-semibold text-moss">Ücret</dt>
              <dd className="mt-0.5 text-lg">{formatPrice(program.price, program.pricePeriod)}</dd>
            </div>
            <div className="self-end">
              <dt className="sr-only">Boş yer</dt>
              <dd>
                <SeatsNote remaining={remaining} />
              </dd>
            </div>
          </dl>

          <h2 className="mt-14 text-3xl text-forest md:text-4xl">Program hakkında</h2>
          <Prose text={program.description} className="mt-5 max-w-[65ch] text-lg text-bark" />
        </div>

        <aside id="on-kayit" aria-labelledby="on-kayit-baslik" className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-panel bg-paper p-6 ring-1 ring-line/70 md:p-8">
            <h2 id="on-kayit-baslik" className="text-3xl text-forest">
              Ön kayıt
            </h2>
            <p className="mt-2 mb-6 text-bark">Formu doldurun, ekibimiz sizi arayıp ayrıntıları konuşsun.</p>
            <EnrollmentForm programId={program.id} programTitle={program.title} full={remaining === 0} />
          </div>
        </aside>
      </div>
    </>
  );
}
