import { useState, useMemo } from 'react';
import type { Organization, EntityStatus } from '@/types';
import { OrganizationListItem } from './OrganizationListItem';
import { Input, Button, Spinner } from '@/components/ui';
import { Plus, Search } from 'lucide-react';

export interface OrganizationListProps {
  organizations: Organization[];
  isLoading: boolean;
  error: Error | null;
  selectedId?: string;
  onSelect: (organization: Organization) => void;
  onCreateClick: () => void;
}

export function OrganizationList({
  organizations,
  isLoading,
  error,
  selectedId,
  onSelect,
  onCreateClick,
}: OrganizationListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('all');

  const filtered = useMemo(() => {
    let result = organizations;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (org) =>
          org.name.toLowerCase().includes(searchLower) ||
          org.slug.toLowerCase().includes(searchLower) ||
          org.description?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((org) => org.status === statusFilter);
    }

    return result;
  }, [organizations, search, statusFilter]);

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organizations</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="mt-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EntityStatus | 'all')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="work-in-progress">Work in Progress</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <Button onClick={onCreateClick} className="mt-3 w-full" variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">Error loading organizations</p>
            <p className="text-xs text-gray-500 mt-1">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">
              {search || statusFilter !== 'all'
                ? 'No organizations match your filters'
                : 'No organizations yet'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button onClick={onCreateClick} variant="ghost" size="sm" className="mt-2">
                Create your first organization
              </Button>
            )}
          </div>
        )}

        {!isLoading && !error && filtered.map((org) => (
          <OrganizationListItem
            key={org.id}
            organization={org}
            isSelected={org.id === selectedId}
            onClick={() => onSelect(org)}
          />
        ))}
      </div>

      {!isLoading && !error && filtered.length > 0 && (
        <div className="border-t border-gray-200 p-3">
          <p className="text-xs text-gray-500 text-center">
            Showing {filtered.length} of {organizations.length} organizations
          </p>
        </div>
      )}
    </div>
  );
}
