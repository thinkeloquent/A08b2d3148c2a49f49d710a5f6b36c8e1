import { Outlet, Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
{ to: '/', label: 'Dashboard' },
{ to: '/labels', label: 'Labels' },
{ to: '/prompts', label: 'Prompts' }];


export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white shadow-sm border-r flex-col">
        <div className="p-4 border-b" data-test-id="div-ce351bbe">
          <h1 className="text-lg font-bold text-gray-900">Prompt Manager</h1>
          <p className="text-xs text-gray-500">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4" data-test-id="nav-7999cb43">
          <ul className="space-y-1" data-test-id="ul-e7745ded">
            {NAV_ITEMS.map((item) =>
            <li key={item.to}>
                <Link
                to={item.to}
                className={`block px-3 py-2 rounded text-sm ${
                location.pathname === item.to ?
                'bg-blue-50 text-blue-700 font-medium' :
                'text-gray-700 hover:bg-gray-50'}`
                }>

                  {item.label}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900" data-test-id="h2-bc8a7066">
            Prompt Management System — Admin
          </h2>
        </header>
        <main className="flex-1 p-6">
          <Outlet data-test-id="outlet-47131be8" />
        </main>
      </div>
    </div>);

}