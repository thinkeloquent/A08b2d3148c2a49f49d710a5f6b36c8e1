import { useState } from 'react';
import { LayoutDashboard, Shield, Users, Tag, Zap, ShieldOff } from 'lucide-react';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'roles', label: 'Roles', icon: Shield },
  { key: 'groups', label: 'Groups', icon: Users },
  { key: 'labels', label: 'Labels', icon: Tag },
  { key: 'actions', label: 'Actions', icon: Zap },
  { key: 'restrictions', label: 'Restrictions', icon: ShieldOff },
];

export function GroupRoleLeftNav(_props: BaseBlockProps) {
  const [active, setActive] = useState('dashboard');

  return (
    <div className="px-3 py-3 space-y-0.5">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => setActive(item.key)}
          className={[
            'w-full text-left px-3 py-2.5 rounded-xl text-[13px] flex items-center gap-2.5 transition-all',
            active === item.key
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
