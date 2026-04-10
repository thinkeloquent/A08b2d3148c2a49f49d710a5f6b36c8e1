import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DevEnvUrlSwitcher } from '@internal/dev-env-url-switcher';
import './styles.css';
import { DashboardLandingCard001 } from '../src';
import type { StatCardItem, QuickActionItem } from '../src';

/* ------------------------------------------------------------------ */
/*  Icons (inline SVGs for dev harness only)                          */
/* ------------------------------------------------------------------ */

const BuildingIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
);

const FolderIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
);

const UsersIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const BoxIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
);

const FolderGitIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="2"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="M14 13h3"/><path d="M7 13h3"/></svg>
);

const FileTextIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
);

const LinkIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

/* ------------------------------------------------------------------ */
/*  Sample data                                                       */
/* ------------------------------------------------------------------ */

const FQDP_STATS: StatCardItem[] = [
  { key: 'organizations', label: 'Organizations', value: 19, icon: BuildingIcon, iconBgClass: 'bg-blue-100', iconColorClass: 'text-blue-600' },
  { key: 'workspaces', label: 'Workspaces', value: 3, icon: FolderIcon, iconBgClass: 'bg-green-100', iconColorClass: 'text-green-600' },
  { key: 'teams', label: 'Teams', value: 4, icon: UsersIcon, iconBgClass: 'bg-purple-100', iconColorClass: 'text-purple-600' },
  { key: 'applications', label: 'Applications', value: 3, icon: BoxIcon, iconBgClass: 'bg-orange-100', iconColorClass: 'text-orange-600' },
  { key: 'projects', label: 'Projects', value: 4, icon: FolderGitIcon, iconBgClass: 'bg-pink-100', iconColorClass: 'text-pink-600' },
  { key: 'resources', label: 'Resources', value: 12, icon: FileTextIcon, iconBgClass: 'bg-indigo-100', iconColorClass: 'text-indigo-600' },
  { key: 'references', label: 'References', value: 8, icon: LinkIcon, iconBgClass: 'bg-teal-100', iconColorClass: 'text-teal-600' },
];

const FQDP_ACTIONS: QuickActionItem[] = [
  { key: 'manage-orgs', title: 'Manage Organizations', description: 'Create and organize your teams', icon: BuildingIcon },
  { key: 'browse-workspaces', title: 'Browse Workspaces', description: 'Access your design workspaces', icon: FolderIcon },
];

const MINIMAL_STATS: StatCardItem[] = [
  { key: 'users', label: 'Users', value: 1250 },
  { key: 'sessions', label: 'Active Sessions', value: 42 },
  { key: 'errors', label: 'Errors (24h)', value: 0 },
];

/* ------------------------------------------------------------------ */
/*  Examples                                                          */
/* ------------------------------------------------------------------ */

const EXAMPLES = [
  { name: 'FQDP Dashboard', path: '/' },
  { name: 'Minimal (no icons)', path: '/minimal' },
  { name: 'Stats Only', path: '/stats-only' },
];

function FqdpExample() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardLandingCard001
        title="Dashboard"
        subtitle="Overview of your FQDP hierarchy and design assets"
        stats={FQDP_STATS}
        onStatClick={(item) => alert(`Clicked: ${item.label}`)}
        actions={FQDP_ACTIONS}
        onActionClick={(item) => alert(`Action: ${item.title}`)}
      />
    </div>
  );
}

function MinimalExample() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardLandingCard001
        title="System Overview"
        subtitle="Current platform metrics"
        stats={MINIMAL_STATS}
        onStatClick={(item) => alert(`Clicked: ${item.label}`)}
      />
    </div>
  );
}

function StatsOnlyExample() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardLandingCard001
        title="Analytics"
        stats={FQDP_STATS.slice(0, 3)}
        actions={[
          { key: 'export', title: 'Export Report', description: 'Download CSV of current data' },
          { key: 'refresh', title: 'Refresh Data', description: 'Pull latest from all sources' },
        ]}
        actionsTitle="Data Actions"
      />
    </div>
  );
}

function DevNav() {
  const navigate = useNavigate();
  return (
    <DevEnvUrlSwitcher
      links={EXAMPLES.map((e) => ({ name: e.name, url: e.path }))}
      onNavigate={(url) => navigate(url)}
      triggerLabel="Examples"
      title="Component Examples"
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <DevNav />
    <Routes>
      <Route path="/" element={<FqdpExample />} />
      <Route path="/minimal" element={<MinimalExample />} />
      <Route path="/stats-only" element={<StatsOnlyExample />} />
    </Routes>
  </BrowserRouter>,
);
