import type { ProgressStatus } from '../data/mockData';

/** Gantt bar colors — Virya Core semantic tokens only */
export const PROGRESS_GANTT_COLORS: Record<ProgressStatus, string> = {
  'On Track':  'var(--v-primary-400)',
  'Support':   'var(--v-info-500)',
  'Delayed':   'var(--v-critical-500)',
  'Hands-off': 'var(--v-neutral-500)',
  'Launched':  'var(--v-success-500)',
  'Planning':  'var(--v-info-500)',
  'Paused':    'var(--v-warning-500)',
};
