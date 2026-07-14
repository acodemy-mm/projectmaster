import { useState, type FormEvent } from 'react';
import { useTeam } from '../context/TeamContext';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../auth/AuthContext';
import {
  MEMBER_ROLES, MEMBER_STATUSES, AVATAR_PALETTE,
  type MemberRole, type MemberStatus, type TeamMember,
} from '../data/mockData';
import { Avatar } from '../components/Avatar';
import { calculateMemberWorkRate } from '../lib/workRate';
import { IconEdit, IconTrash, IconUsers } from '../icons';

interface DraftMember {
  name: string;
  role: MemberRole;
  status: MemberStatus;
  primaryFocus: string;
  avatarColor: string;
  joinDate: string;
}

function emptyDraft(): DraftMember {
  return {
    name: '',
    role: 'UI/UX Designer',
    status: 'Available',
    primaryFocus: '',
    avatarColor: AVATAR_PALETTE[0],
    joinDate: new Date().toISOString().slice(0, 10),
  };
}

export function TeamSetupPage() {
  const { isSuperAdmin } = useAuth();
  const { members, addMember, updateMember, removeMember, resetMembers, error: teamError } = useTeam();
  const { projects } = useProjects();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftMember>(emptyDraft());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setDraft(emptyDraft());
    setShowForm(true);
  }

  function openEdit(m: TeamMember) {
    setEditingId(m.id);
    setDraft({
      name: m.name,
      role: m.role,
      status: m.status,
      primaryFocus: m.primaryFocus,
      avatarColor: m.avatarColor,
      joinDate: m.joinDate,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    try {
      if (editingId) {
        await updateMember(editingId, draft);
      } else {
        await addMember(draft);
      }
      setShowForm(false);
      setEditingId(null);
      setDraft(emptyDraft());
    } catch {
      // error surfaced via TeamContext.error
    }
  }

  return (
    <div className="page page--wide">
      <header className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Team Member Setup</h1>
          <p className="page-subtitle">
            Manage your team roster — add, edit, or remove members.
            {!isSuperAdmin && ' (Read-only — Super Admin required to edit.)'}
          </p>
        </div>
        {isSuperAdmin && (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <button type="button" className="mac-btn mac-btn--secondary" onClick={resetMembers}>
              Reset roster
            </button>
            <button type="button" className="mac-btn mac-btn--primary" onClick={openCreate}>
              + Add member
            </button>
          </div>
        )}
      </header>

      {teamError && (
        <div className="mac-alert" style={{ marginBottom: 16 }}>
          <div>
            <p className="mac-alert__title">Couldn’t save to Supabase</p>
            <p className="mac-alert__detail">{teamError}</p>
          </div>
        </div>
      )}

      {/* Member form */}
      {showForm && isSuperAdmin && (
        <section className="mac-group" style={{ marginBottom: 'var(--spacing-5)' }}>
          <div className="mac-group__header">
            <h2 className="mac-group__title">{editingId ? 'Edit Member' : 'New Member'}</h2>
            <button type="button" className="mac-btn mac-btn--ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
          <form className="team-form" onSubmit={handleSubmit}>
            <label className="team-form__field">
              Full name
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Aung Aung"
                required
              />
            </label>
            <label className="team-form__field">
              Role
              <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as MemberRole })}>
                {MEMBER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="team-form__field">
              Status
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as MemberStatus })}>
                {MEMBER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="team-form__field team-form__field--wide">
              Primary focus
              <input
                value={draft.primaryFocus}
                onChange={(e) => setDraft({ ...draft, primaryFocus: e.target.value })}
                placeholder="e.g. Customer 360 View"
              />
            </label>
            <div className="team-form__field team-form__field--wide" style={{ background: 'var(--mac-bg-grouped)', borderRadius: 8, padding: '10px 14px', gap: 4 }}>
              <span style={{ color: 'var(--mac-text-tertiary)', fontSize: 'var(--text-label2-size)' }}>
                <strong>Work rate</strong> is calculated from assignments in <strong>Project Master</strong>
                {editingId ? (
                  <> — currently <strong>{calculateMemberWorkRate(editingId, projects)}%</strong></>
                ) : (
                  <> — starts at <strong>0%</strong> until assigned</>
                )}
                . Lead: Small 20%, Medium 30%, Large 40%; backup is half. Launched and Hands-off projects are excluded.
              </span>
            </div>
            <div className="team-form__field team-form__field--wide">
              <span>Avatar color</span>
              <div className="team-swatches">
                {AVATAR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`team-swatch${draft.avatarColor === c ? ' team-swatch--active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setDraft({ ...draft, avatarColor: c })}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
            <div className="team-form__actions">
              <button type="submit" className="mac-btn mac-btn--primary">
                {editingId ? 'Save changes' : 'Add member'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Roster table */}
      <section className="mac-group">
        <div className="mac-group__header">
          <h2 className="mac-group__title">Team Roster ({members.length})</h2>
        </div>
        {members.length === 0 ? (
          <div className="team-empty">
            <IconUsers size={32} color="var(--mac-text-tertiary)" />
            <p>No team members yet. Add your first member to get started.</p>
          </div>
        ) : (
          <div className="mac-table-wrap">
            <table className="mac-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Work Rate</th>
                  <th>Primary Focus</th>
                  <th>Projects</th>
                  {isSuperAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                        <Avatar initials={m.initials} color={m.avatarColor} size={32} title={m.name} />
                        <span className="mac-table__primary">{m.name}</span>
                      </div>
                    </td>
                    <td className="mac-table__secondary">{m.role}</td>
                    <td>
                      <span style={{
                        padding: '2px 10px', borderRadius: 99, fontSize: 'var(--text-label2-size)',
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                        background: m.status === 'Busy' ? 'var(--tint-warning-bg)' : 'var(--tint-success-bg)',
                        color: m.status === 'Busy' ? 'var(--tint-warning-fg)' : 'var(--tint-success-fg)',
                      }}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                        <div style={{ width: 70, height: 6, background: 'var(--mac-bg-control)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${m.workRate}%`, borderRadius: 99,
                            background: m.workRate >= 85 ? 'var(--mac-red)' : m.workRate >= 65 ? 'var(--mac-orange)' : 'var(--mac-green)',
                          }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-label1-size)', color: 'var(--mac-text-secondary)' }}>{m.workRate}%</span>
                      </div>
                    </td>
                    <td className="mac-table__secondary">{m.primaryFocus || '—'}</td>
                    <td className="mac-table__secondary">
                      {projects.filter((p) => p.dedicatedMemberIds.includes(m.id)).length} lead
                      {' · '}
                      {projects.filter((p) => p.backupMemberIds.includes(m.id)).length} backup
                    </td>
                    {isSuperAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--spacing-1)', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="mac-btn mac-btn--icon"
                            title="Edit"
                            onClick={() => openEdit(m)}
                          >
                            <IconEdit size={15} />
                          </button>
                          {confirmDelete === m.id ? (
                            <>
                              <button
                                type="button"
                                className="mac-btn mac-btn--primary"
                                style={{ background: 'var(--mac-red)', padding: '4px 10px', fontSize: 'var(--text-label1-size)' }}
                                onClick={() => { removeMember(m.id); setConfirmDelete(null); }}
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                className="mac-btn mac-btn--secondary"
                                style={{ padding: '4px 10px', fontSize: 'var(--text-label1-size)' }}
                                onClick={() => setConfirmDelete(null)}
                              >
                                No
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="mac-btn mac-btn--icon"
                              title="Remove"
                              style={{ color: 'var(--mac-red)' }}
                              onClick={() => setConfirmDelete(m.id)}
                            >
                              <IconTrash size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
