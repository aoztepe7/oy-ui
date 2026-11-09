"use client";

import { useState } from "react";

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function daysIn(year: number, month: number): number {
  // Unknown year: February may have 29 days.
  return new Date(Date.UTC(year || 2000, month, 0)).getUTCDate();
}

/**
 * Turkish day / month / year picker (GG / Ay / YYYY). The browser's own date input follows the
 * browser language (mm/dd/yyyy in English browsers), so dates are picked with three selects instead.
 * Submits `name` as ISO yyyy-mm-dd ("" while incomplete), like a native date input.
 */
export function DateField({
  name,
  label,
  defaultValue,
  required = false,
  error,
  hint,
  years,
}: {
  name: string;
  label: string;
  /** ISO yyyy-mm-dd. */
  defaultValue?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  /** Selectable years, first shown first (birth dates: this year going back). */
  years: number[];
}) {
  const [y0, m0, d0] = (defaultValue ?? "").split("-").map(Number);
  const [day, setDay] = useState(d0 || 0);
  const [month, setMonth] = useState(m0 || 0);
  const [year, setYear] = useState(y0 || 0);

  const maxDay = month ? daysIn(year, month) : 31;
  const safeDay = Math.min(day, maxDay);
  const iso = day && month && year ? `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}` : "";
  const id = `f-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const select = "field appearance-none bg-[length:0.9rem] bg-[right_0.8rem_center] bg-no-repeat pr-8";
  const chevron = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234c6a3c' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  };

  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="mb-1.5 block font-semibold text-ink">
        {label}
        {!required && <span className="font-normal text-bark"> (isteğe bağlı)</span>}
      </legend>
      <input type="hidden" name={name} value={iso} />
      <div className="grid grid-cols-[1fr_1.6fr_1.3fr] gap-2">
        <select
          id={id}
          aria-label="Gün"
          value={safeDay || ""}
          onChange={(e) => setDay(Number(e.target.value))}
          aria-invalid={error ? true : undefined}
          className={select}
          style={chevron}
        >
          <option value="">Gün</option>
          {Array.from({ length: maxDay }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <select
          aria-label="Ay"
          value={month || ""}
          onChange={(e) => setMonth(Number(e.target.value))}
          aria-invalid={error ? true : undefined}
          className={select}
          style={chevron}
        >
          <option value="">Ay</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Yıl"
          value={year || ""}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-invalid={error ? true : undefined}
          className={select}
          style={chevron}
        >
          <option value="">Yıl</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-bark">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-[#9b3a26]">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Years for a child's birth date: this year back 18 years. */
export function birthYears(): number[] {
  const now = new Date().getFullYear();
  return Array.from({ length: 19 }, (_, i) => now - i);
}

/** Years for a general date question: last year to five years ahead. */
export function eventYears(): number[] {
  const now = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, i) => now - 1 + i);
}
