import { Routes, Route } from 'react-router-dom';

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4" data-test-id="div-496b7f7f">
          <h1 className="text-xl font-semibold text-gray-900">
            Group Role Management — Admin
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6" data-test-id="div-0fdb8e05">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600">
            Admin dashboard for Group Role Management. This is a placeholder — add pages, forms, and tables as needed.
          </p>
        </div>
      </main>
    </div>);

}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<DashboardPage />} />
    </Routes>);

}