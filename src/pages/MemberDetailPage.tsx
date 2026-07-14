import { useMemo } from 'react';
import { useTeam } from '../context/TeamContext';
import { useProjects } from '../context/ProjectContext';
import { StatusBadge, PriorityBadge, SizeBadge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { composeProjectName } from '../lib/projectNames';

interface Props {
  memberId: string;
  onBack: () => void;
}

function WorkRateArc({ value }: { value: number }) {
  const r = 54;
  const cx = 70, cy = 70;
  const describeArc = (pct: number) => {
    const angle = Math.PI * pct;
    const x = cx - r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x} ${y}`;
  };
  const color = value >= 85 ? 'var(--mac-red)' : value >= 65 ? 'var(--mac-orange)' : 'var(--mac-green)';

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={140} height={80} viewBox="0 0 140 80">
        <path d={describeArc(1)} fill="none" stroke="var(--mac-bg-control)" strokeWidth={10} strokeLinecap="round" />
        <path d={describeArc(value / 100)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
      </svg>
      <div style={{ marginTop: -18, fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}%</div>
      <div style={{ fontSize: 11, color: 'var(--mac-text-tertiary)', marginTop: 4 }}>Work Rate</div>
    </div>
  );
}

function StatTile({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{ background: 'var(--mac-bg-grouped)', borderRadius: 8, padding: '14px 16px', flex: 1, minWidth: 110 }}>
      <p style={{ fontSize: 11, color: 'var(--mac-text-secondary)', marginBottom: 6, fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: accent ?? 'var(--mac-text-primary)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--mac-text-tertiary)', marginTop: 5 }}>{sub}</p>}
    </div>
  );
}

export function MemberDetailPage({ memberId, onBack }: Props) {
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

  if (!member) {
    return <div className="page"><p>Member not found.</p></div>;
  }

  const statusColor = member.status === 'Busy' ? 'var(--mac-orange)' : 'var(--mac-green)';
  const available = 100 - member.workRate;

  return (
    <div className="page page--wide">
      <button
        type="button"
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--mac-accent)', fontSize: 13, fontFamily: 'var(--font-family)',
          marginBottom: 20, padding: 0 }}
      >
        ← Back to Team
      </button>

      <div className="member-hero">
        <Avatar initials={member.initials} color={member.avatarColor} size={64} title={member.name} />
        <div className="member-hero__info">
          <h1 className="page-title" style={{ marginBottom: 2 }}>{member.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--mac-text-secondary)', marginBottom: 8 }}>{member.role}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
              background: member.status === 'Busy' ? 'var(--tint-warning-bg)' : 'var(--tint-success-bg)',
              color: statusColor,
            }}>
              {member.status}
            </span>
            <span style={{ fontSize: 12, color: 'var(--mac-text-tertiary)' }}>
              Joined {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <WorkRateArc value={member.workRate} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatTile label="Dedicated Projects" value={dedicatedProjects.length} sub="as lead designer" />
        <StatTile label="Backup Projects" value={backupProjects.length} sub="as support" />
        <StatTile label="Availability" value={`${available}%`}
          accent={available >= 30 ? 'var(--mac-green)' : available >= 15 ? 'var(--mac-orange)' : 'var(--mac-red)'}
          sub={available >= 30 ? 'Can take new work' : available >= 15 ? 'Partially free' : 'Near capacity'} />
      </div>

      <div className="mac-group" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mac-text-primary)' }}>Capacity Usage</span>
          <span style={{ fontSize: 12, color: 'var(--mac-text-secondary)' }}>
            {member.workRate}% used · {available}% free
          </span>
        </div>
        <div style={{ height: 10, background: 'var(--mac-bg-control)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${member.workRate}%`,
            background: member.workRate >= 85 ? 'var(--mac-red)' : member.workRate >= 70 ? 'var(--mac-orange)' : 'var(--mac-green)',
            borderRadius: 99, transition: 'width 0.4s ease',
          }} />
        </div>
        {member.primaryFocus && (
          <p style={{ fontSize: 12, color: 'var(--mac-text-secondary)', marginTop: 12 }}>
            <strong style={{ color: 'var(--mac-text-primary)' }}>Primary focus:</strong> {member.primaryFocus}
          </p>
        )}
      </div>

      <div className="member-projects-grid">
        <section className="mac-group">
          <div className="mac-group__header">
            <h2 className="mac-group__title">Dedicated Lead ({dedicatedProjects.length})</h2>
          </div>
          {dedicatedProjects.length === 0 ? (
            <p style={{ padding: 16, fontSize: 13, color: 'var(--mac-text-tertiary)' }}>No dedicated projects.</p>
          ) : (
            <div className="mac-table-wrap">
              <table className="mac-table">
                <thead><tr><th>Project</th><th>Progress</th><th>Due</th></tr></thead>
                <tbody>
                  {dedicatedProjects.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <p className="mac-table__primary">{composeProjectName(p.projectName, p.iterationLabel) || p.name}</p>
                        <SizeBadge size={p.size} />
                      </td>
                      <td><StatusBadge status={p.progress} /></td>
                      <td className="mac-table__secondary">{p.dueDate.slice(5).replace('-', '/')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mac-group">
          <div className="mac-group__header">
            <h2 className="mac-group__title">Backup Support ({backupProjects.length})</h2>
          </div>
          {backupProjects.length === 0 ? (
            <p style={{ padding: 16, fontSize: 13, color: 'var(--mac-text-tertiary)' }}>No backup projects.</p>
          ) : (
            <div className="mac-table-wrap">
              <table className="mac-table">
                <thead><tr><th>Project</th><th>Progress</th><th>Priority</th></tr></thead>
                <tbody>
                  {backupProjects.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <p className="mac-table__primary">{composeProjectName(p.projectName, p.iterationLabel) || p.name}</p>
                      </td>
                      <td><StatusBadge status={p.progress} /></td>
                      <td><PriorityBadge level={p.priority} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
