import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Tags, AlertCircle, RefreshCw } from 'lucide-react';
import { useTags, useDeleteTag } from '@/hooks';
import { DataTable, Column } from '@/components/tables';
import { ConfirmDialog } from '@/components/feedback';
import { isApiError } from '@/types/errors';
import type { Tag } from '@/types/api';

export function TagsPage() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: tagsResponse, isLoading, isError, error, refetch } = useTags();
  const deleteTag = useDeleteTag();

  const tags = tagsResponse?.tags || [];

  const columns: Column<Tag>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      className: 'w-20',
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (tag) => (
        <div className="flex items-center gap-2">
          <Tags className="w-4 h-4 text-purple-500" />
          <span className="font-medium text-gray-900">#{tag.name}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (tag) => (
        <span className="text-gray-500">
          {tag.createdAt?.iso8601
            ? new Date(tag.createdAt.iso8601).toLocaleDateString()
            : '-'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (tag) => (
        <span className="text-gray-500">
          {tag.updatedAt?.iso8601
            ? new Date(tag.updatedAt.iso8601).toLocaleDateString()
            : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (tag) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/tags/${tag.id}/edit`}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(tag.id);
            }}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    try {
      await deleteTag.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Error handling
    }
  };

  const tagToDelete = tags.find((t) => t.id === deleteId);

  if (isError) {
    const errorMessage = isApiError(error)
      ? error.getUserMessage()
      : 'Failed to load tags';

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-500 mt-1">Manage repository categorization tags</p>
        </div>
        <Link
          to="/tags/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Tag
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={tags}
        keyExtractor={(tag) => tag.id}
        onRowClick={(tag) => navigate(`/tags/${tag.id}/edit`)}
        emptyMessage="No tags found. Create one to get started."
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tag"
        message={`Are you sure you want to delete the tag "${tagToDelete?.name}"? This will remove it from all repositories.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteTag.isPending}
      />
    </div>
  );
}
