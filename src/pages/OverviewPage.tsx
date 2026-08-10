import { useMemo, useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { useProjects } from '../context/ProjectContext';
import { StatusBadge, DesignStageBadge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { ProjectTitle } from '../components/ProjectTitle';
import { MetricTile } from '../components/MetricTile';
import { TimelineFilter } from '../components/TimelineFilter';
import { computePortfolioMetrics } from '../lib/portfolioMetrics';
import {
  defaultTimelineFilter,
  filterProjectsByTimeline,
  formatTimelineFilterLabel,
  type TimelineFilterState,
} from '../lib/timelineFilter';
import { IconAlertTriangle } from '../icons';
import {
  progressSortRank,
  effectiveDesignStage,
  DESIGN_STAGES,
  type Project,
  type PriorityLevel,
} from '../data/mockData';

const TEAM_SECTION_KEY = 'pap_overview_team_collapsed';

function nextMilestoneLabel(p: {
  designStage: string;
  wireframeDelivered: string;
  designStart: string;
  handoffDate: string;
  dueDate: string;
}): string {
  if (p.designStage === 'Not Started' || !p.designStage) {
    return p.dueDate.slice(5).replace('-', '/');
  }
  if (p.designStage === 'Wireframe' && p.wireframeDelivered) {
    return `WF ${p.wireframeDelivered.slice(5).replace('-', '/')}`;
  }
  if (p.designStage === 'Review' && p.wireframeDelivered) {
    return `Rev ${p.wireframeDelivered.slice(5).replace('-', '/')}`;
  }
  if (p.designStage === 'Design' && p.designStart) {
    return `Des ${p.designStart.slice(5).replace('-', '/')}`;
  }
  if (p.designStage === 'Handoff' && p.handoffDate) {
    return `HO ${p.handoffDate.slice(5).replace('-', '/')}`;
  }
  if (p.wireframeDelivered) {
    return `WF ${p.wireframeDelivered.slice(5).replace('-', '/')}`;
  }
  return p.dueDate.slice(5).replace('-', '/');
}

interface Props {
  onViewMember: (id: string) => void;
  onViewProject: (id: string) => void;
  onViewAllProjects: () => void;
}

type HealthSortKey = 'project' | 'progress' | 'stage' | 'due' | 'priority';

const PRIORITY_RANK: Record<PriorityLevel, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

function stageRank(p: Project): number {
  const i = DESIGN_STAGES.indexOf(effectiveDesignStage(p));
  return i === -1 ? DESIGN_STAGES.length : i;
}

function compareProjects(a: Project, b: Project, key: HealthSortKey): number {
  switch (key) {
    case 'project':
      return a.name.localeCompare(b.name);
    case 'progress':
      return progressSortRank(a.progress) - progressSortRank(b.progress);
    case 'stage':
      return stageRank(a) - stageRank(b);
    case 'due':
      return a.dueDate.localeCompare(b.dueDate);
    case 'priority':
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  }
}

const HEALTH_PREVIEW_COUNT = 10;

function WorkBar({ value }: { value: number }) {
  return (
    <div style={{ height: 5, background: 'var(--mac-bg-control)', borderRadius: 99, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${value}%`, background: 'var(--mac-green)', borderRadius: 99 }} />
    </div>
  );
}

export function OverviewPage({ onViewMember, onViewProject, onViewAllProjects }: Props) {
  const { members } = useTeam();
  const { projects } = useProjects();
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilterState>(defaultTimelineFilter);
  const [healthSort, setHealthSort] = useState<HealthSortKey>('progress');
  const [teamCollapsed, setTeamCollapsed] = useState<boolean>(
    () => localStorage.getItem(TEAM_SECTION_KEY) === '1'
  );

  const scopedProjects = useMemo(
    () => filterProjectsByTimeline(projects, timelineFilter),
    [projects, timelineFilter]
  );

  const onTrackProjects = scopedProjects.filter(
    (p) => p.progress === 'On Track' || p.progress === 'Support'
  );
  const delayedProjects = scopedProjects.filter((p) => p.progress === 'Delayed');
  const pausedProjects = scopedProjects.filter((p) => p.progress === 'Paused');
  const planningProjects = scopedProjects.filter((p) => p.progress === 'Planning');
  const deliveredProjects = scopedProjects.filter(
    (p) => p.progress === 'Launched' || p.progress === 'Hands-off'
  );
  const notStartedCount = scopedProjects.filter((p) => effectiveDesignStage(p) === 'Not Started').length;
  const wireframeCount = scopedProjects.filter((p) => effectiveDesignStage(p) === 'Wireframe').length;
  const designCount = scopedProjects.filter((p) => effectiveDesignStage(p) === 'Design').length;

  const metrics = useMemo(() => computePortfolioMetrics(scopedProjects), [scopedProjects]);

  const healthProjects = useMemo(() => {
    return [...scopedProjects].sort((a, b) => compareProjects(a, b, healthSort));
  }, [scopedProjects, healthSort]);

  const previewProjects = healthProjects.slice(0, HEALTH_PREVIEW_COUNT);

  const timelineLabel = formatTimelineFilterLabel(timelineFilter);

  function toggleTeamSection() {
    setTeamCollapsed((prev) => {
      localStorage.setItem(TEAM_SECTION_KEY, prev ? '0' : '1');
      return !prev;
    });
  }

  const attentionGroups: { label: string; projects: Project[]; tone: 'critical' | 'warning' | 'neutral' }[] = [
    { label: 'Delayed', projects: delayedProjects, tone: 'critical' },
    { label: 'Paused', projects: pausedProjects, tone: 'warning' },
    { label: 'Planning', projects: planningProjects, tone: 'neutral' },
  ];

  return (
    <div className="page page--wide">
      <header className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Project Overview</h1>
          <p className="page-subtitle">High-level view of team capacity and project health.</p>
        </div>
        <TimelineFilter
          value={timelineFilter}
          onChange={setTimelineFilter}
          projects={projects}
        />
      </header>

      <section style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <h2 className="section-title">Delivery Performance</h2>
          <span style={{ fontSize: 12, color: 'var(--mac-text-tertiary)' }}>
            {timelineLabel} · synced from {metrics.slaSampleSize} active projects
          </span>
        </div>
        <div className="metric-grid">
          <MetricTile
            label="SLA Adherence"
            value={`${metrics.slaAdherence}%`}
            description="How consistently the team meets agreed delivery deadlines. Higher is better."
            trend={metrics.slaTrend}
            valueClassName={metrics.slaAdherence >= 80 ? 'stat-tile__value--green' : undefined}
          />
          <MetricTile
            label="Average Cycle Time"
            value={`${metrics.avgCycleTimeDays} days`}
            description="Average time from project start to finish. Lower indicates a faster design process."
            trend={metrics.cycleTimeTrend}
          />
        </div>
      </section>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: 12 }}>
        <div className="stat-tile">
          <p className="stat-tile__label">Total Projects</p>
          <p className="stat-tile__value">{scopedProjects.length}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">On Track / Support</p>
          <p className="stat-tile__value stat-tile__value--blue">{onTrackProjects.length}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Delayed</p>
          <p className="stat-tile__value" style={{ color: 'var(--mac-red)' }}>{delayedProjects.length}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Delivered Projects</p>
          <p className="stat-tile__value stat-tile__value--green">{deliveredProjects.length}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Team Size</p>
          <p className="stat-tile__value">{members.length}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Available</p>
          <p className="stat-tile__value stat-tile__value--green">
            {members.filter((m) => m.status === 'Available').length}
          </p>
        </div>
      </div>

      <p className="pipeline-summary">
        <span className="pipeline-summary__label">Pipeline</span>
        {notStartedCount} Not Started · {wireframeCount} Wireframe · {designCount} Design
      </p>

      {(delayedProjects.length > 0 || pausedProjects.length > 0 || planningProjects.length > 0) && (
        <div className="attention-strip" style={{ marginBottom: 20 }}>
          <div className="attention-strip__header">
            <IconAlertTriangle size={16} color="var(--mac-red)" />
            <span className="attention-strip__title">Needs attention</span>
          </div>
          <div className="attention-strip__groups">
            {attentionGroups.map((g) => g.projects.length > 0 && (
              <div key={g.label} className={`attention-group attention-group--${g.tone}`}>
                <span className="attention-group__count">{g.projects.length}</span>
                <span className="attention-group__label">{g.label}</span>
                <span className="attention-group__names">
                  {g.projects.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 && ' · '}
                      <button
                        type="button"
                        className="attention-group__link"
                        onClick={() => onViewProject(p.id)}
                      >
                        {p.name}
                      </button>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <section>
        <button
          type="button"
          className="section-toggle"
          onClick={toggleTeamSection}
          aria-expanded={!teamCollapsed}
        >
          <h2 className="section-title">Team Members</h2>
          <span className="section-toggle__meta">
            {members.length} members · {members.filter((m) => m.status === 'Available').length} available
          </span>
          <svg
            className={`section-toggle__chevron${teamCollapsed ? ' section-toggle__chevron--collapsed' : ''}`}
            width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {!teamCollapsed && (
        <div className="member-card-grid">
          {members.length === 0 ? (
            <div className="overview-empty">
              <p>No team members yet. Add members in Team Member Setup, then assign them in Project Master.</p>
            </div>
          ) : members.map((member) => {
            const dedicatedCount = scopedProjects.filter((p) => p.dedicatedMemberIds.includes(member.id)).length;
            const backupCount = scopedProjects.filter((p) => p.backupMemberIds.includes(member.id)).length;
            const available = 100 - member.workRate;
            const busy = member.status === 'Busy';

            return (
              <button
                key={member.id}
                type="button"
                className="member-card"
                onClick={() => onViewMember(member.id)}
              >
                <div className="member-card__top">
                  <Avatar initials={member.initials} color={member.avatarColor} src={member.avatarUrl} size={44} title={member.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="member-card__name">{member.name}</p>
                    <p className="member-card__role">{member.role}</p>
                  </div>
                </div>

                <div className="member-card__status">
                  <span style={{
                    padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    background: busy ? 'var(--tint-warning-bg)' : 'var(--tint-success-bg)',
                    color: busy ? 'var(--tint-warning-fg)' : 'var(--tint-success-fg)',
                  }}>
                    {member.status}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--mac-text-tertiary)', marginLeft: 'auto' }}>
                    {available}% free
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 11, color: 'var(--mac-text-secondary)' }}>Work Rate</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: member.workRate >= 85 ? 'var(--mac-green)' : 'var(--mac-text-primary)' }}>
                      {member.workRate}%
                    </span>
                  </div>
                  <WorkBar value={member.workRate} />
                </div>

                <div className="member-card__stats">
                  <div className="member-card__stat">
                    <span className="member-card__stat-value">{dedicatedCount}</span>
                    <span className="member-card__stat-label">Lead</span>
                  </div>
                  <div className="member-card__stat">
                    <span className="member-card__stat-value">{backupCount}</span>
                    <span className="member-card__stat-label">Backup</span>
                  </div>
                </div>

                <div style={{ borderTop: '0.5px solid var(--mac-separator)', paddingTop: 10 }}>
                  <p style={{ fontSize: 10, color: 'var(--mac-text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 3 }}>Primary Focus</p>
                  <p style={{ fontSize: 12, color: 'var(--mac-text-primary)', fontWeight: 500 }}>{member.primaryFocus}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--mac-accent)', fontSize: 12, fontWeight: 500 }}>
                  View full profile
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </button>
            );
          })}
        </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <h2 className="section-title">Project Health Summary</h2>
          <span style={{ fontSize: 12, color: 'var(--mac-text-tertiary)' }}>
            {timelineLabel} · click a project for details
          </span>
        </div>
        {projects.length === 0 ? (
          <div className="overview-empty mac-group">
            <p>No projects yet. Add projects in Project Master to track delivery health.</p>
          </div>
        ) : scopedProjects.length === 0 ? (
          <div className="overview-empty mac-group">
            <p>No projects overlap this timeline. Try All time, another month, or a wider date range.</p>
          </div>
        ) : (
        <div className="mac-group">
          <div className="mac-table-wrap">
            <table className="mac-table mac-table--compact">
              <thead>
                <tr>
                  {([
                    { key: 'project' as HealthSortKey, label: 'Project' },
                    { key: null, label: 'Lead' },
                    { key: 'progress' as HealthSortKey, label: 'Progress' },
                    { key: 'stage' as HealthSortKey, label: 'Stage' },
                    { key: 'due' as HealthSortKey, label: 'Due / Milestone' },
                    { key: 'priority' as HealthSortKey, label: 'Priority' },
                  ]).map((col) => (
                    <th key={col.label}>
                      {col.key ? (
                        <button
                          type="button"
                          className={`mac-table__sort${healthSort === col.key ? ' mac-table__sort--active' : ''}`}
                          onClick={() => setHealthSort(col.key as HealthSortKey)}
                        >
                          {col.label}
                          {healthSort === col.key && (
                            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
                          )}
                        </button>
                      ) : col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewProjects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <ProjectTitle project={p} onClick={() => onViewProject(p.id)} showCategory />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.dedicated.map((a) => (
                          <Avatar key={a.name} initials={a.initials} color={a.avatarColor} src={a.avatarUrl} size={22} title={a.name} />
                        ))}
                        <span style={{ fontSize: 12, color: 'var(--mac-text-secondary)' }}>
                          {p.dedicated.map((a) => a.name).join(', ')}
                        </span>
                      </div>
                    </td>
                    <td><StatusBadge status={p.progress} /></td>
                    <td><DesignStageBadge stage={effectiveDesignStage(p)} /></td>
                    <td className="mac-table__secondary">{nextMilestoneLabel(p)}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: '2px 7px', borderRadius: 99,
                        background: p.priority === 'High' || p.priority === 'Critical' ? 'var(--tint-critical-bg)' : p.priority === 'Medium' ? 'var(--tint-warning-bg)' : 'var(--tint-neutral-bg)',
                        color: p.priority === 'High' || p.priority === 'Critical' ? 'var(--tint-critical-fg)' : p.priority === 'Medium' ? 'var(--tint-warning-fg)' : 'var(--tint-neutral-fg)',
                      }}>
                        {p.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {healthProjects.length > HEALTH_PREVIEW_COUNT && (
            <div className="mac-table-footer">
              <span style={{ fontSize: 12, color: 'var(--mac-text-tertiary)' }}>
                Showing {HEALTH_PREVIEW_COUNT} of {healthProjects.length}
              </span>
              <button type="button" className="mac-btn mac-btn--ghost" onClick={onViewAllProjects}>
                View all {healthProjects.length} in Project Master →
              </button>
            </div>
          )}
        </div>
        )}
      </section>
    </div>
  );
}
