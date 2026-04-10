import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X } from 'lucide-react';
import { DataTable, type Column } from '../components/tables';
import { ConfirmDialog } from '../components/feedback';
import { useToast } from '../components/feedback/Toast';
import { useRuleTrees, useDeleteRuleTree } from '../hooks/useRuleTrees';
import { countRules } from '../utils/tree-helpers';
import { GRAPH_TYPE_LABELS, type GraphType, LANGUAGE_LABELS, type Language } from '../types/rule.types';
import type { RuleTree } from '../types/rule.types';

export function RuleTreesPage() {
  const navigate = useNavigate();
  const [graphTypeFilter, setGraphTypeFilter] = useState<string | undefined>(undefined);
  const { data, isLoading } = useRuleTrees(graphTypeFilter);
  const deleteRuleTree = useDeleteRuleTree();
  const { addToast } = useToast();

  const [deleteTarget, setDeleteTarget] = useState<RuleTree | null>(null);

  const trees = data?.trees || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRuleTree.mutateAsync(deleteTarget.id);
      addToast('success', `Rule tree "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
    } catch {
      addToast('error', 'Failed to delete rule tree');
    }
  };

  const columns: Column<RuleTree>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (tree) => (
        <div>
          <p className="font-medium text-slate-800">{tree.name}</p>
          {tree.description && (
            <p className="text-xs text-slate-400 mt-0.5">{tree.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      render: (tree) => (
        <span
          className={`pill ${
            tree.active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {tree.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {tree.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'graphType',
      header: 'Graph Type',
      sortable: true,
      render: (tree) => {
        const graphType = (tree as unknown as Record<string, unknown>).graph_type as string || 'conditional_logic';
        const label = GRAPH_TYPE_LABELS[graphType as GraphType] || graphType;
        return (
          <span className="pill bg-accent-50 text-accent-700 text-xs">
            {label}
          </span>
        );
      },
    },
    {
      key: 'language',
      header: 'Language',
      sortable: true,
      render: (tree) => {
        const language = (tree as unknown as Record<string, unknown>).language as string || '';
        const label = LANGUAGE_LABELS[language as Language] || language;
        return (
          <span className="pill bg-violet-50 text-violet-700 text-xs">
            {label}
          </span>
        );
      },
    },
    {
      key: 'rulesCount',
      header: 'Rules',
      render: (tree) => {
        const stats = tree.rules ? countRules(tree.rules) : { conditions: 0, groups: 0 };
        return (
          <span className="text-sm text-slate-500">
            {stats.conditions} conditions, {stats.groups} groups
          </span>
        );
      },
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      sortable: true,
      render: (tree) =>
        tree.updatedAt
          ? new Date(tree.updatedAt).toLocaleDateString()
          : '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (tree) => (
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trees/${tree.id}/edit`);
            }}
            className="text-sm text-accent-600 hover:text-accent-800 font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(tree);
            }}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Rule Trees</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your rule tree configurations</p>
        </div>
        <button
          onClick={() => navigate('/trees/new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Create Rule Tree
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setGraphTypeFilter(undefined)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            !graphTypeFilter
              ? 'bg-accent-100 text-accent-700 font-medium'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          All Types
        </button>
        {(Object.entries(GRAPH_TYPE_LABELS) as [GraphType, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setGraphTypeFilter(value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              graphTypeFilter === value
                ? 'bg-accent-100 text-accent-700 font-medium'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={trees}
        keyExtractor={(tree) => tree.id}
        onRowClick={(tree) => navigate(`/trees/${tree.id}`)}
        emptyMessage="No rule trees found. Create your first rule tree."
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Rule Tree"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteRuleTree.isPending}
      />
    </div>
  );
}
