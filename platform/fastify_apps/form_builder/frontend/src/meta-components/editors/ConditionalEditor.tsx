import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { ConditionalMetaComponent, ConditionVariable, ConditionGroup } from '../../types';
import { MetaComponentEditor } from '../types';

// Operators available for conditions
const OPERATORS = [
  { value: 'is', label: 'is' },
  { value: 'is_not', label: 'is not' },
  { value: 'contains', label: 'contains' },
  { value: 'is_between', label: 'is between' },
  { value: 'isEmpty', label: 'is empty' },
  { value: 'isNotEmpty', label: 'is not empty' },
] as const;

type OperatorType = typeof OPERATORS[number]['value'];

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Default condition group
const createDefaultGroup = (): ConditionGroup => ({
  id: generateId(),
  name: 'Condition',
  enabled: true,
  variables: [],
  combineMode: 'and',
  actionText: '',
});

// Default condition variable
const createDefaultVariable = (): ConditionVariable => ({
  id: generateId(),
  elementId: '',
  operator: 'is',
  value: '',
});

// ============================================================================
// Sub-components
// ============================================================================

interface ConditionVariableRowProps {
  variable: ConditionVariable;
  availableElements: Array<{ id: string; label: string; type: string }>;
  onChange: (variable: ConditionVariable) => void;
  onDelete: () => void;
}

