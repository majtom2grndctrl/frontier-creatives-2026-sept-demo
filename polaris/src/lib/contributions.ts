// Heatmap maths for the developer profile (profile spec §7.2a).
//
// The grid is weeks-as-columns, days-as-rows. The leading week renders in full;
// the trailing week is truncated after the last day that has occurred, with no
// placeholder cells. Both facts fall out of bucketing a flat day list by its
// distance from the first cell, which is always a Sunday.

import type { ContributionDay, ContributionYear } from "@/data/profile-types";

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Row order, top to bottom. Only Monday, Wednesday and Friday are labelled. */
export const DAY_ROWS = [
  { index: 0, name: "Sunday", label: "" },
  { index: 1, name: "Monday", label: "Mon" },
  { index: 2, name: "Tuesday", label: "" },
  { index: 3, name: "Wednesday", label: "Wed" },
  { index: 4, name: "Thursday", label: "" },
  { index: 5, name: "Friday", label: "Fri" },
  { index: 6, name: "Saturday", label: "" },
] as const;

export const LEVELS = [0, 1, 2, 3, 4] as const;

/** Calendar dates are local, not UTC — see `lib/format.ts` for why. */
export function parseDay(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

export function isoDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** A column is a week: seven slots, `null` where no day exists yet. */
export type Week = (ContributionDay | null)[];

export function toWeeks(days: ContributionDay[]): Week[] {
  const first = days[0];
  if (!first) return [];

  const start = parseDay(first.date);
  const weeks: Week[] = [];

  for (const day of days) {
    const offset = Math.round((parseDay(day.date).getTime() - start.getTime()) / DAY_MS);
    const column = Math.floor((offset + start.getDay()) / 7);
    const row = parseDay(day.date).getDay();
    weeks[column] ??= [null, null, null, null, null, null, null];
    weeks[column]![row] = day;
  }

  // Trailing `null`s are dropped so the last column simply ends (spec §16.12).
  return weeks.map((week, index) => {
    if (index !== weeks.length - 1) return week;
    let end = week.length;
    while (end > 0 && week[end - 1] === null) end -= 1;
    return week.slice(0, end);
  });
}

export interface MonthLabel {
  /** Index of the column the label sits above. */
  column: number;
  label: string;
}

/**
 * One label per month, above the column in which that month's run begins. A run
 * of fewer than three columns gets no label, which is what suppresses the
 * trailing partial month (spec §16.13) — it holds one full week plus a
 * truncated one — while leaving the leading partial month, which is three
 * columns wide, labelled.
 */
export function monthLabels(weeks: Week[]): MonthLabel[] {
  const runs: { column: number; key: string; label: string; width: number }[] = [];

  weeks.forEach((week, column) => {
    const anchor = week.find((day): day is ContributionDay => day !== null);
    if (!anchor) return;
    const date = parseDay(anchor.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const last = runs[runs.length - 1];
    if (last?.key === key) {
      last.width += 1;
      return;
    }
    runs.push({
      column,
      key,
      label: date.toLocaleDateString(undefined, { month: "short" }),
      width: 1,
    });
  });

  return runs.filter((run) => run.width >= 3).map(({ column, label }) => ({ column, label }));
}

export function dayAccessibleName(day: ContributionDay): string {
  const date = parseDay(day.date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return day.count === 0
    ? `No contributions on ${date}`
    : `${day.count} contribution${day.count === 1 ? "" : "s"} on ${date}`;
}

/**
 * A full calendar year at level 0. The fixture only carries real data for the
 * newest year, so selecting any earlier one in the rail exercises the spec's
 * "zero contributions in the selected year" state (§13) rather than blanking
 * the card.
 */
export function emptyContributionYear(year: number): ContributionYear {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const days: ContributionDay[] = [];

  // Calendar-day steps, for the same daylight-saving reason as the fixture's
  // generator: a fixed 24-hour increment repeats a date across the boundary.
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push({ date: isoDay(cursor), count: 0, level: 0 });
  }

  return { total: 0, rangeStart: isoDay(start), rangeEnd: isoDay(end), days };
}
