/**
 * Calendar-date helpers. Study plans work in local calendar days ("YYYY-MM-DD"),
 * never in timestamps, so a task planned for Tuesday stays on Tuesday across time zones.
 */
export type ISODate = string; // YYYY-MM-DD

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: ISODate): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function today(): ISODate {
  return toISODate(new Date());
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function diffDays(a: ISODate, b: ISODate): number {
  // whole days from b to a
  const ms = parseISODate(a).getTime() - parseISODate(b).getTime();
  return Math.round(ms / 86_400_000);
}

export function weekday(s: ISODate): number {
  return parseISODate(s).getDay();
}

/** Monday-based start of week. */
export function startOfWeek(s: ISODate): ISODate {
  const wd = weekday(s);
  return addDays(s, wd === 0 ? -6 : 1 - wd);
}

export function startOfMonth(s: ISODate): ISODate {
  return s.slice(0, 8) + "01";
}

export function addMonths(s: ISODate, n: number): ISODate {
  const d = parseISODate(startOfMonth(s));
  d.setMonth(d.getMonth() + n);
  return toISODate(d);
}

export function daysInRange(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** 6x7 grid of dates covering the month (Monday-first). */
export function monthGrid(s: ISODate): ISODate[] {
  const first = startOfWeek(startOfMonth(s));
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

const fmt = (opts: Intl.DateTimeFormatOptions) => (s: ISODate) => parseISODate(s).toLocaleDateString(undefined, opts);
export const formatLong = fmt({ weekday: "long", month: "long", day: "numeric" });
export const formatShort = fmt({ month: "short", day: "numeric" });
export const formatMonth = fmt({ month: "long", year: "numeric" });
export const formatWeekdayShort = fmt({ weekday: "short" });
