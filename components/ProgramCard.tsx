import Link from "next/link";
import { formatAge, formatDateRange, formatSchedule, headlinePrice, programTypeLabels } from "@/lib/format";
import type { ProgramSummary } from "@/lib/types";
import { MediaImage } from "./MediaImage";

const illustrationByType = { WeeklyClass: "tree", Camp: "mountain", Event: "leaf", Workshop: "leaf" } as const;

/** "₺20.000" or, with a price table, "₺20.000'den başlayan" (never a single misleading number). */
function PriceLine({ program }: { program: ProgramSummary }) {
  const { amount, from } = headlinePrice(program);
  return (
    <p className="font-serif text-2xl font-semibold text-forest">
      {amount}
      {from && <span className="ml-1 font-sans text-sm font-bold text-moss">’den başlayan</span>}
    </p>
  );
}

function Glyph({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-1 h-4 w-4 shrink-0 text-moss" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const MONTHS =["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

/** Calendar chip for one-off programs: "21–22 / Kas". */
function DateChip({ start, end }: { start: string; end: string }) {
  const [, sm, sd] = start.split("-").map(Number);
  const [, em, ed] = end.split("-").map(Number);
  const days = sd === ed && sm === em ? `${sd}` : sm === em ? `${sd}–${ed}` : `${sd}`;
  return (
    <span className="absolute right-4 top-4 grid min-w-16 place-items-center rounded-2xl bg-paper/95 px-3 py-2 text-center leading-none text-forest shadow-(--shadow-soft) backdrop-blur">
      <span className="font-serif text-2xl font-semibold">{days}</span>
      <span className="mt-1 text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-moss">{MONTHS[sm - 1]}</span>
    </span>
  );
}

export function ProgramCard({ program, headingLevel = "h3" }: { program: ProgramSummary; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const isWeekly = program.type === "WeeklyClass";
  return (
    <article className="tone-light group relative flex w-full flex-col overflow-hidden rounded-card bg-paper shadow-(--shadow-soft) ring-1 ring-line/60 transition duration-500 ease-(--ease-out-soft) hover:-translate-y-1.5 hover:shadow-(--shadow-lift)">
      <div className="zoom-img relative aspect-[4/3] overflow-hidden bg-sage-soft">
        <MediaImage
          src={program.coverImageUrl}
          alt=""
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          illustration={illustrationByType[program.type]}
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest-deep/35 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-forest/90 px-3.5 py-1.5 text-[0.8rem] font-extrabold text-paper backdrop-blur">
          {programTypeLabels[program.type]} · {formatAge(program.ageMin, program.ageMax)}
        </span>
        {!isWeekly && <DateChip start={program.startDate} end={program.endDate} />}
      </div>
      <div className="flex flex-1 flex-col p-7">
        <Heading className="text-[1.7rem] leading-tight text-forest">
          <Link href={`/programlar/${program.slug}`} className="after:absolute after:inset-0 group-hover:text-moss">
            {program.title}
          </Link>
        </Heading>
        <p className="mt-3 line-clamp-3 leading-relaxed text-bark">{program.summary}</p>
        <dl className="mb-7 mt-6 space-y-2 text-[0.95rem] text-ink">
          <div className="flex items-start gap-2.5">
            <dt>
              <Glyph d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
              <span className="sr-only">Zaman</span>
            </dt>
            <dd>{isWeekly ? formatSchedule(program) : formatDateRange(program.startDate, program.endDate)}</dd>
          </div>
          {program.location && (
            <div className="flex items-start gap-2.5">
              <dt>
                <Glyph d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                <span className="sr-only">Yer</span>
              </dt>
              <dd className="text-bark">{program.location}</dd>
            </div>
          )}
        </dl>
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-line/70 pt-6">
          <div>
            <PriceLine program={program} />
          </div>
          <span
            aria-hidden="true"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest text-lg text-paper transition duration-500 ease-(--ease-out-soft) group-hover:rotate-[-35deg] group-hover:bg-ochre group-hover:text-forest-deep"
          >
            →
          </span>
        </div>
      </div>
    </article>
  );
}
