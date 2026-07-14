import {
  TEAM_STORAGE_KEY,
  PROJECT_STORAGE_KEY,
  type TeamMember,
  type Project,
} from '../data/mockData';
import { createUniqueId } from './ids';

function loadJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Fix duplicate member IDs (from counter reset after reload).
 * Keeps the first occurrence of each id; later duplicates get new unique ids.
 * Project assignee refs stay on the first occurrence (assignments made before the collision).
 */
export function repairStoredIds(): void {
  const members = loadJson<TeamMember>(TEAM_STORAGE_KEY);
  const projects = loadJson<Project>(PROJECT_STORAGE_KEY);

  const seen = new Set<string>();
  let membersChanged = false;

  const repairedMembers = members.map((m) => {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      return m;
    }
    membersChanged = true;
    const newId = createUniqueId([...seen], 'm');
    seen.add(newId);
    return { ...m, id: newId };
  });

  // Project ids: also prevent project collisions on future inserts by rewriting now if needed
  const seenProj = new Set<string>();
  let projectsChanged = false;
  const repairedProjects = projects.map((p) => {
    let id = p.id;
    if (seenProj.has(id)) {
      projectsChanged = true;
      id = createUniqueId([...seenProj], 'proj');
    }
    seenProj.add(id);
    return id === p.id ? p : { ...p, id };
  });

  if (!membersChanged && !projectsChanged) return;

  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(repairedMembers));
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(repairedProjects));
}
