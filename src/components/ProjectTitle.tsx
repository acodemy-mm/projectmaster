import type { Project } from '../data/mockData';
import { getIterationDisplayTitle } from '../lib/projectNames';
import { ProjectNameLink } from './ProjectNameLink';

interface Props {
  project: Project;
  onClick: () => void;
  /** When true, show full project name (ungrouped contexts). */
  showCategory?: boolean;
}

export function ProjectTitle({ project, onClick, showCategory = false }: Props) {
  if (showCategory) {
    return (
      <div>
        <ProjectNameLink name={project.name} onClick={onClick} />
        <p className="mac-table__secondary">{project.phase} · {project.type}</p>
      </div>
    );
  }

  const rowTitle = getIterationDisplayTitle(project);
  return (
    <div>
      <ProjectNameLink name={rowTitle} onClick={onClick} />
      {project.iterationLabel ? (
        <p className="mac-table__secondary">{project.type}</p>
      ) : (
        <p className="mac-table__secondary">{project.phase} · {project.type}</p>
      )}
    </div>
  );
}
