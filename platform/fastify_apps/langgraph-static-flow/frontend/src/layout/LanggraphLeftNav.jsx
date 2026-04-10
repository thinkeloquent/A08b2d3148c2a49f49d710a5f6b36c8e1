import { useState } from 'react';
import { LayoutDashboard, Rocket, Play, GitBranch, Radio, FileCode } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'deployments', label: 'Workflow Deployments', icon: Rocket },
  { key: 'release', label: 'Workflow Release', icon: Play },
  { key: 'schemas', label: 'Workflow Schemas', icon: GitBranch },
  { key: 'session', label: 'Workflow Sessions', icon: Radio },
  { key: 'specs', label: 'Workflow Specs', icon: FileCode },
];

export function LanggraphLeftNav(_props) {
  const [active, setActive] = useState('dashboard');

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
