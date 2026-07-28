import { useMemo } from 'react';
import {
  DESIGN_PROCESS_STEPS,
  effectiveDesignStage,
  GANTT_MONTHS,
  type DesignStage,
  type Project,
} from '../data/mockData';
import { PROGRESS_GANTT_COLORS } from '../lib/progressColors';
import { useProjects, dateToGanttStart, datesToGanttDuration } from '../context/ProjectContext';
import { StatusBadge, PriorityBadge, SizeBadge, DesignStageBadge } from '../components/Badge';
import { AvatarGroup } from '../components/Avatar';
import { IconEdit } from '../icons';

interface Props {
  projectId: string;
  onBack: () => void;
  backLabel?: string;
  onEditProject?: () => void;
}

function formatDate(dateStr: string) {
  if (!dateStr.trim()) return '—';
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function stageIndex(stage: DesignStage): number {
  if (stage === 'Not Started') return -1;
  const i = DESIGN_PROCESS_STEPS.indexOf(stage as (typeof DESIGN_PROCESS_STEPS)[number]);
  return i === -1 ? 0 : i;
}

function DesignProcessStepper({ project }: { project: Project }) {
  const stage = effectiveDesignStage(project);
  const active = stageIndex(stage);
  const dates: Record<(typeof DESIGN_PROCESS_STEPS)[number], string> = {
    Wireframe: project.wireframeStart,
    Review: project.wireframeDelivered,
    Design: project.designStart,
    Handoff: project.handoffDate,
  };
  const dateLabels: Record<(typeof DESIGN_PROCESS_STEPS)[number], string> = {
    Wireframe: 'Start',
    Review: 'Delivered',
    Design: 'Start',
    Handoff: 'Handoff',
  };

  return (
    <div className="design-process">
      <div className="design-process__header">
        <DesignStageBadge stage={stage} />
        <span className="design-process__hint">
          {stage === 'Not Started'
            ? 'Planning — design process not started yet'
            : 'Wireframe → Review → Design → Handoff'}
        </span>
      </div>
      <ol className="design-process__steps" aria-label="Design process stages">
        {DESIGN_PROCESS_STEPS.map((step, i) => {
          const state = i < active ? 'complete' : i === active ? 'active' : 'upcoming';
          return (
            <li key={step} className={`design-process__step design-process__step--${state}`}>
              <span className="design-process__dot" aria-hidden />
              <span className="design-process__step-label">{step}</span>
              <span className="design-process__step-date">
                {dateLabels[step]}: {formatDate(dates[step])}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="project-detail__row">
      <dt className="project-detail__label">{label}</dt>
      <dd className="project-detail__value">{children}</dd>
    </div>
  );
}

function ExternalLink({ href, fallback }: { href: string; fallback: string }) {
  if (!href.trim()) {
    return <span className="project-detail__empty">{fallback}</span>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="project-detail__link">
      {href}
    </a>
  );
}

function ProjectTimeline({ project }: { project: Project }) {
  const totalMonths = GANTT_MONTHS.length;
  const hasTimeline = Boolean(project.startDate && project.dueDate);
  const barLeft = hasTimeline ? (dateToGanttStart(project.startDate) / totalMonths) * 100 : 0;
  const barWidth = hasTimeline
    ? Math.min((datesToGanttDuration(project.startDate, project.dueDate) / totalMonths) * 100, 100 - barLeft)
    : 0;

  return (
    <div className="project-detail__timeline">
      <div className="project-detail__timeline-dates">
        <span><strong>Start:</strong> {formatDate(project.startDate)}</span>
        <span><strong>Due:</strong> {formatDate(project.dueDate)}</span>
      </div>
      <div className="gantt-track project-detail__gantt">
        <div className="gantt-track__grid" aria-hidden="true">
          {GANTT_MONTHS.map((m) => (
            <div key={m} className="gantt-track__month" title={m} />
          ))}
        </div>
        {hasTimeline && barWidth > 0 && (
          <div
            className="gantt-bar"
            style={{
              left: `${barLeft}%`,
              width: `${barWidth}%`,
              background: PROGRESS_GANTT_COLORS[project.progress],
            }}
          >
            <span className="gantt-bar__label">
              {project.startDate.slice(5, 10)} → {project.dueDate.slice(5, 10)}
            </span>
          </div>
        )}
      </div>
      <div className="project-detail__timeline-months" aria-hidden="true">
        {GANTT_MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetailPage({ projectId, onBack, backLabel = 'Back to Project Master', onEditProject }: Props) {
  const { projects } = useProjects();
  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);

  if (!project) {
    return (
      <div className="page">
        <p>Project not found.</p>
        <button type="button" className="mac-btn mac-btn--ghost" onClick={onBack}>← Back</button>
      </div>
    );
  }

  const assigneeNames = [
    ...project.dedicated.map((a) => `${a.name} (Lead)`),
    ...project.backup.map((a) => `${a.name} (Backup)`),
  ];

  return (
    <div className="page page--wide">
      <button type="button" className="project-detail__back" onClick={onBack}>
        ← {backLabel}
      </button>

      <header className="project-detail__hero">
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{project.projectName}</h1>
          {project.iterationLabel && (
            <p className="project-detail__iteration">{project.iterationLabel}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <StatusBadge status={project.progress} />
            <DesignStageBadge stage={effectiveDesignStage(project)} />
            <SizeBadge size={project.size} />
            <PriorityBadge level={project.priority} />
            <span className="project-detail__meta">{project.phase} · {project.type}</span>
          </div>
        </div>
        {onEditProject && (
          <button type="button" className="mac-btn mac-btn--secondary" onClick={onEditProject}>
            <IconEdit size={14} /> Edit Project
          </button>
        )}
      </header>

      <div className="mac-group project-detail__card">
        <dl className="project-detail__grid">
          <DetailRow label="Progress Status">
            <StatusBadge status={project.progress} />
          </DetailRow>

          <DetailRow label="Design process">
            <DesignProcessStepper project={project} />
          </DetailRow>

          <DetailRow label="Assign Person">
            {project.dedicated.length === 0 && project.backup.length === 0 ? (
              <span className="project-detail__empty">No assignees yet</span>
            ) : (
              <div className="project-detail__assignees">
                {project.dedicated.length > 0 && (
                  <div>
                    <p className="project-detail__assignee-label">Lead</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <AvatarGroup assignees={project.dedicated} size={28} />
                      <span>{project.dedicated.map((a) => a.name).join(', ')}</span>
                    </div>
                  </div>
                )}
                {project.backup.length > 0 && (
                  <div>
                    <p className="project-detail__assignee-label">Backup</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <AvatarGroup assignees={project.backup} size={28} />
                      <span>{project.backup.map((a) => a.name).join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DetailRow>

          <DetailRow label="PM Name">
            {project.pm || <span className="project-detail__empty">Not assigned</span>}
          </DetailRow>

          <DetailRow label="Developer Name">
            {project.developerName || (
              assigneeNames.length > 0
                ? assigneeNames.join(', ')
                : <span className="project-detail__empty">Not assigned</span>
            )}
          </DetailRow>

          <DetailRow label="Description">
            {project.description || <span className="project-detail__empty">No description provided</span>}
          </DetailRow>

          <DetailRow label="Timeline">
            <ProjectTimeline project={project} />
          </DetailRow>

          <DetailRow label="Wireframe Link">
            <ExternalLink href={project.wireframeLink} fallback="No wireframe link" />
          </DetailRow>

          <DetailRow label="Figma Link">
            <ExternalLink href={project.figmaLink} fallback="No Figma link" />
          </DetailRow>
        </dl>
      </div>
    </div>
  );
}
