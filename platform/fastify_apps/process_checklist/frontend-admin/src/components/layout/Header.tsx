import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    if (segment === 'new') {
      breadcrumbs.push({ label: 'Create New' });
    } else if (segment === 'edit') {
      breadcrumbs.push({ label: 'Edit' });
    } else {
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        to: i < segments.length - 1 ? currentPath : undefined
      });
    }
  }

  return breadcrumbs;
}

export function Header() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <nav className="flex items-center text-sm" data-test-id="nav-f4fb4e13">
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-700 transition-colors" data-test-id="link-797b37e9">

          <Home className="w-4 h-4" />
        </Link>
        {breadcrumbs.map((item, index) =>
        <div key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            {item.to ?
          <Link
            to={item.to}
            className="text-gray-500 hover:text-gray-700 transition-colors">

                {item.label}
              </Link> :

          <span className="text-gray-900 font-medium">{item.label}</span>
          }
          </div>
        )}
      </nav>
    </header>);

}