import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useTemplates, useDeleteTemplate } from '../../hooks/useTemplates';
import { DataTable, type Column } from '../../components/tables/DataTable';
import type { Template } from '../../types';

export function TemplatesListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const { data, isLoading, error } = useTemplates({ page, limit: 20 });
  const deleteMutation = useDeleteTemplate();

  const columns: Column<Template>[] = [
    {
      key: 'templateId',
      header: 'Template ID',
      render: (t) => (
        <span className="font-mono text-sm text-gray-700">{t.templateId}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (t) => <span className="font-medium text-gray-900">{t.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (t) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {t.category}
        </span>
      ),
    },
    {
      key: 'steps',
      header: 'Steps',
      render: (t) => <span className="text-gray-600">{t.steps?.length ?? 0}</span>,
    },
    {
      key: 'version',
      header: 'Version',
      render: (t) => <span className="text-gray-600">v{t.version}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(t);
          }}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete template"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.templateId);
    setDeleteTarget(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load templates</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage process checklist templates
          </p>
        </div>
        <Link
          to="/templates/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(t) => t.templateId}
        onRowClick={(t) => navigate(`/templates/${t.templateId}`)}
        isLoading={isLoading}
        emptyMessage="No templates found. Create your first template to get started."
      />

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
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

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Template
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
