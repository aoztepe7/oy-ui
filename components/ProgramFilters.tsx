"use client";

import Link from "next/link";
import { Children, useId, useSyncExternalStore, type ReactNode } from "react";
import type { ProgramType } from "@/lib/types";
import { ProgramGrid } from "./ProgramGrid";
import { ProgramSlider } from "./ProgramSlider";

/** URL-friendly Turkish filter values (`?tur=…&yas=…`) ↔ API ProgramType. */
const TYPE_PARAMS: Record<ProgramType, { value: string; label: string }> = {
  WeeklyClass: { value: "orman-okulu", label: "Orman okulu" },
  Camp: { value: "kamp", label: "Kamplar" },
  Event: { value: "etkinlik", label: "Etkinlikler" },
  Workshop: { value: "atolye", label: "Atölyeler" },
};
const AGES = [3, 4, 5, 6, 7, 8, 9, 10];
const CHANGE_EVENT = "oy:filters";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Writes a filter to the URL without a navigation, so the page stays statically rendered. */
function setParam(key: "tur" | "yas", value: string) {
  const params = new URLSearchParams(window.location.search);
  if (value) params.set(key, value);
  else params.delete(key);
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function clearFilters() {
  setParam("tur", "");
  setParam("yas", "");
}

export type FilterItem = { type: ProgramType; ageMin: number; ageMax: number };

/**
 * Type + age filter over a server-rendered list of program cards (`children`, same order as `items`).
 * The server always renders the full list; the URL is read only in the browser.
 */
export function ProgramFilters({
  items,
  types,
  layout,
  label,
  children,
}: {
  items: FilterItem[];
  /** Type chips to offer; fewer than two hides the type filter. */
  types: ProgramType[];
  layout: "grid" | "slider";
  label: string;
  children: ReactNode;
}) {
  const ageId = useId();
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  const params = new URLSearchParams(search);
  const type = types.find((t) => TYPE_PARAMS[t].value === params.get("tur"));
  const ageParam = Number.parseInt(params.get("yas") ?? "", 10);
  const age = AGES.includes(ageParam) ? ageParam : undefined;

  const visible = Children.toArray(children).filter((_, i) => {
    const item = items[i];
    return item && (!type || item.type === type) && (age === undefined || (item.ageMin <= age && age <= item.ageMax));
  });

  const chip = (current: boolean) =>
    `inline-flex min-h-11 items-center rounded-full px-4 font-semibold ring-1 transition-colors ${
      current ? "bg-forest text-paper ring-forest" : "bg-paper text-forest ring-line hover:ring-moss"
    }`;

  return (
    <>
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {types.length > 1 && (
          <div role="group" aria-label="Program türü">
            <ul className="flex flex-wrap gap-2">
              <li>
                <button type="button" aria-pressed={!type} onClick={() => setParam("tur", "")} className={chip(!type)}>
                  Tümü
                </button>
              </li>
              {types.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    aria-pressed={type === t}
                    onClick={() => setParam("tur", TYPE_PARAMS[t].value)}
                    className={chip(type === t)}
                  >
                    {TYPE_PARAMS[t].label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label htmlFor={ageId} className="font-semibold">
            Çocuğun yaşı
          </label>
          <select id={ageId} value={age ?? ""} onChange={(e) => setParam("yas", e.target.value)} className="field w-auto py-2">
            <option value="">Tüm yaşlar</option>
            {AGES.map((a) => (
              <option key={a} value={a}>
                {a} yaş
              </option>
            ))}
          </select>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} program listeleniyor
      </p>

      {visible.length === 0 ? (
        <div className="tone-light rounded-card bg-paper p-8 text-bark ring-1 ring-line/70">
          Bu seçime uygun program şu anda yok.{" "}
          <button type="button" onClick={clearFilters} className="link">
            Tüm programları görün
          </button>{" "}
          ya da{" "}
          <Link href="/iletisim" className="link">
            bize yazın
          </Link>
          .
        </div>
      ) : layout === "slider" ? (
        <ProgramSlider key={`${type}-${age}`} label={label}>
          {visible}
        </ProgramSlider>
      ) : (
        <ProgramGrid>{visible}</ProgramGrid>
      )}
    </>
  );
}
