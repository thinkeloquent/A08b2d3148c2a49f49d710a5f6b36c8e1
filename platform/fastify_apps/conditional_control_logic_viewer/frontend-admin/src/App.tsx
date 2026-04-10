import { Routes, Route, NavLink } from 'react-router-dom';
import { Settings, ChevronRight } from 'lucide-react';
import DropdownOptionsPage from '@/pages/dropdown-options/DropdownOptionsPage';

function DashboardPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Dashboard</h2>
      <p className="text-gray-600 mb-4">
        Admin dashboard for Conditional Control Logic Viewer.
      </p>
      <NavLink
        to="dropdown-options"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">

        <Settings className="w-4 h-4" />
        Manage Dropdown Options
        <ChevronRight className="w-4 h-4" />
      </NavLink>
    </div>);

}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6" data-test-id="div-3d042c99">
          <NavLink to="." end className="text-xl font-semibold text-gray-900 hover:text-gray-700">
            Conditional Control Logic Viewer — Admin
          </NavLink>
          <nav className="flex items-center gap-4">
            <NavLink
              to="dropdown-options"
              className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`

              } data-test-id="navlink-803b9aac">

              Dropdown Options
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes data-test-id="routes-2389fc9c">
          <Route index element={<DashboardPage />} />
          <Route path="dropdown-options" element={<DropdownOptionsPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>);

}