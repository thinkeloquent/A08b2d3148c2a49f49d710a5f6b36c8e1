import { useNavigate, useLocation } from 'react-router-dom';
import { Building, List } from 'lucide-react';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';

const NAV_ITEMS = [
  { key: 'organizations', path: '/', label: 'Organizations', icon: Building },
];

export function OrganizationLeftNav(_props: BaseBlockProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = NAV_ITEMS.find(
    (item) => location.pathname.startsWith(item.path)
  )?.key ?? 'organizations';

  return (
    <div className="px-3 py-3 space-y-0.5">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => navigate(item.path)}
          className={[
            'w-full text-left px-3 py-2.5 rounded-xl text-[13px] flex items-center gap-2.5 transition-all',
            activeKey === item.key
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-gray-600 hover:bg-gray-50',
          ].join(' ')}
        >
          <item.icon size={15} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
