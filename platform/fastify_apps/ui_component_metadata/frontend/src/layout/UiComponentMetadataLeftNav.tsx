import { useState } from 'react';
import { Box, Tag, Plus } from 'lucide-react';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';

const NAV_ITEMS = [
  { key: 'components', label: 'Components', icon: Box },
  { key: 'tags', label: 'Tags', icon: Tag },
  { key: 'new', label: 'New Component', icon: Plus },
];

export function UiComponentMetadataLeftNav(_props: BaseBlockProps) {
  const [active, setActive] = useState('components');

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
