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
  deriveInitials,
  type TeamMember,
  type Project,
} from '../data/mockData';
import { calculateMemberWorkRate } from '../lib/workRate';
import { createUniqueId } from '../lib/ids';
import { supabase } from '../lib/supabase';
import { memberFromRow, memberToRow } from '../lib/supabaseMappers';

interface TeamContextValue {
  members: TeamMember[];
  loading: boolean;
  error: string | null;
  addMember: (member: Omit<TeamMember, 'id' | 'initials' | 'workRate'>) => Promise<void>;
  updateMember: (id: string, patch: Omit<Partial<TeamMember>, 'workRate'>) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  resetMembers: () => Promise<void>;
  syncWorkRatesFromProjects: (projects: Project[]) => Promise<void>;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMembers = useCallback(async () => {
    const { data, error: qErr } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true });

    if (qErr) {
      setError(qErr.message);
      return;
    }
    setError(null);
    setMembers((data ?? []).map(memberFromRow));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshMembers();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [refreshMembers]);

  const addMember = useCallback(
    async (member: Omit<TeamMember, 'id' | 'initials' | 'workRate'>) => {
      const newMember: TeamMember = {
        ...member,
        id: createUniqueId(members.map((m) => m.id), 'm'),
        initials: deriveInitials(member.name),
        workRate: 0,
      };
      const { error: insertErr } = await supabase
        .from('team_members')
        .insert(memberToRow(newMember));
      if (insertErr) {
        setError(insertErr.message);
        throw insertErr;
      }
      setMembers((prev) => [...prev, newMember]);
    },
    [members]
  );

  const updateMember = useCallback(async (id: string, patch: Omit<Partial<TeamMember>, 'workRate'>) => {
    const current = members.find((m) => m.id === id);
    if (!current) return;
    const updated: TeamMember = {
      ...current,
      ...patch,
      initials: patch.name ? deriveInitials(patch.name) : current.initials,
    };
    const { error: updateErr } = await supabase
      .from('team_members')
      .update(memberToRow(updated))
      .eq('id', id);
    if (updateErr) {
      setError(updateErr.message);
      throw updateErr;
    }
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, [members]);

  const syncWorkRatesFromProjects = useCallback(async (projects: Project[]) => {
    const updates = members
      .map((m) => {
        const workRate = calculateMemberWorkRate(m.id, projects);
        return workRate === m.workRate ? null : { id: m.id, work_rate: workRate };
      })
      .filter((u): u is { id: string; work_rate: number } => u !== null);

    if (updates.length === 0) return;

    await Promise.all(
      updates.map(({ id, work_rate }) =>
        supabase.from('team_members').update({ work_rate }).eq('id', id)
      )
    );

    setMembers((prev) =>
      prev.map((m) => {
        const hit = updates.find((u) => u.id === m.id);
        return hit ? { ...m, workRate: hit.work_rate } : m;
      })
    );
  }, [members]);

  const removeMember = useCallback(async (id: string) => {
    const { error: deleteErr } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    if (deleteErr) {
      setError(deleteErr.message);
      throw deleteErr;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const resetMembers = useCallback(async () => {
    const { error: deleteErr } = await supabase
      .from('team_members')
      .delete()
      .neq('id', '');
    if (deleteErr) {
      setError(deleteErr.message);
      throw deleteErr;
    }
    setMembers([]);
  }, []);

  const value = useMemo<TeamContextValue>(
    () => ({
      members,
      loading,
      error,
      addMember,
      updateMember,
      removeMember,
      resetMembers,
      syncWorkRatesFromProjects,
    }),
    [members, loading, error, addMember, updateMember, removeMember, resetMembers, syncWorkRatesFromProjects]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}
