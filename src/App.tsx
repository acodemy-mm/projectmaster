import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import type { Page } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { ProjectMasterPage } from './pages/ProjectMasterPage';
import { TeamSetupPage } from './pages/TeamSetupPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './auth/AuthContext';
import { IconMenu } from './icons';

function PortalApp() {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
  const [projectDetailSource, setProjectDetailSource] = useState<'overview' | 'project-master' | 'member'>('project-master');
  const [memberReturnId, setMemberReturnId] = useState<string | null>(null);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const { session } = useAuth();
  const isSuperAdmin = session?.role === 'super_admin';

  const handleViewMember = (id: string) => {
    setViewingMemberId(id);
    setViewingProjectId(null);
    setMemberReturnId(null);
    setSidebarOpen(false);
  };

  const handleViewProject = (
    id: string,
    source: 'overview' | 'project-master' | 'member' = 'project-master',
    fromMemberId?: string
  ) => {
    setViewingProjectId(id);
    setViewingMemberId(null);
    setProjectDetailSource(source);
    setMemberReturnId(source === 'member' ? (fromMemberId ?? null) : null);
    setSidebarOpen(false);
  };

  const handleEditProject = (id: string) => {
    setViewingProjectId(null);
    setCurrentPage('project-master');
    setEditProjectId(id);
    setSidebarOpen(false);
  };

  const clearEditProject = useCallback(() => setEditProjectId(null), []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setViewingMemberId(null);
    setViewingProjectId(null);
    setEditProjectId(null);
  };

  const goToProjectMaster = () => handleNavigate('project-master');

  const renderPage = () => {
    if (viewingProjectId) {
      const backLabel =
        projectDetailSource === 'overview'
          ? 'Back to Project Overview'
          : projectDetailSource === 'member'
            ? 'Back to Member'
            : 'Back to Project Master';
      return (
        <ProjectDetailPage
          projectId={viewingProjectId}
          onBack={() => {
            setViewingProjectId(null);
            if (projectDetailSource === 'member' && memberReturnId) {
              setViewingMemberId(memberReturnId);
            }
          }}
          backLabel={backLabel}
          onEditProject={isSuperAdmin ? () => handleEditProject(viewingProjectId) : undefined}
        />
      );
    }
    if (viewingMemberId) {
      return (
        <MemberDetailPage
          memberId={viewingMemberId}
          onBack={() => setViewingMemberId(null)}
          onViewProject={(id) => handleViewProject(id, 'member', viewingMemberId)}
        />
      );
    }
    switch (currentPage) {
      case 'overview':        return <OverviewPage onViewMember={handleViewMember} onViewProject={(id) => handleViewProject(id, 'overview')} onViewAllProjects={goToProjectMaster} />;
      case 'project-master':  return (
        <ProjectMasterPage
          onViewProject={(id) => handleViewProject(id, 'project-master')}
          editProjectId={editProjectId}
          onEditProjectHandled={clearEditProject}
        />
      );
      case 'team-setup':      return <TeamSetupPage />;
      default:                return <OverviewPage onViewMember={handleViewMember} onViewProject={(id) => handleViewProject(id, 'overview')} onViewAllProjects={goToProjectMaster} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <button
          type="button"
          className="mobile-nav-trigger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <IconMenu size={18} />
        </button>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <PortalApp /> : <LoginPage />;
}
