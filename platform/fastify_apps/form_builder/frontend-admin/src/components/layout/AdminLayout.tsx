import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Tags, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
{ to: '/', label: 'Dashboard', icon: LayoutDashboard },
{ to: '/forms', label: 'Forms', icon: FileText },
{ to: '/tags', label: 'Tags', icon: Tags }];


export function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200" data-test-id="div-6f566625">
          <h1 className="text-lg font-semibold text-gray-900">Form Builder</h1>
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Admin</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1" data-test-id="nav-6571ee1f">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setSidebarOpen(false)}>

                <Icon className="h-4 w-4" />
                {label}
              </Link>);

          })}
        </nav>
      </aside>

      {/* Backdrop */}
      {sidebarOpen &&
      <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      }

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} data-test-id="button-a490941e">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="ml-4 text-lg font-semibold" data-test-id="h1-4c8607c6">Form Builder Admin</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet data-test-id="outlet-0ecaa932" />
        </main>
      </div>
    </div>);

}