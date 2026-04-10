import { useState } from 'react';
import { Layers, Layout, Package, Cpu, Image, Shapes, Filter } from 'lucide-react';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';

const NAV_ITEMS = [
  { key: 'all', label: 'All Figma Files', icon: Layers },
  { key: 'design_system', label: 'Design Systems', icon: Layout },
  { key: 'component_library', label: 'Component Libraries', icon: Package },
  { key: 'prototype', label: 'Prototypes', icon: Cpu },
  { key: 'illustration', label: 'Illustrations', icon: Image },
  { key: 'icon_set', label: 'Icon Sets', icon: Shapes },
  { key: 'filters', label: 'Filters', icon: Filter },
];

export function FigmaFilesLeftNav(_props: BaseBlockProps) {
  const [active, setActive] = useState('all');

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
