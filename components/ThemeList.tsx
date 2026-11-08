import { formatDateRange } from "@/lib/format";
import type { Theme } from "@/lib/types";
import { MediaImage } from "./MediaImage";

const kindLabel = { Weekly: "Haftalık tema", Monthly: "Aylık tema", SpecialDay: "Özel gün teması" } as const;

export function ThemeList({ themes }: { themes: Theme[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {themes.map((theme) => (
        <li key={theme.id} className="flex gap-5 rounded-card bg-paper p-5 ring-1 ring-line/70">
          <div className="relative hidden aspect-square w-28 shrink-0 overflow-hidden rounded-2xl sm:block">
            <MediaImage src={theme.imageUrl} alt="" sizes="7rem" illustration={theme.kind === "Weekly" ? "leaf" : "tree"} />
          </div>
          <div>
            <p className="text-sm font-bold text-moss">
              {kindLabel[theme.kind]}, {formatDateRange(theme.startDate, theme.endDate)}
            </p>
            <h3 className="mt-1 text-xl text-forest md:text-2xl">{theme.title}</h3>
            {theme.description && <p className="mt-2 text-bark">{theme.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
