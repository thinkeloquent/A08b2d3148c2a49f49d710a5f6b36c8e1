import { useState } from 'react';
import { Network, Pin, SwatchBook, Code2, Brain, History } from 'lucide-react';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';

const NAV_ITEMS = [
  { key: 'pins', label: 'Pins', icon: Pin },
  { key: 'structure', label: 'Figma Elements', icon: Network },
  { key: 'design-system', label: 'Design System', icon: SwatchBook },
  { key: 'export', label: 'Export & Code', icon: Code2 },
  { key: 'ai-context', label: 'AI & Context', icon: Brain },
  { key: 'activity', label: 'Activity & History', icon: History },
];

export function FigmaInspectorLeftNav(_props: BaseBlockProps) {
  const [active, setActive] = useState('pins');

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
