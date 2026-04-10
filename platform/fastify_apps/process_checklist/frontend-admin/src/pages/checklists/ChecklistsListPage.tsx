import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChecklists } from '../../hooks/useChecklists';
import { DataTable, type Column } from '../../components/tables/DataTable';
import type { ChecklistInstance } from '../../types';

export function ChecklistsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useChecklists({ page, limit: 20 });

  const columns: Column<ChecklistInstance>[] = [
    {
      key: 'checklistId',
      header: 'Checklist ID',
      render: (c) => (
        <span className="font-mono text-sm text-gray-700">
          {c.checklistId}
        </span>
      ),
    },
    {
      key: 'templateRef',
      header: 'Template',
      render: (c) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {c.templateRef}
        </span>
      ),
    },
    {
      key: 'steps',
      header: 'Steps',
      render: (c) => (
        <span className="text-gray-600">{c.steps?.length ?? 0}</span>
      ),
    },
    {
      key: 'generatedAt',
      header: 'Generated',
      render: (c) => (
        <span className="text-gray-600">
          {new Date(c.generatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'version',
      header: 'Template Version',
      render: (c) => (
        <span className="text-gray-600">v{c.metadata?.templateVersion}</span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load checklists</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checklists</h1>
        <p className="mt-1 text-sm text-gray-500">
          View generated checklist instances
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(c) => c.checklistId}
        onRowClick={(c) => navigate(`/checklists/${c.checklistId}`)}
        isLoading={isLoading}
        emptyMessage="No checklists generated yet."
      />

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing page {data.meta.page} of {data.meta.totalPages} (
            {data.meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.meta.totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
