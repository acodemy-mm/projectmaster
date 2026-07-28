import { useMemo } from 'react';
import { useTeam } from '../context/TeamContext';
import { useProjects } from '../context/ProjectContext';
import { StatusBadge, PriorityBadge, SizeBadge, DesignStageBadge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { ProjectTitle } from '../components/ProjectTitle';
import { formatJoinDate, formatMembershipDuration } from '../lib/memberTenure';
import {
  effectiveDesignStage,
  progressSortRank,
  type Project,
} from '../data/mockData';

interface Props {
  memberId: string;
  onBack: () => void;
  onViewProject?: (id: string) => void;
}

type AssignmentRole = 'Lead' | 'Backup';

interface AssignedProject {
  project: Project;
  role: AssignmentRole;
}

function WorkRateArc({ value }: { value: number }) {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const describeArc = (pct: number) => {
    const angle = Math.PI * pct;
    const x = cx - r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x} ${y}`;
  };
  const color = value >= 85 ? 'var(--mac-red)' : value >= 65 ? 'var(--mac-orange)' : 'var(--mac-green)';

  return (
    <div className="member-workrate">
      <svg width={140} height={80} viewBox="0 0 140 80" aria-hidden="true">
        <path d={describeArc(1)} fill="none" stroke="var(--mac-bg-control)" strokeWidth={10} strokeLinecap="round" />
        <path d={describeArc(value / 100)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
      </svg>
      <p className="member-workrate__value" style={{ color }}>{value}%</p>
      <p className="member-workrate__label">Work Rate</p>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="member-stat">
      <p className="member-stat__label">{label}</p>
      <p className="member-stat__value" style={accent ? { color: accent } : undefined}>{value}</p>
      {sub && <p className="member-stat__sub">{sub}</p>}
    </div>
  );
}

export function MemberDetailPage({ memberId, onBack, onViewProject }: Props) {
  const { members } = useTeam();
  const { projects } = useProjects();
  const member = members.find((m) => m.id === memberId);

  const dedicatedProjects = useMemo(
    () => projects.filter((p) => p.dedicatedMemberIds.includes(memberId)),
    [projects, memberId]
  );
  const backupProjects = useMemo(
    () => projects.filter((p) => p.backupMemberIds.includes(memberId)),
    [projects, memberId]
  );

  const assignedProjects = useMemo((): AssignedProject[] => {
    const rows: AssignedProject[] = [
      ...dedicatedProjects.map((project) => ({ project, role: 'Lead' as const })),
      ...backupProjects.map((project) => ({ project, role: 'Backup' as const })),
    ];
    return rows.sort((a, b) => {
      const byProgress =
        progressSortRank(a.project.progress) - progressSortRank(b.project.progress);
      if (byProgress !== 0) return byProgress;
      if (a.role !== b.role) return a.role === 'Lead' ? -1 : 1;
      return (a.project.projectName || a.project.name).localeCompare(
        b.project.projectName || b.project.name
      );
    });
  }, [dedicatedProjects, backupProjects]);

  if (!member) {
    return <div className="page"><p>Member not found.</p></div>;
  }

  const available = 100 - member.workRate;

  return (
    <div className="page page--wide member-detail">
      <button type="button" className="member-detail__back" onClick={onBack}>
        ← Back to Team
      </button>

      <header className="member-hero">
        <Avatar initials={member.initials} color={member.avatarColor} src={member.avatarUrl} size={64} title={member.name} />
        <div className="member-hero__info">
          <h1 className="page-title member-hero__name">{member.name}</h1>
          <p className="member-hero__role">{member.role}</p>
          <div className="member-hero__meta">
            <span className={`member-chip member-chip--${member.status === 'Busy' ? 'warning' : 'success'}`}>
              {member.status}
            </span>
            <span className="member-hero__joined">Joined {formatJoinDate(member.joinDate)}</span>
            <span className="member-chip member-chip--info">
              Duration {formatMembershipDuration(member.joinDate)}
            </span>
          </div>
        </div>
        <WorkRateArc value={member.workRate} />
      </header>

      <div className="member-stat-row">
        <StatTile label="Join date" value={formatJoinDate(member.joinDate)} sub="team start date" />
        <StatTile label="Duration" value={formatMembershipDuration(member.joinDate)} sub="time on team" />
        <StatTile label="Assigned" value={assignedProjects.length} sub="all projects" />
        <StatTile label="Dedicated" value={dedicatedProjects.length} sub="as lead designer" />
        <StatTile label="Backup" value={backupProjects.length} sub="as support" />
        <StatTile
          label="Availability"
          value={`${available}%`}
          accent={available >= 30 ? 'var(--mac-green)' : available >= 15 ? 'var(--mac-orange)' : 'var(--mac-red)'}
          sub={available >= 30 ? 'Can take new work' : available >= 15 ? 'Partially free' : 'Near capacity'}
        />
      </div>

      <section className="mac-group member-capacity">
        <div className="member-capacity__header">
          <h2 className="member-capacity__title">Capacity Usage</h2>
          <p className="member-capacity__meta">
            {member.workRate}% used · {available}% free
          </p>
        </div>
        <div className="member-capacity__track">
          <div
            className="member-capacity__fill"
            style={{
              width: `${member.workRate}%`,
              background:
                member.workRate >= 85
                  ? 'var(--mac-red)'
                  : member.workRate >= 70
                    ? 'var(--mac-orange)'
                    : 'var(--mac-green)',
            }}
          />
        </div>
        {member.primaryFocus && (
          <p className="member-capacity__focus">
            <span className="member-capacity__focus-label">Primary focus</span>
            {member.primaryFocus}
          </p>
        )}
      </section>

      <section className="mac-group">
        <div className="mac-group__header">
          <h2 className="mac-group__title">
            All Assigned Projects ({assignedProjects.length})
          </h2>
        </div>
        {assignedProjects.length === 0 ? (
          <p className="member-projects-empty">
            No projects assigned yet. Assign this member as Lead or Backup in Project Master.
          </p>
        ) : (
          <div className="mac-table-wrap">
            <table className="mac-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Role</th>
                  <th>Progress</th>
                  <th>Stage</th>
                  <th>Due</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {assignedProjects.map(({ project: p, role }) => (
                  <tr key={`${p.id}-${role}`}>
                    <td>
                      {onViewProject ? (
                        <ProjectTitle
                          project={p}
                          onClick={() => onViewProject(p.id)}
                          showCategory
                        />
                      ) : (
                        <p className="mac-table__primary">{p.name}</p>
                      )}
                      <SizeBadge size={p.size} />
                    </td>
                    <td>
                      <span
                        className="mac-badge"
                        style={{
                          background: role === 'Lead' ? 'var(--tint-primary-bg)' : 'var(--tint-neutral-bg)',
                          color: role === 'Lead' ? 'var(--tint-primary-fg)' : 'var(--tint-neutral-fg)',
                        }}
                      >
                        {role}
                      </span>
                    </td>
                    <td><StatusBadge status={p.progress} /></td>
                    <td><DesignStageBadge stage={effectiveDesignStage(p)} /></td>
                    <td className="mac-table__secondary">{p.dueDate.slice(5).replace('-', '/')}</td>
                    <td><PriorityBadge level={p.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
