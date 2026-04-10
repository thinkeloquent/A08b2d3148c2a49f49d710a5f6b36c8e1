import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AppBar } from './ControlPanel.jsx';

const tabs = [
  { id: 'dashboard',    label: 'Dashboard',             path: '/' },
  { id: 'deployments',  label: 'Workflow Deployments',   path: '/deployments' },
  { id: 'release',      label: 'Workflow Release',       path: '/release' },
  { id: 'schemas',      label: 'Workflow Schemas',       path: '/schemas' },
  { id: 'session',      label: 'Workflow Sessions',      path: '/session' },
  { id: 'specs',        label: 'Workflow Specs',         path: '/specs' },
];

const pathToTabId = {
  '/': 'dashboard', '/deployments': 'deployments', '/release': 'release',
  '/schemas': 'schemas', '/session': 'session', '/specs': 'specs',
};

// Map sub-page prefixes to their parent tab
const prefixToTabId = [
  ['/instance/', 'release'],   // covers /instance/:instanceId and /instance/:instanceId/:runId
  ['/workflow-contract/', 'schemas'],
  ['/workflow-template/', 'specs'],
  ['/workflow/', 'schemas'],
];

function resolveActiveTab(pathname) {
  if (pathToTabId[pathname]) return pathToTabId[pathname];
  for (const [prefix, tabId] of prefixToTabId) {
    if (pathname.startsWith(prefix)) return tabId;
  }
  return null;
}

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = resolveActiveTab(location.pathname);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      <AppBar />

      {/* Global tab bar */}
      <div className="flex items-center gap-0 px-4 bg-slate-50 border-b border-slate-200 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Page content */}
      <Outlet />
    </div>
  );
}
