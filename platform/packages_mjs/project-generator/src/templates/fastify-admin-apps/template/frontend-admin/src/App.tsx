import { BrowserRouter, Route, Routes } from 'react-router-dom';

function DashboardPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
      <p className="text-gray-600">
        Welcome to the <strong>{{ APP_NAME_TITLE }}</strong> Admin Dashboard.
        Use the navigation to manage your data.
      </p>
    </div>);

}

function AdminLayout({ children }: {children: React.ReactNode;}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200" data-test-id="div-3cda7feb">
          <h1 className="text-lg font-bold text-gray-900">{{ APP_NAME_TITLE }}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Dashboard</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1" data-test-id="nav-e4c792b6">
          <a
            href="/apps/{{APP_NAME}}-admin/"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors" data-test-id="a-27664f6f">

            Dashboard
          </a>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm text-gray-500" data-test-id="h2-a38d3109">{{ APP_NAME_TITLE }} Admin</h2>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>);

}

function App() {
  return (
    <BrowserRouter basename="/apps/{{APP_NAME}}-admin">
      <AdminLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>);

}

export default App;