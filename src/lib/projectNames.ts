import { progressSortRank, type Project } from '../data/mockData';

export interface ProjectCategoryGroup {
  projectName: string;
  projects: Project[];
}

/** Build stored display title from category + optional iteration. */
export function composeProjectName(projectName: string, iterationLabel = ''): string {
  const category = projectName.trim();
  const iteration = iterationLabel.trim();
  if (!category) return '';
  if (!iteration) return category;
  return `${category}: ${iteration}`;
}

/** Parse legacy single `name` field (e.g. "Smart Pay : Pay Advance"). */
export function splitLegacyName(name: string): { projectName: string; iterationLabel: string } {
  const trimmed = name.trim();
  if (!trimmed) return { projectName: '', iterationLabel: '' };
  const sep = trimmed.indexOf(':');
  if (sep === -1) return { projectName: trimmed, iterationLabel: '' };
  return {
    projectName: trimmed.slice(0, sep).trim(),
    iterationLabel: trimmed.slice(sep + 1).trim(),
  };
}

export function normalizeProjectNames(
  project: Pick<Project, 'name' | 'projectName' | 'iterationLabel'>
): Pick<Project, 'name' | 'projectName' | 'iterationLabel'> {
  const projectName = (project.projectName ?? '').trim() || splitLegacyName(project.name).projectName;
  const iterationLabel =
    project.iterationLabel !== undefined && project.iterationLabel !== null
      ? project.iterationLabel.trim()
      : splitLegacyName(project.name).iterationLabel;
  const name = composeProjectName(projectName, iterationLabel);
  return { projectName, iterationLabel, name };
}

function compareByProgressThenDate(a: Project, b: Project): number {
  const byProgress = progressSortRank(a.progress) - progressSortRank(b.progress);
  if (byProgress !== 0) return byProgress;
  return a.startDate.localeCompare(b.startDate);
}

export function groupProjectsByCategory(projects: Project[]): ProjectCategoryGroup[] {
  const map = new Map<string, Project[]>();
  for (const p of projects) {
    const key = p.projectName || p.name;
    const list = map.get(key);
    if (list) list.push(p);
    else map.set(key, [p]);
  }
  return Array.from(map.entries())
    .map(([projectName, group]) => ({
      projectName,
      projects: [...group].sort(compareByProgressThenDate),
    }))
    .sort((a, b) => {
      const aRank = Math.min(...a.projects.map((p) => progressSortRank(p.progress)));
      const bRank = Math.min(...b.projects.map((p) => progressSortRank(p.progress)));
      if (aRank !== bRank) return aRank - bRank;
      return a.projectName.localeCompare(b.projectName);
    });
}

export function getUniqueProjectNames(projects: Project[]): string[] {
  const names = new Set(projects.map((p) => p.projectName || splitLegacyName(p.name).projectName));
  return Array.from(names).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

/** Row title when grouped under a category header. */
export function getIterationDisplayTitle(project: Project): string {
  if (project.iterationLabel.trim()) return project.iterationLabel.trim();
  return project.type || 'Engagement';
}
