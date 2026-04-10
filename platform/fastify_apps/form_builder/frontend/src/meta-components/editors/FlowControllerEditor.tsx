import { useState, useMemo } from 'react';
import { Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { ConditionalMetaComponent, ConditionalRule, RootObjectType, ValueReference } from '../../types';
import { MetaComponentEditor } from '../types';

// Generate unique ID for new conditions
const generateConditionId = () => `cond-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default condition
const createDefaultCondition = (targetElementIds: string[]): ConditionalRule => ({
  id: generateConditionId(),
  sourceElementId: '',
  operator: 'equals',
  value: '',
  action: 'show',
  targetElementIds,
});

// Root object options for value reference
const ROOT_OBJECT_OPTIONS: { value: RootObjectType; label: string; description: string }[] = [
  { value: 'window', label: 'window', description: 'Browser window object' },
  { value: 'props', label: 'props', description: 'Component props' },
  { value: 'state', label: 'state', description: 'Component state' },
];

// Condition item component
interface ConditionItemProps {
  condition: ConditionalRule;
  index: number;
  availableElements: Array<{ id: string; label: string; type: string }>;
  onUpdate: (condition: ConditionalRule) => void;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  dragOverIndex: number | null;
}

const ConditionItem = ({
  condition,
  index,
  availableElements,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  dragOverIndex,
}: ConditionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDragEnd={onDragEnd}
      className={`
        rounded-md border bg-white
        ${isDragging ? 'opacity-50' : ''}
        ${dragOverIndex === index ? 'border-blue-500 border-2' : 'border-gray-200'}
        transition-colors
      `}
    >
      {/* Condition Header */}
      <div
        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700">
            Condition {index + 1}
          </span>
          {condition.sourceElementId && (
            <span className="ml-2 text-xs text-gray-500">
              {availableElements.find(e => e.id === condition.sourceElementId)?.label ?? condition.sourceElementId}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-gray-400 hover:text-red-500 rounded"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded Editor */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Source Element</label>
            <select
              value={condition.sourceElementId}
              onChange={(e) => onUpdate({ ...condition, sourceElementId: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="">Select element...</option>
              {availableElements.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.label} ({el.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
              <select
                value={condition.operator}
                onChange={(e) => onUpdate({ ...condition, operator: e.target.value as ConditionalRule['operator'] })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="equals">Equals</option>
                <option value="notEquals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="notContains">Not Contains</option>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
                <option value="isEmpty">Is Empty</option>
                <option value="isNotEmpty">Is Not Empty</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
              <input
                type="text"
                value={String(condition.value ?? '')}
                onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
                placeholder="Compare value"
                disabled={condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty'}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
            <select
              value={condition.action}
              onChange={(e) => onUpdate({ ...condition, action: e.target.value as ConditionalRule['action'] })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="show">Show</option>
              <option value="hide">Hide</option>
              <option value="enable">Enable</option>
              <option value="disable">Disable</option>
              <option value="setValue">Set Value</option>
            </select>
          </div>

          {condition.action === 'setValue' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Set Value To</label>
              <input
                type="text"
                value={String(condition.actionValue ?? '')}
                onChange={(e) => onUpdate({ ...condition, actionValue: e.target.value })}
                placeholder="Value to set"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const FlowControllerEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const flow = meta as ConditionalMetaComponent;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Get conditions from flowSpec or convert legacy format
  const conditions: ConditionalRule[] = useMemo(() => {
    if (flow.flowSpec?.conditions) {
      return flow.flowSpec.conditions;
    }
    // Convert legacy single condition
    if (flow.condition) {
      return [{
        id: `cond-${flow.id}`,
        sourceElementId: flow.condition.sourceElementId,
        operator: flow.condition.operator,
        value: flow.condition.value as string | number | boolean,
        action: flow.action ?? 'show',
        targetElementIds: flow.targetElementIds,
      }];
    }
    return [];
  }, [flow]);

  const combineMode = flow.flowSpec?.combineMode ?? 'and';
  const valueRef: ValueReference = flow.flowSpec?.valueRef ?? { rootObject: 'window', path: '' };

  // Find the source element (first target element - now read-only)
  const sourceElementId = flow.targetElementIds[0] ?? '';
  const sourceElement = availableElements.find((el) => el.id === sourceElementId);

  // Update flowSpec
  const updateFlowSpec = (updates: Partial<ConditionalMetaComponent['flowSpec']>) => {
    onUpdate({
      ...flow,
      flowSpec: {
        conditions: flow.flowSpec?.conditions ?? conditions,
        defaultAction: flow.flowSpec?.defaultAction ?? 'show',
        combineMode: flow.flowSpec?.combineMode ?? combineMode,
        valueRef: flow.flowSpec?.valueRef ?? valueRef,
        ...updates,
      },
    });
  };

  // Update value reference
  const updateValueRef = (updates: Partial<ValueReference>) => {
    updateFlowSpec({
      valueRef: { ...valueRef, ...updates },
    });
  };

  // Add new condition
  const handleAddCondition = () => {
    const newCondition = createDefaultCondition(flow.targetElementIds);
    updateFlowSpec({
      conditions: [...conditions, newCondition],
    });
  };

  // Update condition
  const handleUpdateCondition = (index: number, updated: ConditionalRule) => {
    const newConditions = [...conditions];
    newConditions[index] = updated;
    updateFlowSpec({ conditions: newConditions });
  };

  // Remove condition
  const handleRemoveCondition = (index: number) => {
    updateFlowSpec({
      conditions: conditions.filter((_, i) => i !== index),
    });
  };

  // Drag handlers
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) setDragOverIndex(index);
  };
  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newConditions = [...conditions];
      const [dragged] = newConditions.splice(dragIndex, 1);
      newConditions.splice(dragOverIndex, 0, dragged);
      updateFlowSpec({ conditions: newConditions });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Validation
  const hasEmptySource = conditions.some(c => !c.sourceElementId);

  return (
    <div className="p-4 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={flow.name}
          onChange={(e) => onUpdate({ ...flow, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Source Element (read-only) */}
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
            <span className="text-gray-400">No element attached</span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-400">
          This flow controller is attached to this element
        </p>
      </div>

      {/* Value Reference - replaces Default Action */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
        <label className="block text-sm font-medium text-blue-800">
          Value Reference
        </label>
        <p className="text-xs text-blue-600">
          Access values using dot notation: <code className="bg-blue-100 px-1 rounded">_.get($rootObject, $path)</code>
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Root Object */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              $rootObject
            </label>
            <select
              value={valueRef.rootObject}
              onChange={(e) => updateValueRef({ rootObject: e.target.value as RootObjectType })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {ROOT_OBJECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Path (dot notation) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              $path <span className="text-gray-400">(dot notation)</span>
            </label>
            <input
              type="text"
              value={valueRef.path}
              onChange={(e) => updateValueRef({ path: e.target.value })}
              placeholder="e.g., target.value"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Preview */}
        {valueRef.path && (
          <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded font-mono">
            _.get({valueRef.rootObject}, "{valueRef.path}")
          </div>
        )}
      </div>

      {/* Combine Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Combine Mode</label>
        <select
          value={combineMode}
          onChange={(e) => updateFlowSpec({ combineMode: e.target.value as 'and' | 'or' })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="and">All conditions (AND)</option>
          <option value="or">Any condition (OR)</option>
        </select>
      </div>

      {/* Validation Warning */}
      {hasEmptySource && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-xs text-amber-700">Some conditions are missing source elements</span>
        </div>
      )}

      {/* Conditions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Conditions ({conditions.length})
          </label>
          <button
            type="button"
            onClick={handleAddCondition}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
          >
            <Plus className="h-3 w-3" />
            Add Condition
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {conditions.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
              <p className="text-sm text-gray-400">
                No conditions defined. Add conditions to control element visibility.
              </p>
            </div>
          ) : (
            conditions.map((condition, index) => (
              <ConditionItem
                key={condition.id}
                condition={condition}
                index={index}
                availableElements={availableElements}
                onUpdate={(updated) => handleUpdateCondition(index, updated)}
                onRemove={() => handleRemoveCondition(index)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                isDragging={dragIndex === index}
                dragOverIndex={dragOverIndex}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
