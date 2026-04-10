/**
 * Sidebar Component
 * Main navigation sidebar for the application
 */

import { NavLink } from 'react-router-dom';
import { Building, FolderOpen, Users, Box, FolderGit, FileText, Home, Link } from 'lucide-react';
import { cn } from '@/utils/cn';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Organizations', href: '/organizations', icon: Building },
  { name: 'Workspaces', href: '/workspaces', icon: FolderOpen },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Applications', href: '/applications', icon: Box },
  { name: 'Projects', href: '/projects', icon: FolderGit },
  { name: 'Resources', href: '/resources', icon: FileText },
  { name: 'References', href: '/references', icon: Link },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-gray-900">FQDP Manager</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-700' : 'text-gray-400'
                  )}
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500">
          <p className="font-medium">FQDP Management System</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
