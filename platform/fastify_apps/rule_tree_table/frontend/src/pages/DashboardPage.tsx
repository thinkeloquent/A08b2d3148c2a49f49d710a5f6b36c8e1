import { useNavigate } from 'react-router-dom';
import { Plus, GitBranch, ArrowRight } from 'lucide-react';
import { useRuleTrees } from '../hooks/useRuleTrees';
import { StatisticsCards } from '../components/stats';
import { countRules } from '../utils/tree-helpers';
import type { RuleTree } from '../types/rule.types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useRuleTrees();

  const trees = data?.trees || [];

  // Aggregate stats across all trees
  const aggregateStats = trees.reduce(
    (acc, tree) => {
      if (tree.rules) {
        const stats = countRules(tree.rules);
        acc.total += stats.conditions;
        acc.active += tree.active ? stats.conditions : 0;
        acc.groups += stats.groups;
        acc.folders += stats.folders;
        acc.conditions += stats.conditions;
      }
      return acc;
    },
    { total: 0, active: 0, groups: 0, folders: 0, conditions: 0 }
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage and monitor your rule trees</p>
        </div>
        <button
          onClick={() => navigate('/trees/new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Rule Tree
        </button>
      </div>

      <StatisticsCards
        totalRules={aggregateStats.total}
        activeRules={aggregateStats.active}
        groupCount={aggregateStats.groups}
        folderCount={aggregateStats.folders}
        conditionCount={aggregateStats.conditions}
      />

      <div className="card">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Rule Trees</h2>
          <p className="text-sm text-slate-400 mt-0.5">Quick access to your rule trees</p>
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-lg" />
              ))}
            </div>
          </div>
        ) : trees.length === 0 ? (
          <div className="p-12 text-center">
            <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-medium text-slate-600">No rule trees yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first rule tree to get started</p>
            <button
              onClick={() => navigate('/trees/new')}
              className="btn-primary mt-4 text-sm"
            >
              Create Rule Tree
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {trees.map((tree: RuleTree) => {
              const stats = tree.rules ? countRules(tree.rules) : { conditions: 0, groups: 0 };
              return (
                <li key={tree.id}>
                  <button
                    onClick={() => navigate(`/trees/${tree.id}`)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tree.active ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                        <GitBranch className={`w-5 h-5 ${tree.active ? 'text-emerald-500' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{tree.name}</p>
                        <p className="text-sm text-slate-400">
                          {stats.conditions} conditions, {stats.groups} groups
                          {tree.description && ` - ${tree.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`pill ${
                          tree.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tree.active ? 'Active' : 'Inactive'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-accent-500 transition-colors" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
