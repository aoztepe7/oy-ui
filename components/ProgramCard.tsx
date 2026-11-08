import Link from "next/link";
import { formatAge, formatDateRange, formatPrice, formatSchedule, programTypeLabels, remainingSeats } from "@/lib/format";
import type { ProgramSummary } from "@/lib/types";
import { MediaImage } from "./MediaImage";
import { SeatsNote } from "./SeatsNote";

const illustrationByType = { WeeklyClass: "tree", Camp: "mountain", Event: "leaf", Workshop: "leaf" } as const;

export function ProgramCard({ program, headingLevel = "h3" }: { program: ProgramSummary; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const isWeekly = program.type === "WeeklyClass";
  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card bg-paper ring-1 ring-line/80 transition-shadow hover:shadow-[0_12px_32px_-16px_rgb(30_58_43/0.35)]">
      <div className="relative aspect-[4/3]">
        <MediaImage
          src={program.coverImageUrl}
          alt=""
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          illustration={illustrationByType[program.type]}
        />
        <span className="absolute left-4 top-4 rounded-full bg-paper/95 px-3 py-1 text-sm font-bold text-forest">
          {programTypeLabels[program.type]} · {formatAge(program.ageMin, program.ageMax)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Heading className="text-2xl text-forest">
          <Link href={`/programlar/${program.slug}`} className="after:absolute after:inset-0 group-hover:text-moss">
            {program.title}
          </Link>
        </Heading>
        <p className="mt-2 text-bark">{program.summary}</p>
        <dl className="mt-5 space-y-1 text-[0.95rem]">
          <div>
            <dt className="sr-only">Zaman</dt>
            <dd>{isWeekly ? formatSchedule(program) : formatDateRange(program.startDate, program.endDate)}</dd>
          </div>
          {program.location && (
            <div>
              <dt className="sr-only">Yer</dt>
              <dd className="text-bark">{program.location}</dd>
            </div>
          )}
        </dl>
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <p className="font-serif text-xl font-semibold text-forest">{formatPrice(program.price, program.pricePeriod)}</p>
          <SeatsNote remaining={remainingSeats(program)} />
        </div>
      </div>
    </article>
  );
}
