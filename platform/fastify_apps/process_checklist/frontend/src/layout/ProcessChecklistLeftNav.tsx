import { useState } from 'react';
import { Home, FileText, ClipboardCheck } from 'lucide-react';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'templates', label: 'Templates', icon: FileText },
  { key: 'checklists', label: 'Checklists', icon: ClipboardCheck },
];

export function ProcessChecklistLeftNav(_props: BaseBlockProps) {
  const [active, setActive] = useState('home');

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
