import { useMemo } from 'react';
import { useTeam } from '../context/TeamContext';
import { useProjects } from '../context/ProjectContext';
import { StatusBadge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { ProjectTitle } from '../components/ProjectTitle';
import { MetricTile } from '../components/MetricTile';
import { computePortfolioMetrics } from '../lib/portfolioMetrics';
import { IconAlertTriangle } from '../icons';

interface Props {
  onViewMember: (id: string) => void;
  onViewProject: (id: string) => void;
}

function WorkBar({ value }: { value: number }) {
  return (
    <div style={{ height: 5, background: 'var(--mac-bg-control)', borderRadius: 99, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${value}%`, background: 'var(--mac-green)', borderRadius: 99 }} />
    </div>
  );
}

export function OverviewPage({ onViewMember, onViewProject }: Props) {
  const { members } = useTeam();
  const { projects } = useProjects();

  const onTrackProjects = projects.filter((p) => p.progress === 'On Track' || p.progress === 'Launched');
  const delayedProjects = projects.filter((p) => p.progress === 'Delayed');

  const metrics = useMemo(() => computePortfolioMetrics(projects), [projects]);

  return (
    <div className="page page--wide">
      <header className="page-header">
        <h1 className="page-title">Portfolio Overview</h1>
        <p className="page-subtitle">High-level view of team capacity and project health.</p>
      </header>

      <section style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <h2 className="section-title">Delivery Performance</h2>
          <span style={{ fontSize: 12, color: 'var(--mac-text-tertiary)' }}>
            Synced from {metrics.slaSampleSize} active projects
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

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: 20 }}>
        <div className="stat-tile">
          <p className="stat-tile__label">Total Projects</p>
          <p className="stat-tile__value">{projects.length}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">On Track</p>
          <p className="stat-tile__value stat-tile__value--blue">{onTrackProjects.length}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Delayed</p>
          <p className="stat-tile__value" style={{ color: 'var(--mac-red)' }}>{delayedProjects.length}</p>
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

      {delayedProjects.length > 0 && (
        <div className="mac-alert" style={{ marginBottom: 20 }}>
          <IconAlertTriangle size={18} color="var(--mac-red)" />
          <div>
            <p className="mac-alert__title">Immediate Attention Required</p>
            <p className="mac-alert__count">{delayedProjects.length} <span style={{ fontSize: 15, fontWeight: 600 }}>Delayed</span></p>
            <p className="mac-alert__detail">{delayedProjects.map((p) => p.name).join(' · ')}</p>
          </div>
        </div>
      )}

      <section>
        <div className="section-header">
          <h2 className="section-title">Team Members</h2>
          <span style={{ fontSize: 12, color: 'var(--mac-text-tertiary)' }}>Click a member to view full profile</span>
        </div>

        <div className="member-card-grid">
          {members.length === 0 ? (
            <div className="overview-empty">
              <p>No team members yet. Add members in Team Member Setup, then assign them in Project Master.</p>
            </div>
          ) : members.map((member) => {
            const dedicatedCount = projects.filter((p) => p.dedicatedMemberIds.includes(member.id)).length;
            const backupCount = projects.filter((p) => p.backupMemberIds.includes(member.id)).length;
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
                  <Avatar initials={member.initials} color={member.avatarColor} size={44} title={member.name} />
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
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 className="section-title" style={{ marginBottom: 14 }}>Project Health Summary</h2>
        <p style={{ fontSize: 12, color: 'var(--mac-text-tertiary)', marginBottom: 12 }}>
          Click a project name to view full details
        </p>
        {projects.length === 0 ? (
          <div className="overview-empty mac-group">
            <p>No projects yet. Add projects in Project Master to track delivery health.</p>
          </div>
        ) : (
        <div className="mac-group">
          <div className="mac-table-wrap">
            <table className="mac-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Lead</th>
                  <th>Progress</th>
                  <th>Due</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <ProjectTitle project={p} onClick={() => onViewProject(p.id)} showCategory />
                      <p className="mac-table__secondary">{p.phase} · {p.type}</p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.dedicated.map((a) => (
                          <Avatar key={a.name} initials={a.initials} color={a.avatarColor} size={22} title={a.name} />
                        ))}
                        <span style={{ fontSize: 12, color: 'var(--mac-text-secondary)' }}>
                          {p.dedicated.map((a) => a.name).join(', ')}
                        </span>
                      </div>
                    </td>
                    <td><StatusBadge status={p.progress} /></td>
                    <td className="mac-table__secondary">{p.dueDate.slice(5).replace('-', '/')}</td>
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
        </div>
        )}
      </section>
    </div>
  );
}
