/**
 * WorkspaceList Component
 * List of workspaces with search, organization filter, and create button
 */

import { useState, useMemo } from 'react';
import type { Workspace, EntityStatus } from '@/types';
import { WorkspaceListItem } from './WorkspaceListItem';
import { Input, Button, Spinner } from '@/components/ui';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Plus, AlertCircle } from 'lucide-react';

export interface WorkspaceListProps {
  selectedId?: string;
  onSelect: (workspace: Workspace) => void;
  onCreateClick: () => void;
  organizationFilter?: string; // Optional pre-filter by organization ID
}

export function WorkspaceList({
  selectedId,
  onSelect,
  onCreateClick,
  organizationFilter,
}: WorkspaceListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('all');
  const [orgFilter, setOrgFilter] = useState<string>(organizationFilter || 'all');

  const { data, isLoading, error } = useWorkspaces();
  const { data: orgsData } = useOrganizations();

  // Client-side filtering
  const filteredWorkspaces = useMemo(() => {
    if (!data?.data) return [];

    let result = [...data.data];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (workspace) =>
          workspace.name.toLowerCase().includes(searchLower) ||
          workspace.slug.toLowerCase().includes(searchLower) ||
          workspace.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((workspace) => workspace.status === statusFilter);
    }

    // Organization filter
    if (orgFilter !== 'all') {
      result = result.filter((workspace) => workspace.organizationId === orgFilter);
    }

    return result;
  }, [data?.data, search, statusFilter, orgFilter]);

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Workspaces</h2>

        {/* Search */}
        <Input
          placeholder="Search workspaces..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Organization filter */}
        {!organizationFilter && (
          <div>
            <label htmlFor="org-filter" className="sr-only">
              Filter by organization
            </label>
            <select
              id="org-filter"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Organizations</option>
              {orgsData?.data.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EntityStatus | 'all')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="work-in-progress">Work in Progress</option>
            <option value="archive">Archive</option>
            <option value="locked">Locked</option>
            <option value="frozen">Frozen</option>
          </select>
        </div>

        {/* Create button */}
        <Button onClick={onCreateClick} className="w-full" size="md">
          <Plus className="mr-2 h-4 w-4" />
          Create Workspace
        </Button>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Failed to load workspaces</p>
            </div>
          </div>
        )}

        {!isLoading && !error && filteredWorkspaces.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">
            {search || statusFilter !== 'all' || orgFilter !== 'all'
              ? 'No workspaces match your filters'
              : 'No workspaces yet'}
          </div>
        )}

        {!isLoading &&
          !error &&
          filteredWorkspaces.map((workspace) => (
            <WorkspaceListItem
              key={workspace.id}
              workspace={workspace}
              isSelected={workspace.id === selectedId}
              onClick={() => onSelect(workspace)}
            />
          ))}
      </div>

      {/* Footer with count */}
      {!isLoading && !error && (
        <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          Showing {filteredWorkspaces.length} of {data?.data.length || 0} workspaces
        </div>
      )}
    </div>
  );
}
