import { useState } from 'react';

const Ico = ({ children, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const NAV_ITEMS = [
  {
    key: 'collections',
    label: 'Collections',
    icon: (props) => <Ico {...props}><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></Ico>,
  },
  {
    key: 'browse',
    label: 'Browse & Search',
    icon: (props) => <Ico {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Ico>,
  },
  {
    key: 'statistics',
    label: 'Statistics',
    icon: (props) => <Ico {...props}><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></Ico>,
  },
  {
    key: 'components',
    label: 'Components',
    icon: (props) => <Ico {...props}><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></Ico>,
  },
];

export function ChromaExplorerLeftNav(_props) {
  const [active, setActive] = useState('collections');

  return (
    <div className="px-3 py-3 space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
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
            <Icon size={15} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
