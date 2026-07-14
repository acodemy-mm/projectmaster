import { useEffect } from 'react';
import { useTeam } from '../context/TeamContext';
import { useProjects } from '../context/ProjectContext';

/** Keeps member work rates in sync whenever project assignments change. */
export function WorkRateSync() {
  const { syncWorkRatesFromProjects, loading: teamLoading } = useTeam();
  const { projects, loading: projectLoading } = useProjects();

  useEffect(() => {
    if (teamLoading || projectLoading) return;
    void syncWorkRatesFromProjects(projects);
  }, [projects, teamLoading, projectLoading, syncWorkRatesFromProjects]);

  return null;
}
