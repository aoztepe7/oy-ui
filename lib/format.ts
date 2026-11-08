import type { PricePeriod, ProgramSummary, ProgramType } from "./types";

const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

/** ISO weekday (1 = Monday … 7 = Sunday) → Turkish name. */
export function weekdayName(iso: number): string {
  return WEEKDAYS[iso - 1] ?? "";
}

/** [1, 3] → "Pazartesi, Çarşamba"; Mon–Fri collapses to "Hafta içi her gün". */
export function formatDays(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.join() === "1,2,3,4,5") return "Hafta içi her gün";
  if (sorted.join() === "1,2,3,4,5,6,7") return "Her gün";
  return sorted.map(weekdayName).join(", ");
}

export function formatTimeRange(start: string, end: string): string {
  return `${start}–${end}`;
}

/** "Pazartesi, Çarşamba · 10:00–13:00" */
export function formatSchedule(p: Pick<ProgramSummary, "daysOfWeek" | "startTime" | "endTime">): string {
  return `${formatDays(p.daysOfWeek)} · ${formatTimeRange(p.startTime, p.endTime)}`;
}

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

/** 6500, "Monthly" → "₺6.500 / ay" */
export function formatPrice(price: number, period: PricePeriod): string {
  const amount = currency.format(price);
  return period === "Monthly" ? `${amount} / ay` : amount;
}

function parseDate(iso: string): Date {
  // Treat YYYY-MM-DD as a calendar date (no timezone shift).
  return new Date(`${iso}T12:00:00Z`);
}

const longDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", timeZone: "UTC" });

export function formatDate(iso: string): string {
  return longDate.format(parseDate(iso));
}

/** "7 Eylül 2026 – 30 Haziran 2027", or a single date when equal. */
export function formatDateRange(start: string, end: string): string {
  if (start === end) return formatDate(start);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const from = sameYear ? shortDate.format(parseDate(start)) : formatDate(start);
  return `${from} – ${formatDate(end)}`;
}

export function formatAge(min: number, max: number): string {
  return min === max ? `${min} yaş` : `${min}-${max} yaş`;
}

export const programTypeLabels: Record<ProgramType, string> = {
  WeeklyClass: "Orman okulu",
  Camp: "Kamp",
  Event: "Etkinlik",
  Workshop: "Atölye",
};

export function remainingSeats(p: Pick<ProgramSummary, "capacity" | "enrolledCount">): number {
  return Math.max(0, p.capacity - p.enrolledCount);
}

/** Today's date as YYYY-MM-DD in Istanbul time. */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}

/** Splits plain text into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
