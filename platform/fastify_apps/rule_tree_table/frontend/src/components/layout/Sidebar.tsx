import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Upload,
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
  to: '/trees',
  icon: <GitBranch className="w-5 h-5" />,
  label: 'Rule Trees'
},
{
  to: '/import',
  icon: <Upload className="w-5 h-5" />,
  label: 'Import Preview'
}];


export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="flex-1 py-4 px-3" data-test-id="nav-c2cbeeb4">
<ul className="space-y-0.5" data-test-id="ul-035ac0ce">
          {navItems.map((item) =>
          <li key={item.to}>
              <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
              isActive ?
              'bg-accent-50 text-accent-700 font-medium shadow-soft' :
              'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`

              }>

                {item.icon}
                <span className="flex-1 text-sm">{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100" data-test-id="div-c243244e">
        <p className="text-[11px] text-slate-400 text-center">
          Rule Tree Admin v1.0
        </p>
      </div>
    </aside>);

}