const ConditionVariableRow = ({
  variable,
  availableElements,
  onChange,
  onDelete,
}: ConditionVariableRowProps) => {
  const showValueInput = !['isEmpty', 'isNotEmpty'].includes(variable.operator);
  const showRangeInputs = variable.operator === 'is_between';

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
      {/* Variable (Element) Selector */}
      <select
        value={variable.elementId}
        onChange={(e) => onChange({ ...variable, elementId: e.target.value })}
        className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <option value="">Select variable...</option>
        {availableElements.map((el) => (
          <option key={el.id} value={el.id}>
            {el.label}
          </option>
        ))}
      </select>

      {/* Operator Selector */}
      <select
        value={variable.operator}
        onChange={(e) =>
          onChange({ ...variable, operator: e.target.value as OperatorType })
        }
        className="w-28 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {/* Value Input (conditional) */}
      {showValueInput && !showRangeInputs && (
        <input
          type="text"
          value={String(variable.value ?? '')}
          onChange={(e) => onChange({ ...variable, value: e.target.value })}
          placeholder="Value"
          className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      )}

      {/* Range Inputs (for is_between operator) */}
      {showRangeInputs && (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={variable.rangeFrom ?? ''}
            onChange={(e) =>
              onChange({ ...variable, rangeFrom: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="From"
            className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            value={variable.rangeTo ?? ''}
            onChange={(e) =>
              onChange({ ...variable, rangeTo: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="To"
            className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      )}

      {/* Delete Button */}
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        title="Remove condition"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ConditionGroupCardProps {
  group: ConditionGroup;
  availableElements: Array<{ id: string; label: string; type: string }>;
  onChange: (group: ConditionGroup) => void;
  onDelete: () => void;
  showDeleteButton: boolean;
}

const ConditionGroupCard = ({
  group,
  availableElements,
  onChange,
  onDelete,
  showDeleteButton,
}: ConditionGroupCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleVariableChange = (index: number, variable: ConditionVariable) => {
    const newVariables = [...group.variables];
    newVariables[index] = variable;
    onChange({ ...group, variables: newVariables });
  };

  const handleVariableDelete = (index: number) => {
    const newVariables = group.variables.filter((_, i) => i !== index);
    onChange({ ...group, variables: newVariables });
  };

  const handleAddVariable = () => {
    onChange({ ...group, variables: [...group.variables, createDefaultVariable()] });
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${group.enabled ? 'border-purple-200 bg-white' : 'border-gray-200 bg-gray-50'}`}>
      {/* Group Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {/* Expand/Collapse Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0.5 text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Enable/Disable Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={group.enabled}
            onChange={(e) => onChange({ ...group, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"></div>
        </label>

        {/* Group Name Input */}
        <input
          type="text"
          value={group.name}
          onChange={(e) => onChange({ ...group, name: e.target.value })}
          className="flex-1 px-2 py-1 text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0"
          placeholder="Condition name"
        />

        {/* Combine Mode Selector */}
        <select
          value={group.combineMode}
          onChange={(e) => onChange({ ...group, combineMode: e.target.value as 'and' | 'or' })}
          className="text-xs px-2 py-1 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>

        {/* Delete Group Button */}
        {showDeleteButton && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete condition group"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Group Content */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Condition Variables */}
          {group.variables.length > 0 ? (
            <div className="space-y-2">
              {group.variables.map((variable, index) => (
                <ConditionVariableRow
                  key={variable.id}
                  variable={variable}
                  availableElements={availableElements}
                  onChange={(v) => handleVariableChange(index, v)}
                  onDelete={() => handleVariableDelete(index)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No conditions defined</p>
          )}

          {/* Add Variable Button */}
          <button
            type="button"
            onClick={handleAddVariable}
            className="flex items-center gap-1 px-2 py-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add variable
          </button>

          {/* Action Text ("Then" outcome) */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Then (action text)
            </label>
            <input
              type="text"
              value={group.actionText}
              onChange={(e) => onChange({ ...group, actionText: e.target.value })}
              placeholder="e.g., Show success message, Enable submit button"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Editor Component
// ============================================================================

export const ConditionalEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const conditional = meta as ConditionalMetaComponent;

  // Initialize conditionGroups if not present (migration from legacy format)
  const conditionGroups: ConditionGroup[] = conditional.conditionGroups ?? [createDefaultGroup()];
  const groupCombineMode = conditional.groupCombineMode ?? 'and';

  // Find the source element label
  const sourceElement = availableElements.find((el) => el.id === conditional.sourceElementId);

  const handleGroupChange = (index: number, group: ConditionGroup) => {
    const newGroups = [...conditionGroups];
    newGroups[index] = group;
    onUpdate({ ...conditional, conditionGroups: newGroups });
  };

  const handleGroupDelete = (index: number) => {
    const newGroups = conditionGroups.filter((_, i) => i !== index);
    // Ensure at least one group exists
    if (newGroups.length === 0) {
      newGroups.push(createDefaultGroup());
    }
    onUpdate({ ...conditional, conditionGroups: newGroups });
  };

  const handleAddGroup = () => {
    onUpdate({
      ...conditional,
      conditionGroups: [...conditionGroups, createDefaultGroup()],
    });
  };

  const handleGroupCombineModeChange = (mode: 'and' | 'or' | 'else') => {
    onUpdate({ ...conditional, groupCombineMode: mode });
  };

  return (
    <div className="space-y-4">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={conditional.name}
          onChange={(e) => onUpdate({ ...conditional, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
        />
      </div>

      {/* Source Element (read-only) */}
      {conditional.sourceElementId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Element
          </label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-600">
            {sourceElement ? (
              <>
                <span className="font-medium">{sourceElement.label}</span>
                <span className="text-gray-400 ml-2">({sourceElement.type})</span>
              </>
            ) : (
              <span className="text-gray-400">Element not found</span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            This condition is attached to this element
          </p>
        </div>
      )}

      {/* Condition Groups */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Condition Groups
        </label>

        {conditionGroups.map((group, index) => (
          <div key={group.id}>
            {/* Connector between groups */}
            {index > 0 && (
              <div className="flex items-center justify-center my-2">
                <div className="flex-1 border-t border-gray-200" />
                <select
                  value={groupCombineMode}
                  onChange={(e) =>
                    handleGroupCombineModeChange(e.target.value as 'and' | 'or' | 'else')
                  }
                  className="mx-3 px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="and">AND</option>
                  <option value="or">OR</option>
                  <option value="else">ELSE</option>
                </select>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            )}

            <ConditionGroupCard
              group={group}
              availableElements={availableElements}
              onChange={(g) => handleGroupChange(index, g)}
              onDelete={() => handleGroupDelete(index)}
              showDeleteButton={conditionGroups.length > 1}
            />
          </div>
        ))}
      </div>

      {/* Add Group Button */}
      <button
        type="button"
        onClick={handleAddGroup}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add condition group
      </button>

      {/* Legacy Info (if present) */}
      {conditional.condition && !conditional.conditionGroups && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-700">
            <strong>Note:</strong> This condition uses the legacy format. Add a condition
            group above to upgrade to the new format.
          </p>
        </div>
      )}
    </div>
  );
};
