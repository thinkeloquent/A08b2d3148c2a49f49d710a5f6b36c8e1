/**
 * GroupList Component
 * Left panel showing list of groups with search
 * Based on REQ.v002.md Section 3 (Group Management)
 */

import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { GroupListItem } from './GroupListItem';
import { useGroups } from '@/hooks/useGroups';
import { useRoles } from '@/hooks/useRoles';
import type { Group } from '@/types';

interface GroupListProps {
  selectedGroup: Group | null;
  onSelectGroup: (group: Group) => void;
  onCreateNew: () => void;
}

export function GroupList({ selectedGroup, onSelectGroup, onCreateNew }: GroupListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');

  // Fetch groups with filters
  const { data, isLoading, error } = useGroups({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  // Fetch all roles to calculate group usage
  const { data: rolesData } = useRoles();
  const allRoles = rolesData?.data || [];

  const groups = data?.data || [];

  // Calculate role count for each group
  const getGroupRoleCount = (groupId: string) => {
    return allRoles.filter(role => role.groups.includes(groupId)).length;
  };

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[calc(100vh-140px)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex gap-1">
            {['active', 'archived', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as typeof statusFilter)}
                className={`
                  px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize
                  ${
                    statusFilter === status
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <Button variant="primary" size="md" className="w-full" onClick={onCreateNew}>
            <Plus className="w-4 h-4" />
            Create New Group
          </Button>
        </div>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-danger-600 text-sm">Error loading groups</p>
              <p className="text-gray-500 text-xs mt-1">{error.message}</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'No groups found' : 'No groups yet'}
              </p>
              {!searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={onCreateNew}
                >
                  Create your first group
                </Button>
              )}
            </div>
          ) : (
            <div>
              {groups.map(group => (
                <GroupListItem
                  key={group.id}
                  group={group}
                  isSelected={selectedGroup?.id === group.id}
                  onClick={() => onSelectGroup(group)}
                  roleCount={getGroupRoleCount(group.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {!isLoading && groups.length > 0 && (
          <div className="p-3 border-t border-gray-100 text-xs text-gray-500 text-center">
            {data?.pagination.total || 0} total groups
          </div>
        )}
      </div>
    </div>
  );
}
