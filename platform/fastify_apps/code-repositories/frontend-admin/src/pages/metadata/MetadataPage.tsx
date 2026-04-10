import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useRepositories, useDeleteMetadata } from '@/hooks';
import { DataTable, Column } from '@/components/tables';
import { ConfirmDialog } from '@/components/feedback';
import { isApiError } from '@/types/errors';
import type { Metadata } from '@/types/api';

interface MetadataWithRepo extends Metadata {
  repositoryName?: string;
}

export function MetadataPage() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    data: reposResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useRepositories({ include_metadata: true });

  const deleteMetadata = useDeleteMetadata();

  // Flatten metadata from all repositories
  const allMetadata: MetadataWithRepo[] = useMemo(() => {
    if (!reposResponse?.repositories) return [];
    const items: MetadataWithRepo[] = [];
    for (const repo of reposResponse.repositories) {
      if (repo.metadata) {
        for (const meta of repo.metadata) {
          items.push({
            ...meta,
            repositoryName: repo.name,
          });
        }
      }
    }
    return items;
  }, [reposResponse]);

  const columns: Column<MetadataWithRepo>[] = [
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
      render: (meta) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-green-500" />
          <span className="font-medium text-gray-900">{meta.name}</span>
        </div>
      ),
    },
    {
      key: 'repositoryName',
      header: 'Repository',
      sortable: true,
      render: (meta) => (
        <span className="text-gray-600">{meta.repositoryName || '-'}</span>
      ),
    },
    {
      key: 'contentType',
      header: 'Content Type',
      sortable: true,
      render: (meta) => (
        <span className="text-gray-500 text-sm">
          {meta.contentType || '-'}
        </span>
      ),
    },
    {
      key: 'sourceUrl',
      header: 'Source',
      render: (meta) =>
        meta.sourceUrl ? (
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            <span className="text-sm">View</span>
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: 'labels',
      header: 'Labels',
      render: (meta) => (
        <div className="flex flex-wrap gap-1">
          {meta.labels?.slice(0, 3).map((label) => (
            <span
              key={label}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {label}
            </span>
          ))}
          {meta.labels && meta.labels.length > 3 && (
            <span className="text-xs text-gray-400">
              +{meta.labels.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (meta) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/metadata/${meta.id}/edit`}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(meta.id);
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
      await deleteMetadata.mutateAsync({ id: deleteId });
      setDeleteId(null);
    } catch {
      // Error handling
    }
  };

  const metaToDelete = allMetadata.find((m) => m.id === deleteId);

  if (isError) {
    const errorMessage = isApiError(error)
      ? error.getUserMessage()
      : 'Failed to load metadata';

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
          <h1 className="text-2xl font-bold text-gray-900">Metadata</h1>
          <p className="text-gray-500 mt-1">
            View and manage documentation metadata across repositories
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={allMetadata}
        keyExtractor={(meta) => meta.id}
        onRowClick={(meta) => navigate(`/metadata/${meta.id}/edit`)}
        emptyMessage="No metadata found. Metadata is created through repositories."
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Metadata"
        message={`Are you sure you want to delete "${metaToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMetadata.isPending}
      />
    </div>
  );
}
