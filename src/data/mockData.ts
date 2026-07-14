export type ProgressStatus = 'On Track' | 'Delayed' | 'Hands-off' | 'Launched' | 'Planning' | 'Paused';
export type PriorityLevel  = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectSize     = 'Small' | 'Medium' | 'Large';
export type MemberStatus    = 'Busy' | 'Available';
export type MemberRole      = 'UI/UX Designer' | 'Senior Designer' | 'Design Lead' | 'UX Researcher';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
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

/** Preset avatar colors — Virya Core hex values (from tokens.css) */
export const AVATAR_PALETTE = [
  '#002c76', '#1464eb', '#b51f26', '#0b7ad5',
  '#008a00', '#d28107', '#e23c3c', '#666666',
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
    .map((m) => ({ name: m.name, initials: m.initials, avatarColor: m.avatarColor }));
}

export const PROJECT_SIZES: ProjectSize[]    = ['Small', 'Medium', 'Large'];
export const PROJECT_PHASES = ['Web', 'System', 'Internal', 'Mobile'];
export const PROJECT_TYPES  = ['New Design', 'Additional', 'Internal', 'Research', 'Training', 'Redesign'];
export const PRIORITY_LEVELS: PriorityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
export const PROGRESS_STATUSES: ProgressStatus[] = ['Planning', 'On Track', 'Hands-off', 'Paused', 'Delayed', 'Launched'];
