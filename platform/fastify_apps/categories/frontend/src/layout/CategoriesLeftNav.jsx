import { useState } from 'react';

const Ico = ({ children, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IcoGrid = (props) => <Ico {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></Ico>;
const IcoTag = (props) => <Ico {...props}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></Ico>;
const IcoMonitor = (props) => <Ico {...props}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></Ico>;
const IcoDownload = (props) => <Ico {...props}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Ico>;

const NAV_ITEMS = [
  { key: 'categories', label: 'Categories', icon: IcoGrid },
  { key: 'category-type', label: 'Category Types', icon: IcoTag },
  { key: 'target-application', label: 'Target Applications', icon: IcoMonitor },
  { key: 'export', label: 'Export', icon: IcoDownload },
];

export function CategoriesLeftNav(_props) {
  const [active, setActive] = useState('categories');

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
