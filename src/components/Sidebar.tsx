import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  IconOverview, IconBriefcase, IconUsers,
} from '../icons';

export type Page = 'overview' | 'project-master' | 'team-setup';

interface NavItem {
  id: Page;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { id: 'overview',        label: 'Team Overview',          icon: <IconOverview   size={18} /> },
  { id: 'project-master',  label: 'Project Master',         icon: <IconBriefcase  size={18} /> },
  { id: 'team-setup',      label: 'Team Member Setup',      icon: <IconUsers      size={18} />, adminOnly: true },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

function roleLabel(role: string) {
  return role === 'super_admin' ? 'Super Admin' : 'Manager (View Only)';
}

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  const { session, signOut } = useAuth();
  const isAdmin = session?.role === 'super_admin';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      <nav className={`mac-sidebar desktop-sidebar${isOpen ? ' sidebar--open' : ''}`} aria-label="Main navigation">
        {/* Logo / app name */}
        <div className="mac-sidebar__logo">
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x={2} y={3} width={20} height={14} rx={2} />
              <polyline points="8 21 12 17 16 21" />
            </svg>
          </div>
          <div>
            <p className="mac-sidebar__appname">Project Portal</p>
            <p className="mac-sidebar__appsub">Management Suite</p>
          </div>
        </div>

        <div className="mac-sidebar__divider" />

        {/* Nav items */}
        <ul className="mac-sidebar__list" role="list">
          {NAV.filter((item) => !item.adminOnly || isAdmin).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="menuitem"
                className={`mac-sidebar__item${currentPage === item.id ? ' mac-sidebar__item--active' : ''}`}
                onClick={() => { onNavigate(item.id); onClose(); }}
              >
                <span className="mac-sidebar__icon">{item.icon}</span>
                <span className="mac-sidebar__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div style={{ flex: 1 }} />

        {/* Session info */}
        <div className="mac-sidebar__session">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 99,
              background: isAdmin ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx={12} cy={7} r={4} />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="mac-sidebar__role">{roleLabel(session?.role ?? 'viewer')}</p>
              {session?.username && (
                <p className="mac-sidebar__user">{session.username}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="mac-sidebar__signout"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>

        <p className="mac-sidebar__version">Project Assignment Portal · v1.0</p>
      </nav>
    </>
  );
}
