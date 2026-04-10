import { useState } from 'react';
import type { BaseBlockProps } from '../../src';

export const OverviewLeftNav = (_props: BaseBlockProps) => {
  const [active, setActive] = useState('summary');
  const items = [
    { key: 'summary', label: 'Summary' },
    { key: 'metrics', label: 'Metrics' },
    { key: 'reports', label: 'Reports' },
    { key: 'export', label: 'Export' },
  ];
  return (
    <div className="px-3 py-3 space-y-0.5">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => setActive(item.key)}
          className={[
            'w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-all',
            active === item.key
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-gray-600 hover:bg-gray-50',
          ].join(' ')}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
