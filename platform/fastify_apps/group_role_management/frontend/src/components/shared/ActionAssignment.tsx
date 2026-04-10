/**
 * ActionAssignment Component
 * Multi-select for assigning actions to roles or groups
 */

import { useState } from 'react';
import { Zap, Check, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useActions, useCreateAction } from '@/hooks/useActions';

interface ActionAssignmentProps {
  selectedActions: string[];
  onChange: (actionIds: string[]) => void;
}

export function ActionAssignment({ selectedActions, onChange }: ActionAssignmentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newActionName, setNewActionName] = useState('');
  const [newActionDescription, setNewActionDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: actionsData } = useActions();
  const createAction = useCreateAction();

  const actions = actionsData || [];

  const filteredActions = actions.filter(
    a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exactMatch = actions.find(a => a.name.toLowerCase() === searchTerm.toLowerCase());

  const toggleAction = (actionId: string) => {
    if (selectedActions.includes(actionId)) {
      onChange(selectedActions.filter(id => id !== actionId));
    } else {
      onChange([...selectedActions, actionId]);
    }
  };

  const handleCreateAction = async () => {
    if (!newActionName.trim()) return;

    try {
      const result = await createAction.mutateAsync({
        name: newActionName,
        description: newActionDescription || undefined,
      });

      onChange([...selectedActions, result.id]);

      setNewActionName('');
      setNewActionDescription('');
      setSearchTerm('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create action:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search/Create Input */}
      <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex gap-2 items-center mb-2">
          <Zap className="w-4 h-4 text-primary-600" />
          <input
            type="text"
            placeholder="Search or create new action..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              if (e.target.value && !exactMatch) {
                setShowCreateForm(true);
                setNewActionName(e.target.value);
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
              placeholder="Action description (optional)"
              value={newActionDescription}
              onChange={e => setNewActionDescription(e.target.value)}
              className="w-full px-3 py-1.5 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateAction}
              loading={createAction.isPending}
            >
              <PlusCircle className="w-3 h-3" />
              Create "{newActionName}" action
            </Button>
          </div>
        )}
      </div>

      {/* Selected Actions */}
      {selectedActions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Selected Actions ({selectedActions.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedActions.map(actionId => {
              const action = actions.find(a => a.id === actionId);
              return action ? (
                <span
                  key={actionId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm"
                >
                  {action.name}
                  <button
                    type="button"
                    onClick={() => toggleAction(actionId)}
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

      {/* Available Actions Grid */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Available Actions:</p>
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {filteredActions.map(action => {
            const isAssigned = selectedActions.includes(action.id);
            return (
              <button
                type="button"
                key={action.id}
                onClick={() => toggleAction(action.id)}
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
                    <div className="font-medium text-gray-900 truncate">{action.name}</div>
                    {action.description && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">{action.description}</div>
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
