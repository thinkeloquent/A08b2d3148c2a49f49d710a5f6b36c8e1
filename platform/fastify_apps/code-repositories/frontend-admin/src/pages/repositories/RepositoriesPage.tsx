import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Package,
  Star,
  TrendingUp,
  Shield,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useRepositories, useDeleteRepository, apiToUiRepository } from '@/hooks';
import { DataTable, Column, Pagination } from '@/components/tables';
import { ConfirmDialog } from '@/components/feedback';
import { isApiError } from '@/types/errors';
import type { Repository } from '@/hooks';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'npm', label: 'NPM' },
  { value: 'docker', label: 'Docker' },
  { value: 'python', label: 'Python' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'stable', label: 'Stable' },
  { value: 'beta', label: 'Beta' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'experimental', label: 'Experimental' },
];

export function RepositoriesPage() {
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
      type: typeFilter as 'npm' | 'docker' | 'python' | undefined || undefined,
      status: statusFilter as 'stable' | 'beta' | 'deprecated' | 'experimental' | undefined || undefined,
      include_tags: true,
    }),
    [page, search, typeFilter, statusFilter]
  );

  const {
    data: reposResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useRepositories(filters);

  const deleteRepo = useDeleteRepository();

  const repositories: Repository[] = useMemo(() => {
    if (!reposResponse?.repositories) return [];
    return reposResponse.repositories.map(apiToUiRepository);
  }, [reposResponse]);

  const columns: Column<Repository>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (repo) => (
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              repo.type === 'npm'
                ? 'bg-red-100'
                : repo.type === 'docker'
                  ? 'bg-blue-100'
                  : 'bg-yellow-100'
            }`}
          >
            <Package
              className={`w-4 h-4 ${
                repo.type === 'npm'
                  ? 'text-red-600'
                  : repo.type === 'docker'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
              }`}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">{repo.name}</p>
            <p className="text-xs text-gray-500">{repo.type.toUpperCase()}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (repo) => (
        <p className="text-gray-600 truncate max-w-xs">
          {repo.description || '-'}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (repo) => {
        const statusColors = {
          stable: 'bg-green-100 text-green-800',
          beta: 'bg-yellow-100 text-yellow-800',
          deprecated: 'bg-red-100 text-red-800',
          experimental: 'bg-purple-100 text-purple-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[repo.status]}`}
          >
            {repo.status}
          </span>
        );
      },
    },
    {
      key: 'stars',
      header: 'Stars',
      sortable: true,
      render: (repo) => (
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-gray-900">{repo.stars}</span>
        </div>
      ),
    },
    {
      key: 'badges',
      header: 'Badges',
      render: (repo) => (
        <div className="flex items-center gap-2">
          {repo.trending && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}
          {repo.verified && (
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
      render: (repo) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/repositories/${repo.id}`}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View
          </Link>
          <Link
            to={`/repositories/${repo.id}/edit`}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(repo.id);
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
      await deleteRepo.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Error handling via toast would be ideal
    }
  };

  if (isError) {
    const errorMessage = isApiError(error)
      ? error.getUserMessage()
      : 'Failed to load repositories';

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
          <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
          <p className="text-gray-500 mt-1">
            Manage your package repository entries
          </p>
        </div>
        <Link
          to="/repositories/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Repository
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories..."
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
        data={repositories}
        keyExtractor={(repo) => repo.id}
        onRowClick={(repo) => navigate(`/repositories/${repo.id}`)}
        emptyMessage="No repositories found"
        isLoading={isLoading}
      />

      {reposResponse?.pagination && reposResponse.pagination.totalPages > 1 && (
        <Pagination
          currentPage={reposResponse.pagination.page}
          totalPages={reposResponse.pagination.totalPages}
          totalItems={reposResponse.pagination.total}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Repository"
        message="Are you sure you want to delete this repository? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteRepo.isPending}
      />
    </div>
  );
}
