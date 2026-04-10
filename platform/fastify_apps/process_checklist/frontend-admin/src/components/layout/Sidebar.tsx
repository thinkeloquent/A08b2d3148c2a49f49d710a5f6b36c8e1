import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  ChevronRight } from
'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
{
  to: '/',
  icon: <LayoutDashboard className="w-5 h-5" />,
  label: 'Dashboard',
  end: true
},
{
  to: '/templates',
  icon: <ClipboardList className="w-5 h-5" />,
  label: 'Templates'
},
{
  to: '/checklists',
  icon: <CheckSquare className="w-5 h-5" />,
  label: 'Checklists'
}];


export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-gray-100 flex flex-col min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-gray-800" data-test-id="div-e50020ba">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-emerald-500 p-2 rounded-lg">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin Portal</h1>
            <p className="text-xs text-gray-400">Process Checklist</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3" data-test-id="nav-23fa55f4">
        <ul className="space-y-1" data-test-id="ul-20e8e88b">
          {navItems.map((item) =>
          <li key={item.to}>
              <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
              isActive ?
              'bg-indigo-600 text-white' :
              'text-gray-300 hover:bg-gray-800 hover:text-white'}`

              }>

                {item.icon}
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800" data-test-id="div-9dc4a96b">
        <p className="text-xs text-gray-500 text-center">
          Process Checklist Admin v1.0
        </p>
      </div>
    </aside>);

}