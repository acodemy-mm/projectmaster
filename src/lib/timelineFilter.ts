export type TimelineFilterMode = 'all' | 'month' | 'range';

export interface TimelineFilterState {
  mode: TimelineFilterMode;
  /** YYYY-MM when mode === 'month' */
  month: string;
  /** YYYY-MM-DD custom range start */
  from: string;
  /** YYYY-MM-DD custom range end */
  to: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function toYearMonth(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function monthBounds(yearMonth: string): { start: string; end: string } {
  const [y, m] = yearMonth.split('-').map(Number);
  const start = `${yearMonth}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${yearMonth}-${pad2(lastDay)}`;
  return { start, end };
}

export function defaultTimelineFilter(asOf: Date = new Date()): TimelineFilterState {
  const month = toYearMonth(asOf);
  const { start, end } = monthBounds(month);
  return { mode: 'all', month, from: start, to: end };
}

/** Inclusive date window, or null when showing all time. */
export function resolveTimelineWindow(
  filter: TimelineFilterState
): { start: string; end: string } | null {
  if (filter.mode === 'all') return null;
  if (filter.mode === 'month') {
    if (!/^\d{4}-\d{2}$/.test(filter.month)) return null;
    return monthBounds(filter.month);
  }
  if (!filter.from || !filter.to) return null;
  return filter.from <= filter.to
    ? { start: filter.from, end: filter.to }
    : { start: filter.to, end: filter.from };
}

/** True when project [startDate, dueDate] overlaps the window. */
export function projectOverlapsTimeline(
  project: { startDate: string; dueDate: string },
  window: { start: string; end: string } | null
): boolean {
  if (!window) return true;
  const pStart = project.startDate || project.dueDate;
  const pEnd = project.dueDate || project.startDate;
  if (!pStart || !pEnd) return true;
  return pStart <= window.end && pEnd >= window.start;
}

export function filterProjectsByTimeline<T extends { startDate: string; dueDate: string }>(
  projects: T[],
  filter: TimelineFilterState
): T[] {
  const window = resolveTimelineWindow(filter);
  return projects.filter((p) => projectOverlapsTimeline(p, window));
}

/** Month options spanning project timelines (plus current month). */
export function buildMonthOptions(
  projects: { startDate: string; dueDate: string }[],
  asOf: Date = new Date()
): string[] {
  const months = new Set<string>([toYearMonth(asOf)]);
  for (const p of projects) {
    for (const raw of [p.startDate, p.dueDate]) {
      if (raw && /^\d{4}-\d{2}/.test(raw)) months.add(raw.slice(0, 7));
    }
  }
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

export function formatTimelineFilterLabel(filter: TimelineFilterState): string {
  const window = resolveTimelineWindow(filter);
  if (!window) return 'All time';
  if (filter.mode === 'month') {
    const [y, m] = filter.month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }
  return `${window.start} → ${window.end}`;
}
