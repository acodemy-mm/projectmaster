import { useState, useEffect, useMemo, Fragment, type FormEvent } from 'react';
import {
  PROJECT_SIZES, PROJECT_PHASES, PROJECT_TYPES, PRIORITY_LEVELS, PROGRESS_STATUSES,
  type Project, type ProgressStatus, type PriorityLevel, type ProjectSize,
} from '../data/mockData';
import { useProjects, dateToGanttStart, datesToGanttDuration } from '../context/ProjectContext';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../auth/AuthContext';
import { StatusBadge, PriorityBadge, SizeBadge } from '../components/Badge';
import { AvatarGroup } from '../components/Avatar';
import { ProjectTitle } from '../components/ProjectTitle';
import { PROGRESS_GANTT_COLORS } from '../lib/progressColors';
import {
  composeProjectName,
  getUniqueProjectNames,
  groupProjectsByCategory,
} from '../lib/projectNames';
import {
  buildTimelineWindow,
  defaultWeekAnchor,
  projectBarInWindow,
  shiftWeeks,
  startOfWeek,
  todayMarkerPercent,
  type RoadmapScale,
} from '../lib/roadmapTimeline';
import {
  IconTable, IconCalendar, IconSearch, IconPlus, IconEdit, IconTrash,
  IconChevronLeft, IconChevronRight,
} from '../icons';

/* ─── Draft type ─────────────────────────────────────────────────────────── */
interface ProjectDraft {
  projectName: string;
  iterationLabel: string;
  size: ProjectSize;
  phase: string;
  type: string;
  startDate: string;
  dueDate: string;
  dedicatedMemberIds: string[];
  backupMemberIds: string[];
  priority: PriorityLevel;
  complexity: PriorityLevel;
  progress: ProgressStatus;
  pm: string;
  description: string;
  developerName: string;
  wireframeLink: string;
  figmaLink: string;
}

function emptyDraft(): ProjectDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    projectName: '',
    iterationLabel: '',
    size: 'Medium',
    phase: 'Web',
    type: 'New Design',
    startDate: today,
    dueDate: today,
    dedicatedMemberIds: [],
    backupMemberIds: [],
    priority: 'Medium',
    complexity: 'Medium',
    progress: 'Planning',
    pm: '',
    description: '',
    developerName: '',
    wireframeLink: '',
    figmaLink: '',
  };
}

/* ─── Multi-select toggle helper ─────────────────────────────────────────── */
function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

/* ─── Member pill picker ─────────────────────────────────────────────────── */
function MemberPicker({
  label, selectedIds, onChange,
}: { label: string; selectedIds: string[]; onChange: (ids: string[]) => void }) {
  const { members } = useTeam();
  return (
    <div className="team-form__field team-form__field--wide">
      <span>{label}</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        {members.map((m) => {
          const active = selectedIds.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(toggleId(selectedIds, m.id))}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 99,
                border: `1.5px solid ${active ? m.avatarColor : 'var(--mac-border)'}`,
                background: active ? m.avatarColor + '1a' : 'var(--mac-bg-card)',
                color: active ? m.avatarColor : 'var(--mac-text-secondary)',
                fontFamily: 'var(--font-family)', fontSize: 'var(--text-label1-size)',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.12s ease',
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: m.avatarColor, color: 'var(--color-text-on-inverse)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, flexShrink: 0,
              }}>{m.initials}</span>
              {m.name}
            </button>
          );
        })}
      </div>
      {selectedIds.length === 0 && (
        <p style={{ fontSize: 11, color: 'var(--mac-text-tertiary)', marginTop: 4 }}>
          Select one or more members above.
        </p>
      )}
    </div>
  );
}

