import { Filter, Check, Folder, Group, FileText } from 'lucide-react';

export interface StatisticsCardsProps {
  totalRules: number;
  activeRules: number;
  groupCount: number;
  folderCount: number;
  conditionCount: number;
}

export function StatisticsCards({
  totalRules,
  activeRules,
  groupCount,
  folderCount,
  conditionCount,
}: StatisticsCardsProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">Overview</h2>
        <p className="text-sm text-slate-400 mt-0.5">Summary across all rule trees</p>
      </div>
      <div className="grid grid-cols-5 gap-4">
      <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-xs font-medium uppercase tracking-wide">Total Rules</p>
            <p className="text-2xl font-semibold text-blue-900 mt-1">{totalRules}</p>
          </div>
          <Filter className="w-8 h-8 text-blue-300" />
        </div>
      </div>
      <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-600 text-xs font-medium uppercase tracking-wide">Active Rules</p>
            <p className="text-2xl font-semibold text-emerald-900 mt-1">{activeRules}</p>
          </div>
          <Check className="w-8 h-8 text-emerald-300" />
        </div>
      </div>
      <div className="bg-purple-50/70 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-xs font-medium uppercase tracking-wide">Groups</p>
            <p className="text-2xl font-semibold text-purple-900 mt-1">{groupCount}</p>
          </div>
          <Folder className="w-8 h-8 text-purple-300" />
        </div>
      </div>
      <div className="bg-indigo-50/70 rounded-xl p-4 border border-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-600 text-xs font-medium uppercase tracking-wide">Folders</p>
            <p className="text-2xl font-semibold text-indigo-900 mt-1">{folderCount}</p>
          </div>
          <Group className="w-8 h-8 text-indigo-300" />
        </div>
      </div>
      <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-600 text-xs font-medium uppercase tracking-wide">Conditions</p>
            <p className="text-2xl font-semibold text-amber-900 mt-1">{conditionCount}</p>
          </div>
          <FileText className="w-8 h-8 text-amber-300" />
        </div>
      </div>
      </div>
    </div>
  );
}

export default StatisticsCards;
