/**
 * App Layout Component
 * Main layout wrapper with navigation
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, Tag, Zap, ShieldOff } from 'lucide-react';

export default function AppLayout() {
  const location = useLocation();

  const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Roles', href: '/roles', icon: Shield },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Labels', href: '/labels', icon: Tag },
  { name: 'Actions', href: '/actions', icon: Zap },
  { name: 'Restrictions', href: '/restrictions', icon: ShieldOff }];


  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-test-id="div-a5b67fce">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Role Management</h1>
            </div>
            <nav className="flex gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ?
                    'bg-primary-50 text-primary-700' :
                    'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                    }>

                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>);

              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">
        <Outlet data-test-id="outlet-af5f895d" />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p data-test-id="p-7081a0b4">Role Management System v2.0 - Built with React, TypeScript & TailwindCSS</p>
      </footer>
    </div>);

}