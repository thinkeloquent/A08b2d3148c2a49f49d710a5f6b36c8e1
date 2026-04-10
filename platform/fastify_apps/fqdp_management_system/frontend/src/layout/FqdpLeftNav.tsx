import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building, FolderOpen, Users, Box, FolderGit, FileText, Link } from 'lucide-react';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';

const NAV_ITEMS = [
  { key: 'dashboard', path: '/', label: 'Dashboard', icon: Home },
  { key: 'organizations', path: '/organizations', label: 'Organizations', icon: Building },
  { key: 'workspaces', path: '/workspaces', label: 'Workspaces', icon: FolderOpen },
  { key: 'teams', path: '/teams', label: 'Teams', icon: Users },
  { key: 'applications', path: '/applications', label: 'Applications', icon: Box },
  { key: 'projects', path: '/projects', label: 'Projects', icon: FolderGit },
  { key: 'resources', path: '/resources', label: 'Resources', icon: FileText },
  { key: 'references', path: '/references', label: 'References', icon: Link },
];

export function FqdpLeftNav(_props: BaseBlockProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = NAV_ITEMS.find(
    (item) => item.path !== '/' && location.pathname.startsWith(item.path)
  )?.key ?? 'dashboard';

  return (
    <div className="px-3 py-3 space-y-0.5">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => navigate(item.path)}
          className={[
            'w-full text-left px-3 py-2.5 rounded-xl text-[13px] flex items-center gap-2.5 transition-all',
            activeKey === item.key
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-gray-600 hover:bg-gray-50',
          ].join(' ')}
        >
          <item.icon size={15} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
