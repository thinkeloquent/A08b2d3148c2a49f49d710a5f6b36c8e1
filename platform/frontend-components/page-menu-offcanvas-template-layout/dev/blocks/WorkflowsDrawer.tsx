import type { BaseBlockProps } from '../../src';

export const WorkflowsDrawer = (_props: BaseBlockProps) => (
  <div className="space-y-4 py-2">
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recent Runs</p>
      {['2 min ago — Success', '14 min ago — Success', '1 hr ago — Failed', '3 hr ago — Success'].map((r) => (
        <div key={r} className="flex items-center gap-2 py-1.5">
          <span className={['w-2 h-2 rounded-full flex-none', r.includes('Failed') ? 'bg-red-400' : 'bg-emerald-400'].join(' ')} />
          <span className="text-xs text-gray-600">{r}</span>
        </div>
      ))}
    </div>
    <div className="border-t border-gray-100 pt-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Quick Actions</p>
      {['Run Now', 'Duplicate', 'Export JSON'].map((a) => (
        <button key={a} className="w-full text-left px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          {a}
        </button>
      ))}
    </div>
  </div>
);
