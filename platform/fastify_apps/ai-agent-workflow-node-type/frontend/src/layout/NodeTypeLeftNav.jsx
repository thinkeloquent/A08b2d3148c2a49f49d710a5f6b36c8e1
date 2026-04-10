import { useState } from 'react';
import { LayoutList, Settings, Cpu, Brain, Wrench, FolderOpen } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'all', label: 'All Node Types', icon: LayoutList },
  { key: 'chat-models', label: 'Chat Models', icon: Cpu },
  { key: 'agents', label: 'Agents', icon: Brain },
  { key: 'tools', label: 'Tools', icon: Wrench },
  { key: 'memory', label: 'Memory', icon: FolderOpen },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function NodeTypeLeftNav(_props) {
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
