import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  GANTT_FISCAL_START,
  GANTT_FISCAL_END,
  GANTT_MONTHS,
  resolveAssignees,
  type Project,
  type TeamMember,
} from '../data/mockData';
import { normalizeProjectNames } from '../lib/projectNames';
import { createUniqueId } from '../lib/ids';
import { supabase } from '../lib/supabase';
import { projectFromRow, projectToRow } from '../lib/supabaseMappers';
import { useTeam } from './TeamContext';

interface ProjectContextValue {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject:    (p: Omit<Project, 'id' | 'dedicated' | 'backup'>, members: TeamMember[]) => Promise<void>;
  updateProject: (id: string, patch: Partial<Omit<Project, 'dedicated' | 'backup'>>, members: TeamMember[]) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

function hydrateProject(
  raw: Omit<Project, 'dedicated' | 'backup'>,
  members: TeamMember[]
): Project {
  const names = normalizeProjectNames(raw);
  return {
    ...raw,
    ...names,
    description: raw.description ?? '',
    developerName: raw.developerName ?? '',
    wireframeLink: raw.wireframeLink ?? '',
    figmaLink: raw.figmaLink ?? '',
    designStage: raw.progress === 'Planning' ? 'Not Started' : (raw.designStage ?? 'Wireframe'),
    wireframeStart: raw.wireframeStart ?? '',
    wireframeDelivered: raw.wireframeDelivered ?? '',
    designStart: raw.designStart ?? '',
    handoffDate: raw.handoffDate ?? '',
    planTasks: raw.planTasks ?? [],
    dedicatedMemberIds: raw.dedicatedMemberIds ?? [],
    backupMemberIds: raw.backupMemberIds ?? [],
    dedicated: resolveAssignees(raw.dedicatedMemberIds ?? [], members),
    backup: resolveAssignees(raw.backupMemberIds ?? [], members),
  };
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { members } = useTeam();
  const [rawProjects, setRawProjects] = useState<Omit<Project, 'dedicated' | 'backup'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projects = useMemo(
    () => rawProjects.map((p) => hydrateProject(p, members)),
    [rawProjects, members]
  );

  const refreshProjects = useCallback(async () => {
    const { data, error: qErr } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });

    if (qErr) {
      setError(qErr.message);
      return;
    }
    setError(null);
    setRawProjects((data ?? []).map(projectFromRow));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshProjects();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [refreshProjects]);

  const addProject = useCallback(
    async (p: Omit<Project, 'id' | 'dedicated' | 'backup'>, _members: TeamMember[]) => {
      const id = createUniqueId(rawProjects.map((x) => x.id), 'proj');
      const named = { ...p, ...normalizeProjectNames(p), id };
      const { error: insertErr } = await supabase
        .from('projects')
        .insert(projectToRow(named));
      if (insertErr) {
        setError(insertErr.message);
        throw insertErr;
      }
      setRawProjects((prev) => [...prev, named]);
    },
    [rawProjects]
  );

  const updateProject = useCallback(
    async (
      id: string,
      patch: Partial<Omit<Project, 'dedicated' | 'backup'>>,
      _members: TeamMember[]
    ) => {
      const current = rawProjects.find((p) => p.id === id);
      if (!current) return;
      const updated = {
        ...current,
        ...patch,
        ...normalizeProjectNames({ ...current, ...patch }),
      };
      const { error: updateErr } = await supabase
        .from('projects')
        .update(projectToRow(updated))
        .eq('id', id);
      if (updateErr) {
        setError(updateErr.message);
        throw updateErr;
      }
      setRawProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    },
    [rawProjects]
  );

  const removeProject = useCallback(async (id: string) => {
    const { error: deleteErr } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (deleteErr) {
      setError(deleteErr.message);
      throw deleteErr;
    }
    setRawProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const value = useMemo<ProjectContextValue>(
    () => ({ projects, loading, error, addProject, updateProject, removeProject }),
    [projects, loading, error, addProject, updateProject, removeProject]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}

/** Helper: compute Gantt positioning on Apr→Mar fiscal timeline. */
export function dateToGanttStart(dateStr: string): number {
  if (!dateStr) return 0;
  const d = new Date(`${dateStr}T12:00:00`);
  const fiscalStart = new Date(`${GANTT_FISCAL_START}T12:00:00`);
  const fiscalEnd   = new Date(`${GANTT_FISCAL_END}T12:00:00`);
  if (d < fiscalStart) return 0;
  if (d > fiscalEnd) return GANTT_MONTHS.length;
  const diffDays = (d.getTime() - fiscalStart.getTime()) / 86_400_000;
  return Math.max(0, Math.min(GANTT_MONTHS.length, diffDays / 30.4375));
}

export function datesToGanttDuration(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0;
  const start = dateToGanttStart(startStr);
  const end   = dateToGanttStart(endStr);
  const duration = end - start + 1 / 30.4375;
  return Math.max(0.15, Math.min(GANTT_MONTHS.length - start, duration));
}
