import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/tasks') {
      return location.pathname === '/' || location.pathname.startsWith('/tasks') && !location.pathname.startsWith('/logs');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-test-id="div-50e34179">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Task Graph</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <Link
                  to="/tasks"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/tasks') ?
                  'border-blue-500 text-gray-900' :
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }>

                  Tasks
                </Link>
                <Link
                  to="/logs"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/logs') ?
                  'border-blue-500 text-gray-900' :
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }>

                  Recent Logs
                </Link>
                <Link
                  to="/retry-jobs"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/retry-jobs') ?
                  'border-blue-500 text-gray-900' :
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }>

                  Retrying
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet data-test-id="outlet-cfe10b6b" />
      </main>
    </div>);

}