/* ─── Project form ───────────────────────────────────────────────────────── */
function ProjectForm({
  title, draft, setDraft, onSubmit, onCancel, existingProjectNames,
}: {
  title: string;
  draft: ProjectDraft;
  setDraft: (d: ProjectDraft) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  existingProjectNames: string[];
}) {
  return (
    <section className="mac-group" style={{ marginBottom: 'var(--spacing-5)' }}>
      <div className="mac-group__header">
        <h2 className="mac-group__title">{title}</h2>
        <button type="button" className="mac-btn mac-btn--ghost" onClick={onCancel}>Cancel</button>
      </div>
      <form className="team-form" onSubmit={onSubmit} noValidate>
        {/* Row 1 */}
        <label className="team-form__field team-form__field--wide">
          Project name
          <input
            list="project-name-categories"
            value={draft.projectName}
            onChange={(e) => setDraft({ ...draft, projectName: e.target.value })}
            placeholder="e.g. Smart Pay — reuse when the project returns"
            required
          />
          <datalist id="project-name-categories">
            {existingProjectNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label className="team-form__field team-form__field--wide">
          Feature / iteration
          <input
            value={draft.iterationLabel}
            onChange={(e) => setDraft({ ...draft, iterationLabel: e.target.value })}
            placeholder="e.g. Pay Advance, Phase 2 (optional for first engagement)"
          />
        </label>
        <label className="team-form__field">
          Phase
          <select value={draft.phase} onChange={(e) => setDraft({ ...draft, phase: e.target.value })}>
            {PROJECT_PHASES.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="team-form__field">
          Type
          <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
            {PROJECT_TYPES.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="team-form__field">
          Size
          <select value={draft.size} onChange={(e) => setDraft({ ...draft, size: e.target.value as ProjectSize })}>
            {PROJECT_SIZES.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="team-form__field">
          Priority
          <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as PriorityLevel })}>
            {PRIORITY_LEVELS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="team-form__field">
          Complexity
          <select value={draft.complexity} onChange={(e) => setDraft({ ...draft, complexity: e.target.value as PriorityLevel })}>
            {PRIORITY_LEVELS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="team-form__field">
          Progress
          <select value={draft.progress} onChange={(e) => setDraft({ ...draft, progress: e.target.value as ProgressStatus })}>
            {PROGRESS_STATUSES.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="team-form__field">
          Start date
          <input type="date" value={draft.startDate}
            onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
        </label>
        <label className="team-form__field">
          Due date
          <input type="date" value={draft.dueDate}
            onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
        </label>
        <label className="team-form__field team-form__field--wide">
          Project Manager
          <input value={draft.pm}
            onChange={(e) => setDraft({ ...draft, pm: e.target.value })}
            placeholder="e.g. Ko Sai Phone Wann" />
        </label>
        <label className="team-form__field team-form__field--wide">
          Developer name
          <input value={draft.developerName}
            onChange={(e) => setDraft({ ...draft, developerName: e.target.value })}
            placeholder="e.g. Ko Aung Myint" />
        </label>
        <label className="team-form__field team-form__field--wide">
          Description
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Brief project overview and scope"
            rows={3}
            style={{
              padding: '9px 12px',
              border: '1px solid var(--mac-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--mac-bg-card)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-body1-size)',
              color: 'var(--mac-text-primary)',
              resize: 'vertical',
            }}
          />
        </label>
        <label className="team-form__field team-form__field--wide">
          Wireframe link
          <input type="text" value={draft.wireframeLink}
            onChange={(e) => setDraft({ ...draft, wireframeLink: e.target.value })}
            placeholder="https://www.figma.com/file/..." />
        </label>
        <label className="team-form__field team-form__field--wide">
          Figma link
          <input type="text" value={draft.figmaLink}
            onChange={(e) => setDraft({ ...draft, figmaLink: e.target.value })}
            placeholder="https://www.figma.com/design/..." />
        </label>

        {/* Member assignment pickers */}
        <MemberPicker
          label="Main Assignees (Dedicated Lead)"
          selectedIds={draft.dedicatedMemberIds}
          onChange={(ids) => setDraft({
            ...draft,
            dedicatedMemberIds: ids,
            // Keep lead/backup mutually exclusive per member
            backupMemberIds: draft.backupMemberIds.filter((id) => !ids.includes(id)),
          })}
        />
        <MemberPicker
          label="Backup Support"
          selectedIds={draft.backupMemberIds}
          onChange={(ids) => setDraft({
            ...draft,
            backupMemberIds: ids,
            dedicatedMemberIds: draft.dedicatedMemberIds.filter((id) => !ids.includes(id)),
          })}
        />

        <div className="team-form__actions">
          <button type="submit" className="mac-btn mac-btn--primary">
            Save project
          </button>
        </div>
      </form>
    </section>
  );
}

/* ─── Table View ─────────────────────────────────────────────────────────── */
const COLUMNS = [
  { key: 'project',   label: 'Project',      width: '22%' },
  { key: 'phase',     label: 'Phase / Type',  width: '11%' },
  { key: 'plan',      label: 'Plan',          width: '10%' },
  { key: 'assignees', label: 'Assignees',     width: '16%' },
  { key: 'prio',      label: 'Prio / Comp',   width: '12%' },
  { key: 'progress',  label: 'Progress',      width: '11%' },
  { key: 'pm',        label: 'PM',            width: '12%' },
  { key: 'actions',   label: '',              width: '6%'  },
];

function TableView({
  projects, isSuperAdmin, onEdit, onDelete, onViewProject,
}: {
  projects: Project[]; isSuperAdmin: boolean;
  onEdit: (p: Project) => void; onDelete: (id: string) => void;
  onViewProject: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const groups = useMemo(() => groupProjectsByCategory(projects), [projects]);

  return (
    <div className="mac-table-wrap">
      <table className="mac-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} style={{ width: col.width }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.projectName}>
              {group.projects.length > 1 && (
                <tr key={`cat-${group.projectName}`} className="project-category-row">
                  <td colSpan={COLUMNS.length}>
                    <span className="project-category__title">{group.projectName}</span>
                    <span className="project-category__meta">
                      {group.projects.length} engagements
                    </span>
                  </td>
                </tr>
              )}
              {group.projects.map((proj) => (
            <tr key={proj.id}>
              <td>
                <ProjectTitle
                  project={proj}
                  onClick={() => onViewProject(proj.id)}
                  showCategory={group.projects.length === 1}
                />
                <SizeBadge size={proj.size} />
              </td>
              <td>
                <p className="mac-table__primary" style={{ fontWeight: 500 }}>{proj.phase}</p>
                <p className="mac-table__secondary">{proj.type}</p>
              </td>
              <td>
                <p className="mac-table__secondary">
                  <span style={{ color: 'var(--mac-text-tertiary)' }}>S: </span>
                  {proj.startDate.slice(5).replace('-', '/')}
                </p>
                <p className="mac-table__secondary">
                  <span style={{ color: 'var(--mac-text-tertiary)' }}>D: </span>
                  {proj.dueDate.slice(5).replace('-', '/')}
                </p>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'var(--mac-text-tertiary)', fontWeight: 600, width: 14 }}>L</span>
                    <AvatarGroup assignees={proj.dedicated} size={22} />
                    {proj.dedicated.length === 0 && (
                      <span style={{ fontSize: 11, color: 'var(--mac-text-tertiary)' }}>—</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'var(--mac-text-tertiary)', fontWeight: 600, width: 14 }}>B</span>
                    <AvatarGroup assignees={proj.backup} size={22} />
                    {proj.backup.length === 0 && (
                      <span style={{ fontSize: 11, color: 'var(--mac-text-tertiary)' }}>—</span>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <PriorityBadge level={proj.priority} />
                  <PriorityBadge level={proj.complexity} />
                </div>
              </td>
              <td><StatusBadge status={proj.progress} /></td>
              <td>
                <p className="mac-table__secondary" style={{ fontWeight: 500 }}>{proj.pm}</p>
              </td>
              <td>
                {isSuperAdmin && (
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="mac-btn mac-btn--icon"
                      title="Edit"
                      onClick={() => onEdit(proj)}
                    >
                      <IconEdit size={14} />
                    </button>
                    {confirmId === proj.id ? (
                      <>
                        <button
                          type="button"
                          className="mac-btn mac-btn--primary"
                          style={{ background: 'var(--mac-red)', padding: '4px 8px', fontSize: 11 }}
                          onClick={() => { onDelete(proj.id); setConfirmId(null); }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className="mac-btn mac-btn--secondary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => setConfirmId(null)}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="mac-btn mac-btn--icon"
                        title="Delete"
                        style={{ color: 'var(--mac-red)' }}
                        onClick={() => setConfirmId(proj.id)}
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
              ))}
            </Fragment>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} style={{ textAlign: 'center', padding: 40, color: 'var(--mac-text-secondary)' }}>
                No projects match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Gantt / Roadmap ────────────────────────────────────────────────────── */
function RoadmapView({
  projects,
  onViewProject,
  scale,
  weekAnchor,
  onScaleChange,
  onWeekAnchorChange,
}: {
  projects: Project[];
  onViewProject: (id: string) => void;
  scale: RoadmapScale;
  weekAnchor: Date;
  onScaleChange: (scale: RoadmapScale) => void;
  onWeekAnchorChange: (date: Date) => void;
}) {
  const groups = useMemo(() => groupProjectsByCategory(projects), [projects]);
  const timeline = useMemo(
    () => buildTimelineWindow(scale, weekAnchor),
    [scale, weekAnchor]
  );
  const todayPct = todayMarkerPercent(timeline);
  const colCount = timeline.columns.length;

  if (projects.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: 40, color: 'var(--mac-text-secondary)' }}>
        No projects match your filters.
      </p>
    );
  }

  return (
    <div className="roadmap">
      <div className="roadmap-toolbar">
        <div className="mac-segmented" role="tablist" aria-label="Timeline scale">
          {(['month', 'week'] as RoadmapScale[]).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={scale === s}
              className={`mac-segmented__btn${scale === s ? ' mac-segmented__btn--active' : ''}`}
              onClick={() => onScaleChange(s)}
            >
              {s === 'month' ? 'Month' : 'Week'}
            </button>
          ))}
        </div>

        {scale === 'week' && (
          <div className="roadmap-nav">
            <button
              type="button"
              className="mac-btn mac-btn--icon"
              aria-label="Previous weeks"
              onClick={() => onWeekAnchorChange(shiftWeeks(weekAnchor, -1))}
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="mac-btn mac-btn--secondary"
              onClick={() => onWeekAnchorChange(startOfWeek(new Date()))}
            >
              Today
            </button>
            <button
              type="button"
              className="mac-btn mac-btn--icon"
              aria-label="Next weeks"
              onClick={() => onWeekAnchorChange(shiftWeeks(weekAnchor, 1))}
            >
              <IconChevronRight size={16} />
            </button>
            <p className="roadmap-nav__range">{timeline.rangeLabel}</p>
          </div>
        )}

        {scale === 'month' && (
          <p className="roadmap-nav__range">{timeline.rangeLabel}</p>
        )}
      </div>

      <div className={`mac-table-wrap mac-table-wrap--roadmap${scale === 'week' ? ' mac-table-wrap--roadmap-week' : ''}`}>
        <table className={`mac-table mac-table--roadmap mac-table--roadmap-${scale}`}>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Project</th>
              <th style={{ width: '9%' }}>Status</th>
              <th style={{ width: '9%' }}>Assignees</th>
              {timeline.columns.map((col) => (
                <th key={col.key} className="gantt-scale-header">
                  <span className="gantt-scale-header__label">{col.label}</span>
                  {col.subLabel && (
                    <span className="gantt-scale-header__sub">{col.subLabel}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.projectName}>
                {group.projects.length > 1 && (
                  <tr className="project-category-row">
                    <td colSpan={3 + colCount}>
                      <span className="project-category__title">{group.projectName}</span>
                      <span className="project-category__meta">
                        {group.projects.length} engagements
                      </span>
                    </td>
                  </tr>
                )}
                {group.projects.map((proj) => {
                  const bar = projectBarInWindow(proj.startDate, proj.dueDate, timeline);
                  const dateLabel = proj.startDate && proj.dueDate
                    ? `${proj.startDate.slice(5, 10)} → ${proj.dueDate.slice(5, 10)}`
                    : '';
                  return (
                    <tr key={proj.id}>
                      <td>
                        <ProjectTitle
                          project={proj}
                          onClick={() => onViewProject(proj.id)}
                          showCategory={group.projects.length === 1}
                        />
                      </td>
                      <td><StatusBadge status={proj.progress} /></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <AvatarGroup assignees={proj.dedicated} size={20} />
                          {proj.backup.length > 0 && <AvatarGroup assignees={proj.backup} size={18} />}
                        </div>
                      </td>
                      <td colSpan={colCount}>
                        <div
                          className="gantt-track"
                          style={{ ['--gantt-cols' as string]: String(colCount) }}
                        >
                          <div className="gantt-track__grid" aria-hidden="true">
                            {timeline.columns.map((col) => (
                              <div key={col.key} className="gantt-track__slot" />
                            ))}
                          </div>
                          {todayPct != null && (
                            <div
                              className="gantt-today"
                              style={{ left: `${todayPct}%` }}
                              title="Today"
                            />
                          )}
                          {bar && (
                            <div
                              className="gantt-bar"
                              style={{
                                left: `${bar.left}%`,
                                width: `${bar.width}%`,
                                background: PROGRESS_GANTT_COLORS[proj.progress],
                              }}
                            >
                              <span className="gantt-bar__label">{dateLabel}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
type ViewMode = 'table' | 'roadmap';
type ProgressFilter = ProgressStatus | 'all';

export function ProjectMasterPage({
  onViewProject,
  editProjectId = null,
  onEditProjectHandled,
}: {
  onViewProject: (id: string) => void;
  editProjectId?: string | null;
  onEditProjectHandled?: () => void;
}) {
  const { isSuperAdmin } = useAuth();
  const { projects, addProject, updateProject, removeProject, error: projectError } = useProjects();
  const { members } = useTeam();

  const [view, setView]         = useState<ViewMode>('table');
  const [roadmapScale, setRoadmapScale] = useState<RoadmapScale>('month');
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => startOfWeek(new Date()));
  const [search, setSearch]     = useState('');
  const [projectNameFilter, setProjectNameFilter] = useState<string>('all');
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft]       = useState<ProjectDraft>(emptyDraft());

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !query ||
        p.projectName.toLowerCase().includes(query) ||
        p.iterationLabel.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.pm.toLowerCase().includes(query);
      const matchesProgress =
        progressFilter === 'all' || p.progress === progressFilter;
      const matchesProjectName =
        projectNameFilter === 'all' || p.projectName === projectNameFilter;
      return matchesSearch && matchesProgress && matchesProjectName;
    });
  }, [projects, search, progressFilter, projectNameFilter]);

  function handleRoadmapScaleChange(next: RoadmapScale) {
    setRoadmapScale(next);
    if (next === 'week') {
      setWeekAnchor(defaultWeekAnchor(filteredProjects));
    }
  }

  const categoryCount = useMemo(
    () => groupProjectsByCategory(filteredProjects).length,
    [filteredProjects]
  );

  const existingProjectNames = useMemo(() => getUniqueProjectNames(projects), [projects]);

  function openCreate() {
    setEditingId(null);
    setDraft(emptyDraft());
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditingId(p.id);
    setDraft({
      projectName: p.projectName, iterationLabel: p.iterationLabel,
      size: p.size, phase: p.phase, type: p.type,
      startDate: p.startDate, dueDate: p.dueDate,
      dedicatedMemberIds: p.dedicatedMemberIds ?? [],
      backupMemberIds: p.backupMemberIds ?? [],
      priority: p.priority, complexity: p.complexity, progress: p.progress, pm: p.pm ?? '',
      description: p.description ?? '', developerName: p.developerName ?? '',
      wireframeLink: p.wireframeLink ?? '', figmaLink: p.figmaLink ?? '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    if (!editProjectId) return;
    const project = projects.find((p) => p.id === editProjectId);
    if (project) openEdit(project);
    onEditProjectHandled?.();
    // Only react when parent requests edit for a specific project.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editProjectId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.projectName.trim()) return;
    const projectName = draft.projectName.trim();
    const iterationLabel = draft.iterationLabel.trim();
    const name = composeProjectName(projectName, iterationLabel);
    const ganttStart    = dateToGanttStart(draft.startDate);
    const ganttDuration = datesToGanttDuration(draft.startDate, draft.dueDate);
    const payload = {
      ...draft,
      projectName,
      iterationLabel,
      name,
      ganttStart,
      ganttDuration,
    };
    try {
      if (editingId) {
        await updateProject(editingId, payload, members);
      } else {
        await addProject(payload, members);
      }
      setShowForm(false);
      setEditingId(null);
      setDraft(emptyDraft());
    } catch {
      // error surfaced via ProjectContext.error
    }
  }

  return (
    <div className="page page--wide">
      <div className="page-header-row">
        <header className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Project Master List</h1>
          <p className="page-subtitle">Track deliverables, timelines, and resourcing across your team.</p>
        </header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="mac-segmented" role="tablist">
            {(['table', 'roadmap'] as ViewMode[]).map((v) => {
              const active = view === v;
              return (
                <button
                  key={v}
                  role="tab"
                  aria-selected={active}
                  className={`mac-segmented__btn${active ? ' mac-segmented__btn--active' : ''}`}
                  onClick={() => setView(v)}
                >
                  {v === 'table' ? <IconTable size={13} /> : <IconCalendar size={13} />}
                  {v === 'table' ? 'Table' : 'Roadmap'}
                </button>
              );
            })}
          </div>
          {isSuperAdmin && (
            <button type="button" className="mac-btn mac-btn--primary" onClick={openCreate}>
              <IconPlus size={14} color="var(--color-text-on-inverse)" /> Add Project
            </button>
          )}
        </div>
      </div>

      {projectError && (
        <div className="mac-alert" style={{ marginBottom: 16 }}>
          <div>
            <p className="mac-alert__title">Couldn’t save to Supabase</p>
            <p className="mac-alert__detail">{projectError}</p>
          </div>
        </div>
      )}

      {/* Project form */}
      {showForm && isSuperAdmin && (
        <ProjectForm
          title={editingId ? 'Edit Project' : 'New Project'}
          draft={draft}
          setDraft={setDraft}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
          existingProjectNames={existingProjectNames}
        />
      )}

      {/* Search + filters */}
      <div className="toolbar-row">
        <div className="mac-search">
          <IconSearch size={14} color="var(--mac-text-tertiary)" />
          <input
            type="search"
            placeholder="Search projects or PM…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-filters">
          <div className="toolbar-filter">
            <select
              className="toolbar-filter__select"
              value={projectNameFilter}
              onChange={(e) => setProjectNameFilter(e.target.value)}
              aria-label="Filter by project name"
            >
              <option value="all">All project names</option>
              {existingProjectNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="toolbar-filter">
            <select
              className="toolbar-filter__select"
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value as ProgressFilter)}
              aria-label="Filter by project progress"
            >
              <option value="all">All progress</option>
              {PROGRESS_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mac-group">
        {view === 'table' ? (
          <TableView
            projects={filteredProjects}
            isSuperAdmin={isSuperAdmin}
            onEdit={openEdit}
            onDelete={removeProject}
            onViewProject={onViewProject}
          />
        ) : (
          <RoadmapView
            projects={filteredProjects}
            onViewProject={onViewProject}
            scale={roadmapScale}
            weekAnchor={weekAnchor}
            onScaleChange={handleRoadmapScaleChange}
            onWeekAnchorChange={setWeekAnchor}
          />
        )}
        <div className="mac-pagination">
          <p className="mac-pagination__info">
            Showing {filteredProjects.length} of {projects.length} engagements
            {categoryCount > 0 && ` across ${categoryCount} project names`}
          </p>
        </div>
      </div>
    </div>
  );
}
