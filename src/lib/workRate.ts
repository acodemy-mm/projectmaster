import type { Project, ProjectSize } from '../data/mockData';

const LEAD_WEIGHT: Record<ProjectSize, number> = {
  Small: 20,
  Medium: 30,
  Large: 40,
};

const BACKUP_WEIGHT: Record<ProjectSize, number> = {
  Small: 10,
  Medium: 15,
  Large: 20,
};

const INACTIVE_PROGRESS = new Set(['Launched', 'Hands-off']);

function countsTowardWorkRate(project: Project): boolean {
  return !INACTIVE_PROGRESS.has(project.progress);
}

/** Capacity % from active project assignments (lead + backup, size-weighted, capped at 100). */
export function calculateMemberWorkRate(memberId: string, projects: Project[]): number {
  let total = 0;
  for (const p of projects) {
    if (!countsTowardWorkRate(p)) continue;
    if (p.dedicatedMemberIds.includes(memberId)) {
      total += LEAD_WEIGHT[p.size];
    } else if (p.backupMemberIds.includes(memberId)) {
      total += BACKUP_WEIGHT[p.size];
    }
  }
  return Math.min(100, total);
}
