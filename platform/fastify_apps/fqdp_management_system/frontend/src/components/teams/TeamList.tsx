/**
 * TeamList Component
 * List of teams with search, workspace filter, and create button
 */

import { useState, useMemo } from 'react';
import type { Team, EntityStatus } from '@/types';
import { TeamListItem } from './TeamListItem';
import { Input, Button, Spinner } from '@/components/ui';
import { useTeams } from '@/hooks/useTeams';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Plus, AlertCircle } from 'lucide-react';

export interface TeamListProps {
  selectedId?: string;
  onSelect: (team: Team) => void;
  onCreateClick: () => void;
  workspaceFilter?: string; // Optional pre-filter by workspace ID
}

export function TeamList({
  selectedId,
  onSelect,
  onCreateClick,
  workspaceFilter,
}: TeamListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('all');
  const [wsFilter, setWsFilter] = useState<string>(workspaceFilter || 'all');

  const { data, isLoading, error } = useTeams();
  const { data: workspacesData } = useWorkspaces();

  // Client-side filtering
  const filteredTeams = useMemo(() => {
    if (!data?.data) return [];

    let result = [...data.data];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (team) =>
          team.name.toLowerCase().includes(searchLower) ||
          team.slug.toLowerCase().includes(searchLower) ||
          team.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((team) => team.status === statusFilter);
    }

    // Workspace filter
    if (wsFilter !== 'all') {
      result = result.filter((team) => team.workspaceId === wsFilter);
    }

    return result;
  }, [data?.data, search, statusFilter, wsFilter]);

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Teams</h2>

        {/* Search */}
        <Input
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Workspace filter */}
        {!workspaceFilter && (
          <div>
            <label htmlFor="ws-filter" className="sr-only">
              Filter by workspace
            </label>
            <select
              id="ws-filter"
              value={wsFilter}
              onChange={(e) => setWsFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Workspaces</option>
              {workspacesData?.data.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
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
          Create Team
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
              <p className="text-sm">Failed to load teams</p>
            </div>
          </div>
        )}

        {!isLoading && !error && filteredTeams.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">
            {search || statusFilter !== 'all' || wsFilter !== 'all'
              ? 'No teams match your filters'
              : 'No teams yet'}
          </div>
        )}

        {!isLoading &&
          !error &&
          filteredTeams.map((team) => (
            <TeamListItem
              key={team.id}
              team={team}
              isSelected={team.id === selectedId}
              onClick={() => onSelect(team)}
            />
          ))}
      </div>

      {/* Footer with count */}
      {!isLoading && !error && (
        <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          Showing {filteredTeams.length} of {data?.data.length || 0} teams
        </div>
      )}
    </div>
  );
}
