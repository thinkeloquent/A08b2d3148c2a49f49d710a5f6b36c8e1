/**
 * Header Component
 * Top navigation bar for admin dashboard
 */

import { Settings, User } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-full px-6" data-test-id="div-5b9853bb">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            Persona Editor
          </h1>
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>);

}