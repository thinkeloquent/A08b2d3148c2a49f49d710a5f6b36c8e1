import type { BaseBlockProps } from '../../src';

export const DashboardMain = (_props: BaseBlockProps) => (
  <div className="space-y-6 py-6">
    {/* Stats row */}
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: 'Total Users', value: '12,847', delta: '+4.3%' },
        { label: 'Active Sessions', value: '1,024', delta: '+12.1%' },
        { label: 'Avg. Response', value: '142ms', delta: '-8.7%' },
        { label: 'Uptime', value: '99.98%', delta: '+0.02%' },
      ].map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500">{s.label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{s.value}</p>
          <p className={['text-xs mt-1', s.delta.startsWith('-') ? 'text-emerald-600' : 'text-emerald-600'].join(' ')}>
            {s.delta} from last period
          </p>
        </div>
      ))}
    </div>

    {/* Two-column area */}
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Activity Overview</h3>
        <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center text-sm text-gray-400">
          Chart placeholder
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Recent Events</h3>
        <div className="space-y-3">
          {['Deployment completed', 'New user signed up', 'Config updated', 'Alert resolved', 'Backup finished'].map((e) => (
            <div key={e} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-400 flex-none" />
              <span className="text-xs text-gray-600 truncate">{e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
