/**
 * RoleList Component
 * Left panel showing list of roles with search
 * Based on REQ.v002.md Section 2.4 (Search and Navigation)
 */

import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { RoleListItem } from './RoleListItem';
import { useRoles } from '@/hooks/useRoles';
import type { Role } from '@/types';

interface RoleListProps {
  selectedRole: Role | null;
  onSelectRole: (role: Role) => void;
  onCreateNew: () => void;
}

export function RoleList({ selectedRole, onSelectRole, onCreateNew }: RoleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');

  // Fetch roles with filters
  const { data, isLoading, error } = useRoles({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const roles = data?.data || [];

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
              placeholder="Search roles..."
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
            Create New Role
          </Button>
        </div>

        {/* Role List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-danger-600 text-sm">Error loading roles</p>
              <p className="text-gray-500 text-xs mt-1">{error.message}</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'No roles found' : 'No roles yet'}
              </p>
              {!searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={onCreateNew}
                >
                  Create your first role
                </Button>
              )}
            </div>
          ) : (
            <div>
              {roles.map(role => (
                <RoleListItem
                  key={role.id}
                  role={role}
                  isSelected={selectedRole?.id === role.id}
                  onClick={() => onSelectRole(role)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {!isLoading && roles.length > 0 && (
          <div className="p-3 border-t border-gray-100 text-xs text-gray-500 text-center">
            {data?.pagination.total || 0} total roles
          </div>
        )}
      </div>
    </div>
  );
}
