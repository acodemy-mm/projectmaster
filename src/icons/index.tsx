/* Virya-style line icons (24px, stroke-based) */
import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const base = (size: number, color: string, sw: number, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export function IconOverview({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </>);
}

export function IconBriefcase({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="12" />
    <path d="M2 12h20" />
  </>);
}

export function IconClose({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>);
}

export function IconMenu({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>);
}

export function IconBell({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>);
}

export function IconSearch({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>);
}

export function IconCalendar({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>);
}

export function IconTable({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="9" x2="9" y2="21" />
  </>);
}

export function IconChevronDown({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) {
  return base(size, color, strokeWidth, <polyline points="6 9 12 15 18 9" />);
}

export function IconAlertTriangle({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>);
}

export function IconUsers({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>);
}

export function IconArrowRight({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>);
}

export function IconPlus({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>);
}

export function IconChart({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </>);
}

export function IconSliders({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </>);
}

export function IconTrash({ size = 16, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </>);
}

export function IconEdit({ size = 16, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  return base(size, color, strokeWidth, <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </>);
}
