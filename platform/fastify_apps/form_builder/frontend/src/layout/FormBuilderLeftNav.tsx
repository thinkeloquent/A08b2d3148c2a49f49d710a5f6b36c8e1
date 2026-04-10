/**
 * Left nav panel block for the Form Builder app.
 * Shows app-level navigation items.
 */

import { useState } from 'react';
import { FileText, PenTool, Settings } from 'lucide-react';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';

const NAV_ITEMS = [
  { key: 'forms', label: 'My Forms', icon: FileText },
  { key: 'builder', label: 'Form Builder', icon: PenTool },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function FormBuilderLeftNav(_props: BaseBlockProps) {
  const [active, setActive] = useState('forms');

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
