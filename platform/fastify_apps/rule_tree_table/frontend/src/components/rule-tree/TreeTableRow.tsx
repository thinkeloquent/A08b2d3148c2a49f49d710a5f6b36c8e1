import { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  FileText,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import type { RuleItem, RuleGroup, RuleCondition } from '../../types/rule.types';
import { availableFields, operatorsByType } from '../../utils/field-config';
import { ActionButtons } from './ActionButtons';
import { OperatorSelect } from './OperatorSelect';

interface TreeTableRowProps {
  item: RuleItem;
  depth: number;
  onUpdate: (item: RuleItem) => void;
  onDelete: (id: string) => void;
  onAddCondition: (parentId: string) => void;
  onAddGroup: (parentId: string) => void;
  onToggleExpand?: (id: string) => void;
  onDuplicate: (item: RuleItem) => void;
  isLast?: boolean;
  parentEnabled?: boolean;
}

export function TreeTableRow({
  item,
  depth,
  onUpdate,
  onDelete,
  onAddCondition,
  onAddGroup,
  onToggleExpand,
  onDuplicate,
  isLast = false,
  parentEnabled = true,
}: TreeTableRowProps) {
  const [showActions, setShowActions] = useState(false);

  const isGroup = item.type === 'group' || item.type === 'structural';
  const group = item as RuleGroup;
  const condition = item as RuleCondition;
  const isEnabled = parentEnabled && item.enabled;

  // Get field type for condition
  const fieldType = useMemo(() => {
    if (!isGroup) {
      const field = availableFields.find((f) => f.value === condition.field);
      return field?.type || 'string';
    }
    return null;
  }, [isGroup, condition.field]);

  // Get available operators for field type
  const operators = useMemo(() => {
    if (!isGroup && fieldType) {
      return operatorsByType[fieldType] || operatorsByType.string;
    }
    return [];
  }, [isGroup, fieldType]);

  const handleFieldChange = (field: string) => {
    const fieldDef = availableFields.find((f) => f.value === field);
    if (fieldDef) {
      const newOperators = operatorsByType[fieldDef.type];
      onUpdate({
        ...condition,
        field,
        dataType: fieldDef.type as 'string' | 'number' | 'boolean' | 'date',
        operator: newOperators[0].value,
      });
    } else {
      // Custom field — default to string type
      onUpdate({
        ...condition,
        field,
        dataType: 'string',
        operator: operatorsByType.string[0].value,
      });
    }
  };

  const fieldOptions = useMemo(
    () => availableFields.map((f) => ({ value: f.value, label: f.label })),
    [],
  );

  const selectedFieldOption = useMemo(() => {
    if (isGroup) return null;
    const existing = fieldOptions.find((o) => o.value === condition.field);
    return existing || { value: condition.field, label: condition.field };
  }, [isGroup, condition.field, fieldOptions]);

  const logicColors: Record<string, string> = {
    AND: 'bg-blue-100 text-blue-700 border-blue-300',
    OR: 'bg-green-100 text-green-700 border-green-300',
    NOT: 'bg-red-100 text-red-700 border-red-300',
    XOR: 'bg-purple-100 text-purple-700 border-purple-300',
  };

  return (
    <>
      <tr
        className={`
          group transition-all duration-200
          ${isGroup ? 'bg-slate-100 hover:bg-slate-150' : isEnabled ? 'hover:bg-gray-50' : ''}
          ${!isEnabled ? 'opacity-50' : ''}
          ${!isGroup && depth > 0 ? 'bg-gray-50/50' : ''}
          ${isLast && depth > 0 ? 'border-b-2 border-gray-200' : 'border-b border-gray-100'}
        `}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Expand/Collapse & Type Column */}
        <td className="py-3 px-4 w-12">
          <div className="flex items-center" style={{ paddingLeft: `${depth * 24}px` }}>
            {isGroup ? (
              <button
                onClick={() => onToggleExpand?.(group.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {group.expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center ml-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            )}
          </div>
        </td>

        {/* Enable/Disable Column */}
        <td className="py-3 px-2 w-10">
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) => onUpdate({ ...item, enabled: e.target.checked })}
            disabled={!parentEnabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
        </td>

        {/* Type Icon Column */}
        <td className="py-3 px-2 w-12">
          {isGroup ? (
            group.expanded ? (
              <FolderOpen className="w-5 h-5 text-amber-600" />
            ) : (
              <Folder className="w-5 h-5 text-amber-600" />
            )
          ) : (
            <FileText className="w-5 h-5 text-gray-500" />
          )}
        </td>

        {/* Logic/Field Column */}
        <td className="py-3 px-4 min-w-[180px]">
          {isGroup ? (
            <div className="flex items-center gap-2">
              <select
                value={group.logic || 'AND'}
                onChange={(e) => onUpdate({ ...group, logic: e.target.value as 'AND' | 'OR' | 'NOT' | 'XOR' })}
                disabled={!isEnabled}
                className={`px-3 py-1 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  logicColors[group.logic || 'AND']
                } ${!isEnabled ? 'cursor-not-allowed' : ''}`}
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="NOT">NOT</option>
                <option value="XOR">XOR</option>
              </select>
              <input
                type="text"
                value={group.name}
                onChange={(e) => onUpdate({ ...group, name: e.target.value })}
                disabled={!isEnabled}
                placeholder="Group name..."
                className="flex-1 px-2 py-1 text-sm text-gray-500 italic bg-amber-50 border border-dashed border-amber-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          ) : (
            <CreatableSelect
              value={selectedFieldOption}
              onChange={(opt) => opt && handleFieldChange(opt.value)}
              options={fieldOptions}
              isDisabled={!isEnabled}
              isClearable={false}
              placeholder="Select or type a field..."
              formatCreateLabel={(input) => `Use "${input}"`}
              classNamePrefix="rs"
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '32px',
                  fontSize: '0.875rem',
                  borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
                  '&:hover': { borderColor: '#3b82f6' },
                  backgroundColor: !isEnabled ? '#f9fafb' : base.backgroundColor,
                }),
                valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                input: (base) => ({ ...base, margin: 0, padding: 0 }),
                indicatorSeparator: () => ({ display: 'none' }),
                dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
                menu: (base) => ({ ...base, zIndex: 50 }),
              }}
            />
          )}
        </td>

        {/* Operator Column */}
        <td className="py-3 px-4 min-w-[140px]">
          {!isGroup && (
            <OperatorSelect
              value={condition.operator}
              operators={operators}
              onChange={(val) => onUpdate({ ...condition, operator: val })}
              disabled={!isEnabled}
            />
          )}
        </td>

        {/* Value Type Column */}
        <td className="py-3 px-4 min-w-[120px]">
          {!isGroup && (
            <select
              value={condition.valueType}
              onChange={(e) =>
                onUpdate({ ...condition, valueType: e.target.value as 'value' | 'field' | 'function' | 'regex' })
              }
              disabled={!isEnabled}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="value">Value</option>
              <option value="field">Field</option>
              <option value="function">Function</option>
              <option value="regex">Regex</option>
            </select>
          )}
        </td>

        {/* Value Column */}
        <td className="py-3 px-4 min-w-[200px]">
          {!isGroup && (
            <div className="flex items-center gap-2">
              {condition.valueType === 'field' ? (
                <select
                  value={condition.value}
                  onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
                  disabled={!isEnabled}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select field...</option>
                  {availableFields
                    .filter((f) => f.type === fieldType)
                    .map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
                  value={condition.value}
                  onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
                  disabled={!isEnabled}
                  placeholder={`Enter ${condition.valueType}...`}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              )}
              {condition.validation && !condition.validation.isValid && (
                <div className="relative group">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {condition.validation.message}
                  </div>
                </div>
              )}
            </div>
          )}
          {isGroup && (
            <div className="text-sm text-gray-500">
              {group.conditions.length} {group.conditions.length === 1 ? 'rule' : 'rules'}
            </div>
          )}
        </td>

        {/* Status Column */}
        <td className="py-3 px-4 w-24">
          <div className="flex items-center justify-center">
            {condition.validation?.isValid === false ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                <X className="w-3 h-3" />
                Invalid
              </span>
            ) : isEnabled ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                <Check className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                <X className="w-3 h-3" />
                Disabled
              </span>
            )}
          </div>
        </td>

        {/* Actions Column */}
        <td className="py-3 px-4 w-32">
          <ActionButtons
            isContainer={isGroup}
            showActions={showActions}
            onAddCondition={() => onAddCondition(group.id)}
            onAddGroup={() => onAddGroup(group.id)}
            onDuplicate={() => onDuplicate(item)}
            onDelete={() => onDelete(item.id)}
          />
        </td>
      </tr>

      {/* Render children if group is expanded */}
      {isGroup &&
        group.expanded &&
        group.conditions.map((child, index) => (
          <TreeTableRow
            key={child.id}
            item={child}
            depth={depth + 1}
            onUpdate={(updatedChild) => {
              const newConditions = [...group.conditions];
              newConditions[index] = updatedChild;
              onUpdate({ ...group, conditions: newConditions });
            }}
            onDelete={(childId) => {
              const newConditions = group.conditions.filter((c) => c.id !== childId);
              onUpdate({ ...group, conditions: newConditions });
            }}
            onAddCondition={onAddCondition}
            onAddGroup={onAddGroup}
            onToggleExpand={onToggleExpand}
            onDuplicate={onDuplicate}
            isLast={index === group.conditions.length - 1}
            parentEnabled={isEnabled}
          />
        ))}
    </>
  );
}
