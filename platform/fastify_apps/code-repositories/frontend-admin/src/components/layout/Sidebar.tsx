import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  FileText,
  ChevronRight,
  FileJson } from
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
  to: '/repositories',
  icon: <Package className="w-5 h-5" />,
  label: 'Repositories'
},
{
  to: '/tags',
  icon: <Tags className="w-5 h-5" />,
  label: 'Tags'
},
{
  to: '/metadata',
  icon: <FileText className="w-5 h-5" />,
  label: 'Metadata'
},
{
  to: '/bulk-insert',
  icon: <FileJson className="w-5 h-5" />,
  label: 'Bulk Insert'
}];


export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-gray-100 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800" data-test-id="div-1b2ccc28">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin Portal</h1>
            <p className="text-xs text-gray-400">Repository Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3" data-test-id="nav-71132ea0">
        <ul className="space-y-1" data-test-id="ul-3e109b51">
          {navItems.map((item) =>
          <li key={item.to}>
              <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
              isActive ?
              'bg-blue-600 text-white' :
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

      {/* Footer */}
      <div className="p-4 border-t border-gray-800" data-test-id="div-b15b4af0">
        <p className="text-xs text-gray-500 text-center">
          Code Repository Admin v1.0
        </p>
      </div>
    </aside>);

}