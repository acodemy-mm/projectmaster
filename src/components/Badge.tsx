import type { ProgressStatus, PriorityLevel, ProjectSize, MemberStatus } from '../data/mockData';

const PROGRESS_STYLES: Record<ProgressStatus, { bg: string; color: string }> = {
  'On Track':  { bg: 'var(--tint-primary-bg)',  color: 'var(--tint-primary-fg)' },
  'Delayed':   { bg: 'var(--tint-critical-bg)', color: 'var(--tint-critical-fg)' },
  'Hands-off': { bg: 'var(--tint-neutral-bg)',  color: 'var(--tint-neutral-fg)' },
  'Launched':  { bg: 'var(--tint-success-bg)',  color: 'var(--tint-success-fg)' },
  'Planning':  { bg: 'var(--tint-info-bg)',     color: 'var(--tint-info-fg)' },
  'Paused':    { bg: 'var(--tint-warning-bg)', color: 'var(--tint-warning-fg)' },
};

export function StatusBadge({ status }: { status: ProgressStatus }) {
  const s = PROGRESS_STYLES[status];
  return (
    <span className="mac-badge" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

const PRIORITY_STYLES: Record<PriorityLevel, { bg: string; color: string }> = {
  Low:      { bg: 'var(--tint-neutral-bg)',  color: 'var(--tint-neutral-fg)' },
  Medium:   { bg: 'var(--tint-warning-bg)',  color: 'var(--tint-warning-fg)' },
  High:     { bg: 'var(--tint-critical-bg)', color: 'var(--tint-critical-fg)' },
  Critical: { bg: 'var(--v-critical-500)',   color: 'var(--color-text-on-inverse)' },
};

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  const s = PRIORITY_STYLES[level];
  return (
    <span className="mac-badge" style={{ background: s.bg, color: s.color }}>
      {level}
    </span>
  );
}

const SIZE_STYLES: Record<ProjectSize, { bg: string; color: string }> = {
  Small:  { bg: 'var(--tint-success-bg)', color: 'var(--tint-success-fg)' },
  Medium: { bg: 'var(--tint-warning-bg)', color: 'var(--tint-warning-fg)' },
  Large:  { bg: 'var(--tint-primary-bg)', color: 'var(--tint-primary-fg)' },
};

export function SizeBadge({ size }: { size: ProjectSize }) {
  const s = SIZE_STYLES[size];
  return (
    <span className="mac-badge" style={{ background: s.bg, color: s.color, fontSize: 'var(--text-label2-size)' }}>
      {size}
    </span>
  );
}

const MEMBER_STATUS_STYLES: Record<MemberStatus, { bg: string; color: string }> = {
  Busy:      { bg: 'var(--tint-warning-bg)', color: 'var(--tint-warning-fg)' },
  Available: { bg: 'var(--tint-success-bg)', color: 'var(--tint-success-fg)' },
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const s = MEMBER_STATUS_STYLES[status];
  return (
    <span
      className="mac-badge"
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 'var(--text-label2-size)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  );
}
