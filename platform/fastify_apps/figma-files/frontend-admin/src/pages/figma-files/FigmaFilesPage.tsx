import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Figma,
  TrendingUp,
  Shield,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useFigmaFiles, useDeleteFigmaFile, apiToUiFigmaFile } from '@/hooks';
import { DataTable, Column, Pagination } from '@/components/tables';
import { ConfirmDialog } from '@/components/feedback';
import { isApiError } from '@/types/errors';
import type { FigmaFile } from '@/hooks';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'design_system', label: 'Design System' },
  { value: 'component_library', label: 'Component Library' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'icon_set', label: 'Icon Set' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'stable', label: 'Stable' },
  { value: 'beta', label: 'Beta' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'experimental', label: 'Experimental' },
];

const typeLabels: Record<string, string> = {
  design_system: 'Design System',
  component_library: 'Component Library',
  prototype: 'Prototype',
  illustration: 'Illustration',
  icon_set: 'Icon Set',
};

export function FigmaFilesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 10;

  const filters = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      type: typeFilter as FigmaFile['type'] | undefined || undefined,
      status: statusFilter as FigmaFile['status'] | undefined || undefined,
      include_tags: true,
    }),
    [page, search, typeFilter, statusFilter]
  );

  const {
    data: figmaFilesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFigmaFiles(filters);

  const deleteFigmaFile = useDeleteFigmaFile();

  const figmaFiles: FigmaFile[] = useMemo(() => {
    if (!figmaFilesResponse?.figmaFiles) return [];
    return figmaFilesResponse.figmaFiles.map(apiToUiFigmaFile);
  }, [figmaFilesResponse]);

  const columns: Column<FigmaFile>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (figmaFile) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Figma className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{figmaFile.name}</p>
            <p className="text-xs text-gray-500">
              {typeLabels[figmaFile.type] || figmaFile.type}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (figmaFile) => (
        <p className="text-gray-600 truncate max-w-xs">
          {figmaFile.description || '-'}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (figmaFile) => {
        const statusColors = {
          stable: 'bg-green-100 text-green-800',
          beta: 'bg-yellow-100 text-yellow-800',
          deprecated: 'bg-red-100 text-red-800',
          experimental: 'bg-purple-100 text-purple-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[figmaFile.status]}`}
          >
            {figmaFile.status}
          </span>
        );
      },
    },
    {
      key: 'componentCount',
      header: 'Components',
      sortable: true,
      render: (figmaFile) => (
        <span className="text-gray-900">{figmaFile.componentCount}</span>
      ),
    },
    {
      key: 'badges',
      header: 'Badges',
      render: (figmaFile) => (
        <div className="flex items-center gap-2">
          {figmaFile.trending && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}
          {figmaFile.verified && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
              <Shield className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (figmaFile) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/figma-files/${figmaFile.id}`}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View
          </Link>
          <Link
            to={`/figma-files/${figmaFile.id}/edit`}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(figmaFile.id);
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
    if (!deleteId) return;
    try {
      await deleteFigmaFile.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Error handling via toast would be ideal
    }
  };

  if (isError) {
    const errorMessage = isApiError(error)
      ? error.getUserMessage()
      : 'Failed to load figma files';

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
          <h1 className="text-2xl font-bold text-gray-900">Figma Files</h1>
          <p className="text-gray-500 mt-1">
            Manage your Figma file entries
          </p>
        </div>
        <Link
          to="/figma-files/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Figma File
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search figma files..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {(typeFilter || statusFilter || search) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setTypeFilter('');
                    setStatusFilter('');
                    setSearch('');
                    setPage(1);
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <DataTable
        columns={columns}
        data={figmaFiles}
        keyExtractor={(figmaFile) => figmaFile.id}
        onRowClick={(figmaFile) => navigate(`/figma-files/${figmaFile.id}`)}
        emptyMessage="No figma files found"
        isLoading={isLoading}
      />

      {figmaFilesResponse?.pagination && figmaFilesResponse.pagination.totalPages > 1 && (
        <Pagination
          currentPage={figmaFilesResponse.pagination.page}
          totalPages={figmaFilesResponse.pagination.totalPages}
          totalItems={figmaFilesResponse.pagination.total}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Figma File"
        message="Are you sure you want to delete this figma file? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteFigmaFile.isPending}
      />
    </div>
  );
}
