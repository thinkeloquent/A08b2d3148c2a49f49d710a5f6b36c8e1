/**
 * GroupAssignment Component
 * Assign groups to a role with inline creation
 * Based on REQ.v002.md Section 2.2 (Group Management)
 */

import { useState } from 'react';
import { Users, Check, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useGroups, useCreateGroup } from '@/hooks/useGroups';

interface GroupAssignmentProps {
  selectedGroups: string[];
  onChange: (groupIds: string[]) => void;
}

export function GroupAssignment({ selectedGroups, onChange }: GroupAssignmentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: groupsData } = useGroups({ status: 'active' });
  const createGroup = useCreateGroup();

  const groups = groupsData?.data || [];

  // Filter groups by search
  const filteredGroups = groups.filter(
    g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if search term matches existing group
  const exactMatch = groups.find(g => g.name.toLowerCase() === searchTerm.toLowerCase());

  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      onChange(selectedGroups.filter(id => id !== groupId));
    } else {
      onChange([...selectedGroups, groupId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const result = await createGroup.mutateAsync({
        name: newGroupName,
        description: newGroupDescription || `${newGroupName} group`,
      });

      // Add to selected groups
      onChange([...selectedGroups, result.id]);

      // Reset form
      setNewGroupName('');
      setNewGroupDescription('');
      setSearchTerm('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search/Create Input */}
      <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex gap-2 items-center mb-2">
          <Users className="w-4 h-4 text-primary-600" />
          <input
            type="text"
            placeholder="Search or create new group..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              if (e.target.value && !exactMatch) {
                setShowCreateForm(true);
                setNewGroupName(e.target.value);
              } else {
                setShowCreateForm(false);
              }
            }}
            className="flex-1 px-3 py-1.5 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setShowCreateForm(false);
              }}
              className="p-1 hover:bg-primary-100 rounded"
            >
              <X className="w-4 h-4 text-primary-600" />
            </button>
          )}
        </div>

        {/* Create New Group Form */}
        {showCreateForm && !exactMatch && (
          <div className="ml-6 space-y-2 mt-2">
            <input
              type="text"
              placeholder="Group description (optional)"
              value={newGroupDescription}
              onChange={e => setNewGroupDescription(e.target.value)}
              className="w-full px-3 py-1.5 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateGroup}
              loading={createGroup.isPending}
            >
              <PlusCircle className="w-3 h-3" />
              Create "{newGroupName}" group
            </Button>
          </div>
        )}
      </div>

      {/* Selected Groups */}
      {selectedGroups.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Selected Groups ({selectedGroups.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedGroups.map(groupId => {
              const group = groups.find(g => g.id === groupId);
              return group ? (
                <span
                  key={groupId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm"
                >
                  {group.name}
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupId)}
                    className="hover:text-danger-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Available Groups Grid */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Available Groups:</p>
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {filteredGroups.map(group => {
            const isAssigned = selectedGroups.includes(group.id);
            return (
              <button
                type="button"
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-left
                  ${
                    isAssigned
                      ? 'bg-primary-50 border-primary-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{group.name}</div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">{group.description}</div>
                  </div>
                  {isAssigned && <Check className="w-4 h-4 text-primary-600 flex-shrink-0 ml-2" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
