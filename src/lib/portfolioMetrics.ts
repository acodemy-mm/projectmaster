import type { Project } from '../data/mockData';

export interface MetricTrend {
  /** Signed change vs prior period (percentage points or days). */
  delta: number;
  label: string;
  /** Whether the change is favorable for the team. */
  isPositive: boolean;
}

export interface PortfolioMetrics {
  slaAdherence: number;
  slaTrend: MetricTrend;
  avgCycleTimeDays: number;
  cycleTimeTrend: MetricTrend;
  slaSampleSize: number;
  cycleSampleSize: number;
}

const MS_PER_DAY = 86_400_000;

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

function daysBetween(startStr: string, endStr: string): number {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY));
}

/** Projects with work underway — excludes pre-kickoff Planning. */
function slaEligible(projects: Project[]): Project[] {
  return projects.filter((p) => p.progress !== 'Planning');
}

/** Meets agreed delivery deadline: not flagged Delayed. */
export function projectMeetsSla(p: Project, asOf: Date = new Date()): boolean {
  if (p.progress === 'Planning') return false;
  if (p.progress === 'Delayed') return false;
  if (p.progress === 'Launched' || p.progress === 'Hands-off') return true;
  const due = parseDate(p.dueDate);
  return due.getTime() >= asOf.getTime();
}

export function computeSlaAdherence(projects: Project[], asOf: Date = new Date()): number {
  const eligible = slaEligible(projects);
  if (eligible.length === 0) return 0;
  const adherent = eligible.filter((p) => projectMeetsSla(p, asOf)).length;
  return Math.round((adherent / eligible.length) * 1000) / 10;
}

function projectEndDate(p: Project, asOf: Date): string {
  if (p.progress === 'Launched' || p.progress === 'Hands-off') return p.dueDate;
  const today = asOf.toISOString().slice(0, 10);
  return today;
}

export function computeAvgCycleTimeDays(projects: Project[], asOf: Date = new Date()): number | null {
  const active = projects.filter((p) => p.progress !== 'Planning');
  if (active.length === 0) return null;
  const totalDays = active.reduce(
    (sum, p) => sum + daysBetween(p.startDate, projectEndDate(p, asOf)),
    0
  );
  return Math.round((totalDays / active.length) * 10) / 10;
}

/** Split cohorts by due date to derive period-over-period trends from live data. */
function periodCutoff(asOf: Date): string {
  const d = new Date(asOf);
  d.setDate(d.getDate() - 45);
  return d.toISOString().slice(0, 10);
}

function formatTrend(delta: number, unit: 'pp' | 'days', lowerIsBetter: boolean): MetricTrend {
  const abs = Math.abs(delta);
  const formatted =
    unit === 'pp'
      ? `${delta >= 0 ? '+' : '−'}${abs.toFixed(1)}%`
      : `${delta >= 0 ? '+' : '−'}${abs.toFixed(1)} days`;

  const isPositive = lowerIsBetter ? delta < 0 : delta > 0;
  if (abs < 0.05) {
    return { delta: 0, label: '±0', isPositive: true };
  }
  return { delta, label: formatted, isPositive };
}

export function computePortfolioMetrics(
  projects: Project[],
  asOf: Date = new Date()
): PortfolioMetrics {
  const cutoff = periodCutoff(asOf);
  const recent = projects.filter((p) => p.dueDate >= cutoff);
  const prior = projects.filter((p) => p.dueDate < cutoff);

  const slaNow = computeSlaAdherence(projects, asOf);
  const slaRecent = recent.length > 0 ? computeSlaAdherence(recent, asOf) : slaNow;
  const slaPrior = prior.length > 0 ? computeSlaAdherence(prior, asOf) : slaRecent;
  const slaDelta = slaRecent - slaPrior;

  const cycleNow = computeAvgCycleTimeDays(projects, asOf) ?? 0;
  const cycleRecent = recent.length > 0 ? computeAvgCycleTimeDays(recent, asOf) : cycleNow;
  const cyclePrior = prior.length > 0 ? computeAvgCycleTimeDays(prior, asOf) : cycleRecent;
  const cycleDelta =
    cycleRecent != null && cyclePrior != null ? cycleRecent - cyclePrior : 0;

  return {
    slaAdherence: slaNow,
    slaTrend: formatTrend(slaDelta, 'pp', false),
    avgCycleTimeDays: cycleNow,
    cycleTimeTrend: formatTrend(cycleDelta, 'days', true),
    slaSampleSize: slaEligible(projects).length,
    cycleSampleSize: projects.filter((p) => p.progress !== 'Planning').length,
  };
}
