/**
 * Admin Layout Component
 */

import { Link, Outlet, useLocation } from 'react-router-dom';

const navigation = [
{ name: 'Dashboard', href: '/', icon: '📊' },
{ name: 'Tasks', href: '/tasks', icon: '📋' },
{ name: 'Workflows', href: '/workflows', icon: '🔄' },
{ name: 'Executions', href: '/executions', icon: '📝' },
{ name: 'Users', href: '/users', icon: '👥' }];


export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4" data-test-id="div-e1564deb">
          <h1 className="text-xl font-bold">Task Graph Admin</h1>
        </div>
        <nav className="mt-4" data-test-id="nav-226b0709">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
            item.href !== '/' && location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm ${
                isActive ?
                'bg-gray-800 text-white border-l-4 border-blue-500' :
                'text-gray-300 hover:bg-gray-800'}`
                }>

                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>);

          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8" data-test-id="div-b017f829">
          <Outlet />
        </div>
      </main>
    </div>);

}