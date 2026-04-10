/**
 * Sidebar Component
 * Navigation sidebar for admin dashboard
 */

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, History, ChevronRight } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
{ to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
{ to: '/personas', label: 'Personas', icon: <Users className="w-5 h-5" /> },
{ to: '/llm-defaults', label: 'LLM Defaults', icon: <Settings className="w-5 h-5" /> },
{ to: '/audit-logs', label: 'Audit Logs', icon: <History className="w-5 h-5" /> }];


export function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-20">
      <nav className="p-4" data-test-id="nav-fb191652">
        <ul className="space-y-1" data-test-id="ul-10d0cb99">
          {navItems.map((item) =>
          <li key={item.to}>
              <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              isActive ?
              'bg-blue-50 text-blue-700' :
              'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`

              }>

                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* Version info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200" data-test-id="div-408c0d35">
        <p className="text-xs text-gray-500 text-center">
          Persona Editor Admin v1.0.0
        </p>
      </div>
    </aside>);

}