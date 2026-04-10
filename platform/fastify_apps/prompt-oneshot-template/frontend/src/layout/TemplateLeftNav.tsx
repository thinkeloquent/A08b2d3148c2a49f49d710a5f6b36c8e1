/**
 * Left nav panel block for the Prompt Oneshot Template app.
 * Shows document type categories for quick filtering.
 */

import { useState } from 'react';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';

const NAV_ITEMS = [
  { key: 'all', label: 'All Templates' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'design', label: 'Design' },
  { key: 'specification', label: 'Specification' },
];

export function TemplateLeftNav(_props: BaseBlockProps) {
  const [active, setActive] = useState('all');

  return (
    <div className="px-3 py-3 space-y-0.5">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => setActive(item.key)}
          className={[
            'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-all',
            active === item.key
              ? 'bg-indigo-50 text-indigo-700 font-medium'
              : 'text-slate-600 hover:bg-slate-100',
          ].join(' ')}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
