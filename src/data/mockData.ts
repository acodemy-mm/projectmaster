export type ProgressStatus = 'On Track' | 'Support' | 'Delayed' | 'Hands-off' | 'Launched' | 'Planning' | 'Paused';
export type DesignStage = 'Not Started' | 'Wireframe' | 'Review' | 'Design' | 'Handoff';
export type PriorityLevel  = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectSize     = 'Small' | 'Medium' | 'Large';
export type MemberStatus    = 'Busy' | 'Available';
export type MemberRole      = 'UI/UX Designer' | 'Senior Designer' | 'Design Lead' | 'UX Researcher';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  /** Public Supabase Storage URL for profile photo */
  avatarUrl: string;
  role: MemberRole;
  status: MemberStatus;
  primaryFocus: string;
  /** 0–100 — auto-calculated from active project assignments */
  workRate: number;
  joinDate: string;
}

export interface Assignee {
  name: string;
  initials: string;
  avatarColor: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  /** Stable product/initiative category — engagements can return under the same name */
  projectName: string;
  /** Feature round under the project name (e.g. Pay Advance, Phase 2) */
  iterationLabel: string;
  /** Derived display title — projectName plus iteration when set */
  name: string;
  size: ProjectSize;
  phase: string;
  type: string;
  startDate: string;
  dueDate: string;
  dedicated: Assignee[];
  backup: Assignee[];
  dedicatedMemberIds: string[];
  backupMemberIds: string[];
  priority: PriorityLevel;
  complexity: PriorityLevel;
  progress: ProgressStatus;
  /** Design-process stage (wireframe → review → design → handoff) */
  designStage: DesignStage;
  /** ISO date — initial prototype / wireframe kickoff */
  wireframeStart: string;
  /** ISO date — wireframe / prototype delivered for review */
  wireframeDelivered: string;
  /** ISO date — design timeline started after review */
  designStart: string;
  /** ISO date — handoff delivered / complete */
  handoffDate: string;
  pm: string;
  description: string;
  developerName: string;
  wireframeLink: string;
  figmaLink: string;
  ganttStart: number;
  ganttDuration: number;
}

export const GANTT_MONTHS = [
  'April', 'May', 'Jun', 'July', 'August', 'Sep',
  'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March',
];

/** Fiscal-year window for roadmap positioning (Apr → Mar). */
export const GANTT_FISCAL_START = '2026-04-01';
export const GANTT_FISCAL_END   = '2027-03-31';

export const TEAM_STORAGE_KEY    = 'pap_team_state';
export const PROJECT_STORAGE_KEY = 'pap_project_state';

export const MEMBER_ROLES: MemberRole[] = [
  'Design Lead',
  'Senior Designer',
  'UI/UX Designer',
  'UX Researcher',
];

export const MEMBER_STATUSES: MemberStatus[] = ['Busy', 'Available'];

/** Preset avatar colors — Virya Core hex values + purple accent */
export const AVATAR_PALETTE = [
  '#002c76', '#1464eb', '#b51f26', '#0b7ad5',
  '#008a00', '#d28107', '#e23c3c', '#6d28d9', '#666666',
];

export function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getMemberDedicatedProjects(memberId: string, projects: Project[]): Project[] {
  return projects.filter((p) => p.dedicatedMemberIds.includes(memberId));
}

export function getMemberBackupProjects(memberId: string, projects: Project[]): Project[] {
  return projects.filter((p) => p.backupMemberIds.includes(memberId));
}

export function resolveAssignees(memberIds: string[], members: TeamMember[]): Assignee[] {
  return memberIds
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is TeamMember => !!m)
    .map((m) => ({
      name: m.name,
      initials: m.initials,
      avatarColor: m.avatarColor,
      avatarUrl: m.avatarUrl,
    }));
}

export const PROJECT_SIZES: ProjectSize[]    = ['Small', 'Medium', 'Large'];
export const PROJECT_PHASES = ['Web', 'System', 'Internal', 'Mobile'];
export const PROJECT_TYPES  = ['New Design', 'Additional', 'Internal', 'Research', 'Training', 'Redesign'];
export const PRIORITY_LEVELS: PriorityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
export const PROGRESS_STATUSES: ProgressStatus[] = [
  'Planning',
  'On Track',
  'Support',
  'Hands-off',
  'Paused',
  'Delayed',
  'Launched',
];

export const DESIGN_STAGES: DesignStage[] = [
  'Not Started',
  'Wireframe',
  'Review',
  'Design',
  'Handoff',
];

/** Process steps shown in the detail stepper (excludes Not Started). */
export const DESIGN_PROCESS_STEPS: Exclude<DesignStage, 'Not Started'>[] = [
  'Wireframe',
  'Review',
  'Design',
  'Handoff',
];

/**
 * Infer stage from Progress + milestone dates.
 * Planning projects always surface as Not Started.
 */
export function suggestDesignStage(input: {
  wireframeStart: string;
  wireframeDelivered: string;
  designStart: string;
  handoffDate: string;
  progress?: ProgressStatus;
}): DesignStage {
  if (input.progress === 'Planning') return 'Not Started';
  if (input.handoffDate.trim()) return 'Handoff';
  if (input.designStart.trim()) return 'Design';
  if (input.wireframeDelivered.trim()) return 'Review';
  return 'Wireframe';
}

/** Display stage: Planning progress forces Not Started. */
export function effectiveDesignStage(project: {
  progress: ProgressStatus;
  designStage: DesignStage;
}): DesignStage {
  if (project.progress === 'Planning') return 'Not Started';
  return project.designStage || 'Wireframe';
}

/** Compact secondary line for Master table (e.g. WF 03/01→03/12 · Des 03/20). */
export function formatDesignProcessDates(project: {
  wireframeStart: string;
  wireframeDelivered: string;
  designStart: string;
  handoffDate: string;
}): string {
  const short = (d: string) => (d.trim() ? d.slice(5).replace('-', '/') : '');
  const parts: string[] = [];
  const wfS = short(project.wireframeStart);
  const wfD = short(project.wireframeDelivered);
  if (wfS || wfD) {
    parts.push(wfS && wfD ? `WF ${wfS}→${wfD}` : wfS ? `WF ${wfS}` : `WF →${wfD}`);
  }
  const des = short(project.designStart);
  if (des) parts.push(`Des ${des}`);
  const ho = short(project.handoffDate);
  if (ho) parts.push(`HO ${ho}`);
  return parts.join(' · ');
}

/** Display / list sort: active work first, Planning last */
export const PROGRESS_SORT_ORDER: ProgressStatus[] = [
  'On Track',
  'Support',
  'Hands-off',
  'Launched',
  'Paused',
  'Delayed',
  'Planning',
];

export function progressSortRank(status: ProgressStatus): number {
  const i = PROGRESS_SORT_ORDER.indexOf(status);
  return i === -1 ? PROGRESS_SORT_ORDER.length : i;
}
