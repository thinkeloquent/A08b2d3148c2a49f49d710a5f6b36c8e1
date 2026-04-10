/**
 * RestrictionAssignment Component
 * Multi-select for assigning restrictions to roles or groups
 */

import { useState } from 'react';
import { ShieldOff, Check, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useRestrictions, useCreateRestriction } from '@/hooks/useRestrictions';

interface RestrictionAssignmentProps {
  selectedRestrictions: string[];
  onChange: (restrictionIds: string[]) => void;
}

export function RestrictionAssignment({ selectedRestrictions, onChange }: RestrictionAssignmentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newRestrictionName, setNewRestrictionName] = useState('');
  const [newRestrictionDescription, setNewRestrictionDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: restrictionsData } = useRestrictions();
  const createRestriction = useCreateRestriction();

  const restrictions = restrictionsData || [];

  const filteredRestrictions = restrictions.filter(
    r =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exactMatch = restrictions.find(r => r.name.toLowerCase() === searchTerm.toLowerCase());

  const toggleRestriction = (restrictionId: string) => {
    if (selectedRestrictions.includes(restrictionId)) {
      onChange(selectedRestrictions.filter(id => id !== restrictionId));
    } else {
      onChange([...selectedRestrictions, restrictionId]);
    }
  };

  const handleCreateRestriction = async () => {
    if (!newRestrictionName.trim()) return;

    try {
      const result = await createRestriction.mutateAsync({
        name: newRestrictionName,
        description: newRestrictionDescription || undefined,
      });

      onChange([...selectedRestrictions, result.id]);

      setNewRestrictionName('');
      setNewRestrictionDescription('');
      setSearchTerm('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create restriction:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search/Create Input */}
      <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex gap-2 items-center mb-2">
          <ShieldOff className="w-4 h-4 text-primary-600" />
          <input
            type="text"
            placeholder="Search or create new restriction..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              if (e.target.value && !exactMatch) {
                setShowCreateForm(true);
                setNewRestrictionName(e.target.value);
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

        {showCreateForm && !exactMatch && (
          <div className="ml-6 space-y-2 mt-2">
            <input
              type="text"
              placeholder="Restriction description (optional)"
              value={newRestrictionDescription}
              onChange={e => setNewRestrictionDescription(e.target.value)}
              className="w-full px-3 py-1.5 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateRestriction}
              loading={createRestriction.isPending}
            >
              <PlusCircle className="w-3 h-3" />
              Create "{newRestrictionName}" restriction
            </Button>
          </div>
        )}
      </div>

      {/* Selected Restrictions */}
      {selectedRestrictions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Selected Restrictions ({selectedRestrictions.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedRestrictions.map(restrictionId => {
              const restriction = restrictions.find(r => r.id === restrictionId);
              return restriction ? (
                <span
                  key={restrictionId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm"
                >
                  {restriction.name}
                  <button
                    type="button"
                    onClick={() => toggleRestriction(restrictionId)}
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

      {/* Available Restrictions Grid */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Available Restrictions:</p>
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {filteredRestrictions.map(restriction => {
            const isAssigned = selectedRestrictions.includes(restriction.id);
            return (
              <button
                type="button"
                key={restriction.id}
                onClick={() => toggleRestriction(restriction.id)}
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
                    <div className="font-medium text-gray-900 truncate">{restriction.name}</div>
                    {restriction.description && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">{restriction.description}</div>
                    )}
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
