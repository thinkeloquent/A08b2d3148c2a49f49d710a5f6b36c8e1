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

    // Handle special cases
    if (segment === 'new') {
      breadcrumbs.push({ label: 'Create New' });
    } else if (segment === 'edit') {
      breadcrumbs.push({ label: 'Edit' });
    } else if (/^\d+$/.test(segment)) {
      // It's an ID - add as detail view
      breadcrumbs.push({ label: `#${segment}`, to: currentPath });
    } else {
      // Regular segment
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
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
    <header className="h-14 bg-white border-b border-slate-200/80 flex items-center px-8">
      <nav className="flex items-center text-sm" data-test-id="nav-7d8a399f">
        <Link
          to="/"
          className="text-slate-400 hover:text-accent-600 transition-colors" data-test-id="link-b0fe81c6">

          <Home className="w-4 h-4" />
        </Link>
        {breadcrumbs.map((item, index) =>
        <div key={index} className="flex items-center">
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
            {item.to ?
          <Link
            to={item.to}
            className="text-slate-500 hover:text-accent-600 transition-colors">

                {item.label}
              </Link> :

          <span className="text-slate-800 font-medium">{item.label}</span>
          }
          </div>
        )}
      </nav>
    </header>);

}
