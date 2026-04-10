import { useState } from 'react';
import type { BaseBlockProps } from '../../src';

export const WorkflowsLeftNav = (_props: BaseBlockProps) => {
  const [active, setActive] = useState('all');
  const sections = [
    { heading: 'Workflows', items: [
      { key: 'all', label: 'All Workflows' },
      { key: 'active', label: 'Active' },
      { key: 'draft', label: 'Drafts' },
      { key: 'archived', label: 'Archived' },
    ]},
    { heading: 'Templates', items: [
      { key: 'onboarding', label: 'Onboarding' },
      { key: 'approval', label: 'Approval Chain' },
      { key: 'notification', label: 'Notification' },
    ]},
  ];
  return (
    <div className="px-3 py-3 space-y-4">
      {sections.map((s) => (
        <div key={s.heading}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">{s.heading}</p>
          <div className="space-y-0.5">
            {s.items.map((item) => (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={[
                  'w-full text-left px-3 py-2 rounded-xl text-[13px] transition-all',
                  active === item.key
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
