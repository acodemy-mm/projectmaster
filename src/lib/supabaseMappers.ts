import type {
  TeamMember,
  Project,
  MemberRole,
  MemberStatus,
  ProjectSize,
  PriorityLevel,
  ProgressStatus,
  DesignStage,
} from '../data/mockData';
import { suggestDesignStage, DESIGN_STAGES } from '../data/mockData';

export interface MemberRow {
  id: string;
  name: string;
  initials: string;
  avatar_color: string;
  avatar_url: string;
  role: string;
  status: string;
  primary_focus: string;
  work_rate: number;
  join_date: string;
}

export interface ProjectRow {
  id: string;
  project_name: string;
  iteration_label: string;
  name: string;
  size: string;
  phase: string;
  type: string;
  start_date: string;
  due_date: string;
  dedicated_member_ids: string[];
  backup_member_ids: string[];
  priority: string;
  complexity: string;
  progress: string;
  design_stage: string;
  wireframe_start: string;
  wireframe_delivered: string;
  design_start: string;
  handoff_date: string;
  pm: string;
  description: string;
  developer_name: string;
  wireframe_link: string;
  figma_link: string;
  gantt_start: number;
  gantt_duration: number;
}

export function memberFromRow(row: MemberRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    avatarColor: row.avatar_color,
    avatarUrl: row.avatar_url ?? '',
    role: row.role as MemberRole,
    status: row.status as MemberStatus,
    primaryFocus: row.primary_focus,
    workRate: row.work_rate,
    joinDate: row.join_date,
  };
}

export function memberToRow(member: TeamMember): MemberRow {
  return {
    id: member.id,
    name: member.name,
    initials: member.initials,
    avatar_color: member.avatarColor,
    avatar_url: member.avatarUrl ?? '',
    role: member.role,
    status: member.status,
    primary_focus: member.primaryFocus,
    work_rate: member.workRate,
    join_date: member.joinDate,
  };
}

export function projectFromRow(row: ProjectRow): Omit<Project, 'dedicated' | 'backup'> {
  const wireframeStart = row.wireframe_start ?? '';
  const wireframeDelivered = row.wireframe_delivered ?? '';
  const designStart = row.design_start ?? '';
  const handoffDate = row.handoff_date ?? '';
  const designStage = suggestDesignStage({
    wireframeStart,
    wireframeDelivered,
    designStart,
    handoffDate,
    progress: row.progress as ProgressStatus,
  });
  // Prefer stored stage unless Planning forces Not Started, or DB stage missing
  const stored = row.design_stage as DesignStage | undefined;
  const resolved: DesignStage =
    (row.progress as ProgressStatus) === 'Planning'
      ? 'Not Started'
      : (stored && DESIGN_STAGES.includes(stored) ? stored : designStage);

  return {
    id: row.id,
    projectName: row.project_name,
    iterationLabel: row.iteration_label,
    name: row.name,
    size: row.size as ProjectSize,
    phase: row.phase,
    type: row.type,
    startDate: row.start_date,
    dueDate: row.due_date,
    dedicatedMemberIds: row.dedicated_member_ids ?? [],
    backupMemberIds: row.backup_member_ids ?? [],
    priority: row.priority as PriorityLevel,
    complexity: row.complexity as PriorityLevel,
    progress: row.progress as ProgressStatus,
    designStage: resolved,
    wireframeStart,
    wireframeDelivered,
    designStart,
    handoffDate,
    pm: row.pm,
    description: row.description,
    developerName: row.developer_name,
    wireframeLink: row.wireframe_link,
    figmaLink: row.figma_link,
    ganttStart: row.gantt_start,
    ganttDuration: row.gantt_duration,
  };
}

export function projectToRow(
  project: Omit<Project, 'dedicated' | 'backup'>
): ProjectRow {
  return {
    id: project.id,
    project_name: project.projectName,
    iteration_label: project.iterationLabel,
    name: project.name,
    size: project.size,
    phase: project.phase,
    type: project.type,
    start_date: project.startDate,
    due_date: project.dueDate,
    dedicated_member_ids: project.dedicatedMemberIds,
    backup_member_ids: project.backupMemberIds,
    priority: project.priority,
    complexity: project.complexity,
    progress: project.progress,
    design_stage: project.designStage,
    wireframe_start: project.wireframeStart ?? '',
    wireframe_delivered: project.wireframeDelivered ?? '',
    design_start: project.designStart ?? '',
    handoff_date: project.handoffDate ?? '',
    pm: project.pm,
    description: project.description,
    developer_name: project.developerName,
    wireframe_link: project.wireframeLink,
    figma_link: project.figmaLink,
    gantt_start: project.ganttStart,
    gantt_duration: project.ganttDuration,
  };
}
