import type { BaseBlockProps } from '../../src';

export const WorkflowsMain = (_props: BaseBlockProps) => (
  <div className="space-y-6 py-6">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">All Workflows</h2>
      <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
        + New Workflow
      </button>
    </div>
    <div className="space-y-3">
      {[
        { name: 'User Onboarding', status: 'Active', runs: 1243 },
        { name: 'Invoice Approval', status: 'Active', runs: 892 },
        { name: 'Bug Triage', status: 'Draft', runs: 0 },
        { name: 'Deploy Pipeline', status: 'Active', runs: 3401 },
        { name: 'Content Review', status: 'Archived', runs: 567 },
      ].map((wf) => (
        <div key={wf.name} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{wf.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{wf.runs.toLocaleString()} runs</p>
          </div>
          <span className={[
            'text-xs font-medium px-2.5 py-1 rounded-full',
            wf.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
            wf.status === 'Draft' ? 'bg-amber-50 text-amber-700' :
            'bg-gray-100 text-gray-500',
          ].join(' ')}>
            {wf.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);
