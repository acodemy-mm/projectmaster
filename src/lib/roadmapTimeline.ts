import { GANTT_FISCAL_END, GANTT_FISCAL_START, GANTT_MONTHS } from '../data/mockData';

export type RoadmapScale = 'month' | 'week';

export interface TimelineColumn {
  key: string;
  label: string;
  subLabel?: string;
}

export interface TimelineWindow {
  scale: RoadmapScale;
  columns: TimelineColumn[];
  /** Inclusive window start (00:00 local via noon anchor dates) */
  windowStart: Date;
  /** Exclusive window end */
  windowEnd: Date;
  rangeLabel: string;
}

export const WEEK_VIEW_COUNT = 12;

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
}

/** Monday-start week (work calendar). */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatShortDay(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function buildMonthWindow(): TimelineWindow {
  const windowStart = parseDate(GANTT_FISCAL_START);
  const windowEnd = addDays(parseDate(GANTT_FISCAL_END), 1);
  return {
    scale: 'month',
    columns: GANTT_MONTHS.map((label, i) => ({
      key: `m-${i}`,
      label,
    })),
    windowStart,
    windowEnd,
    rangeLabel: `${formatMonthYear(windowStart)} – ${formatMonthYear(parseDate(GANTT_FISCAL_END))}`,
  };
}

export function buildWeekWindow(anchor: Date, weekCount = WEEK_VIEW_COUNT): TimelineWindow {
  const windowStart = startOfWeek(anchor);
  const columns: TimelineColumn[] = [];
  for (let i = 0; i < weekCount; i += 1) {
    const weekStart = addDays(windowStart, i * 7);
    const weekEnd = addDays(weekStart, 6);
    columns.push({
      key: `w-${weekStart.toISOString().slice(0, 10)}`,
      label: formatShortDay(weekStart),
      subLabel: `– ${formatShortDay(weekEnd)}`,
    });
  }
  const windowEnd = addDays(windowStart, weekCount * 7);
  const lastWeekStart = addDays(windowStart, (weekCount - 1) * 7);
  return {
    scale: 'week',
    columns,
    windowStart,
    windowEnd,
    rangeLabel: `${formatShortDay(windowStart)} – ${formatShortDay(addDays(lastWeekStart, 6))}`,
  };
}

export function buildTimelineWindow(scale: RoadmapScale, anchor: Date): TimelineWindow {
  return scale === 'month' ? buildMonthWindow() : buildWeekWindow(anchor);
}

/**
 * Place a project bar inside the visible window as % left/width.
 * Clips to the window; returns null if fully outside.
 */
export function projectBarInWindow(
  startDate: string,
  dueDate: string,
  window: TimelineWindow
): { left: number; width: number } | null {
  if (!startDate || !dueDate) return null;

  const start = parseDate(startDate);
  const end = parseDate(dueDate);
  const { windowStart, windowEnd } = window;
  const totalMs = windowEnd.getTime() - windowStart.getTime();
  if (totalMs <= 0) return null;

  // Inclusive end-of-day for due date
  const endExclusive = addDays(end, 1);
  if (endExclusive.getTime() <= windowStart.getTime() || start.getTime() >= windowEnd.getTime()) {
    return null;
  }

  const clippedStart = Math.max(start.getTime(), windowStart.getTime());
  const clippedEnd = Math.min(endExclusive.getTime(), windowEnd.getTime());
  const left = ((clippedStart - windowStart.getTime()) / totalMs) * 100;
  const width = Math.max(((clippedEnd - clippedStart) / totalMs) * 100, 1.2);
  return {
    left: Math.max(0, Math.min(100, left)),
    width: Math.min(100 - left, width),
  };
}

export function shiftWeeks(anchor: Date, weeks: number): Date {
  return addDays(startOfWeek(anchor), weeks * 7);
}

/** Prefer earliest project start; fall back to today. */
export function defaultWeekAnchor(projects: { startDate: string }[]): Date {
  const dates = projects
    .map((p) => p.startDate)
    .filter(Boolean)
    .map(parseDate)
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (dates.length > 0) return startOfWeek(dates[0]);
  return startOfWeek(new Date());
}

export function isTodayInWindow(window: TimelineWindow): boolean {
  const today = startOfDay(new Date()).getTime();
  return today >= window.windowStart.getTime() && today < window.windowEnd.getTime();
}

export function todayMarkerPercent(window: TimelineWindow): number | null {
  const today = startOfDay(new Date()).getTime();
  if (today < window.windowStart.getTime() || today >= window.windowEnd.getTime()) return null;
  const totalMs = window.windowEnd.getTime() - window.windowStart.getTime();
  return ((today - window.windowStart.getTime()) / totalMs) * 100;
}
