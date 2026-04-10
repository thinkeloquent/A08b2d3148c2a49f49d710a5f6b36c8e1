import { useMemo } from 'react';
import { createColumnHelper, type Row } from '@tanstack/react-table';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import CreatableSelect from 'react-select/creatable';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  FolderRoot,
  Group,
  FileText,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Braces,
  Info,
  Plug,
} from 'lucide-react';
import type { RuleItem, RuleGroup, RuleFolder, RuleStructural, RuleCondition, GitMetadata } from '../../types/rule.types';
import { isContainer } from '../../utils/tree-helpers';
import { operatorsByType } from '../../utils/field-config';
import { ActionButtons } from './ActionButtons';
import { OperatorSelect } from './OperatorSelect';

/**
 * Collect distinct field values from all conditions in the tree.
 */
function collectFields(node: RuleGroup): string[] {
  const fields = new Set<string>();
  function walk(item: RuleItem) {
    if (item.type === 'condition') {
      const c = item as RuleCondition;
      if (c.field) fields.add(c.field);
    } else if (isContainer(item)) {
      (item as RuleGroup).conditions.forEach(walk);
    }
  }
  node.conditions.forEach(walk);
  return [...fields].sort();
}

const creatableSelectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: '32px',
    fontSize: '0.875rem',
    borderColor: state.isFocused ? '#818cf8' : '#e2e8f0',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(129,140,248,0.25)' : 'none',
    '&:hover': { borderColor: '#818cf8' },
  }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: '0 8px' }),
  input: (base: Record<string, unknown>) => ({ ...base, margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: 'none' as const }),
  dropdownIndicator: (base: Record<string, unknown>) => ({ ...base, padding: '4px' }),
  menu: (base: Record<string, unknown>) => ({ ...base, zIndex: 50, borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.06)' }),
  menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 }),
};

export interface TableMeta {
  rules: RuleGroup;
  onUpdate: (item: RuleItem) => void;
  onDelete: (id: string) => void;
  onAddCondition: (parentId: string) => void;
  onAddGroup: (parentId: string) => void;
  onAddFolder: (parentId: string) => void;
  onToggleExpand: (id: string) => void;
  onDuplicate: (item: RuleItem) => void;
  dragListeners: Record<string, SyntheticListenerMap | undefined>;
  hoveredRowId: string | null;
  setHoveredRowId: (id: string | null) => void;
  git: GitMetadata;
  onShowInfo: (item: RuleItem) => void;
  onShowIntegration: (item: RuleItem) => void;
}

function isParentEnabled(row: Row<RuleItem>): boolean {
  let parent = row.getParentRow();
  while (parent) {
    if (!parent.original.enabled) return false;
    parent = parent.getParentRow();
  }
  return true;
}

const columnHelper = createColumnHelper<RuleItem>();

export function useColumns() {
  return useMemo(
    () => [
      // Drag handle
      columnHelper.display({
        id: 'drag',
        size: 32,
        header: () => null,
        cell: ({ row, table }) => {
          const meta = table.options.meta as TableMeta;
          const listeners = meta.dragListeners[row.id];
          return (
            <button
              type="button"
              className="p-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none transition-colors"
              {...listeners}
            >
              <GripVertical className="w-4 h-4" />
            </button>
          );
        },
      }),

      // Expand/Collapse
      columnHelper.display({
        id: 'expand',
        size: 48,
        header: () => <span className="sr-only">Expand</span>,
        cell: ({ row }) => {
          const item = row.original;
          const canExpand = isContainer(item);
          // Width grows with depth: base 28px + 24px per level
          const indent = row.depth * 24;
          return (
            <div
              className="flex items-center whitespace-nowrap"
              style={{ minWidth: `${28 + indent}px`, paddingLeft: `${indent}px` }}
            >
              {canExpand ? (
                <button
                  onClick={row.getToggleExpandedHandler()}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center ml-1">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                </div>
              )}
            </div>
          );
        },
      }),

      // Select checkbox
      columnHelper.display({
        id: 'select',
        size: 40,
        header: ({ table }) => (
          <input
            type="checkbox"
            className="w-4 h-4 text-accent-600 border-slate-300 rounded focus:ring-accent-400"
            checked={table.getIsAllRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomeRowsSelected();
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="w-4 h-4 text-accent-600 border-slate-300 rounded focus:ring-accent-400"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            ref={(el) => {
              if (el) el.indeterminate = row.getIsSomeSelected();
            }}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),

      // Type icon
      columnHelper.display({
        id: 'type',
        size: 48,
        header: () => 'Type',
        cell: ({ row }) => {
          const item = row.original;
          if (item.type === 'group') {
            if (row.depth === 0) {
              return <span title="Root Group"><FolderRoot className="w-5 h-5 text-amber-500" /></span>;
            }
            return row.getIsExpanded() ? (
              <span title="Group (expanded)"><FolderOpen className="w-5 h-5 text-amber-500" /></span>
            ) : (
              <span title="Group"><Folder className="w-5 h-5 text-amber-500" /></span>
            );
          }
          if (item.type === 'structural') {
            return <span title="Structural"><Braces className="w-5 h-5 text-violet-500" /></span>;
          }
          if (item.type === 'folder') {
            return <span title="Folder"><Group className="w-5 h-5 text-indigo-400" /></span>;
          }
          return <span title="Condition"><FileText className="w-5 h-5 text-slate-400" /></span>;
        },
      }),

      // Link to source
      columnHelper.display({
        id: 'link',
        size: 40,
        header: () => <span className="sr-only">Link</span>,
        cell: ({ row }) => {
          const item = row.original;
          // source_url comes from the API in snake_case
          const url = (item as unknown as Record<string, unknown>).source_url as string | undefined
            || item.sourceUrl;
          if (!url) return null;
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
              title="Open in GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          );
        },
      }),

      // Info
      columnHelper.display({
        id: 'info',
        size: 32,
        header: () => <span className="sr-only">Info</span>,
        cell: ({ row, table }) => {
          const meta = table.options.meta as TableMeta;
          const item = row.original;
          return (
            <button
              type="button"
              onClick={() => meta.onShowInfo(item)}
              className="p-1 text-slate-300 hover:text-accent-500 transition-colors"
              title="View details"
            >
              <Info className="w-4 h-4" />
            </button>
          );
        },
      }),

      // Integration
      columnHelper.display({
        id: 'integration',
        size: 32,
        header: () => <span className="sr-only">Integration</span>,
        cell: ({ row, table }) => {
          const meta = table.options.meta as TableMeta;
          const item = row.original;
          return (
            <button
              type="button"
              onClick={() => meta.onShowIntegration(item)}
              className="p-1 text-slate-300 hover:text-teal-500 transition-colors"
              title="Integrations"
            >
              <Plug className="w-4 h-4" />
            </button>
          );
        },
      }),

      // Logic / Field
      columnHelper.display({
        id: 'logicField',
        size: 180,
        header: () => 'Logic / Field',
        cell: ({ row, table }) => {
          const meta = table.options.meta as TableMeta;
          const item = row.original;
          const isEnabled = item.enabled && isParentEnabled(row);

          const logicColors: Record<string, string> = {
            AND: 'bg-blue-50 text-blue-700 border-blue-200',
            OR: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            NOT: 'bg-red-50 text-red-700 border-red-200',
            XOR: 'bg-purple-50 text-purple-700 border-purple-200',
          };

          if (item.type === 'group') {
            const group = item as RuleGroup;
            return (
              <div className="flex items-center gap-2">
                <select
                  value={group.logic || 'AND'}
                  onChange={(e) =>
                    meta.onUpdate({
                      ...group,
                      logic: e.target.value as 'AND' | 'OR' | 'NOT' | 'XOR',
                    })
                  }
                  disabled={!isEnabled}
                  className={`px-3 py-1 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 ${
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
                  onChange={(e) => meta.onUpdate({ ...group, name: e.target.value })}
                  disabled={!isEnabled}
                  placeholder="Group name..."
                  className="flex-1 px-2 py-1 text-sm text-slate-500 italic bg-amber-50/50 border border-dashed border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>
            );
          }

          if (item.type === 'structural') {
            const structural = item as RuleStructural;
            const nodeLabel = structural.nodeType || 'scope';
            const vars = structural.evaluatedVariables || [];
            return (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-sm font-medium bg-violet-50 text-violet-700 border border-violet-200 rounded-lg whitespace-nowrap">
                  {nodeLabel}
                </span>
                <span className="text-sm text-slate-600 truncate" title={structural.name}>
                  {structural.parentScope || structural.name}
                </span>
                {vars.length > 0 && (
                  <span className="text-xs text-slate-400 truncate" title={vars.join(', ')}>
                    [{vars.join(', ')}]
                  </span>
                )}
              </div>
            );
          }

          if (item.type === 'folder') {
            const folder = item as RuleFolder;
            return (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-sm font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg">
                  FOLDER
                </span>
                <input
                  type="text"
                  value={folder.name}
                  onChange={(e) => meta.onUpdate({ ...folder, name: e.target.value })}
                  disabled={!isEnabled}
                  placeholder="Folder name..."
                  className="flex-1 px-2 py-1 text-sm text-slate-500 italic bg-indigo-50/50 border border-dashed border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>
            );
          }

          const condition = item as RuleCondition;
          // Build options from existing field values in the tree
          const existingFields = collectFields(meta.rules);
          const dynamicFieldOptions = existingFields.map((f) => ({ value: f, label: f }));
          const selectedOption = condition.field
            ? (dynamicFieldOptions.find((o) => o.value === condition.field)
              || { value: condition.field, label: condition.field })
            : null;

          return (
            <CreatableSelect
              value={selectedOption}
              onChange={(opt) => {
                if (!opt) return;
                meta.onUpdate({
                  ...condition,
                  field: opt.value,
                  dataType: 'string',
                  operator: condition.operator || operatorsByType.string[0].value,
                });
              }}
              options={dynamicFieldOptions}
              isDisabled={!isEnabled}
              isClearable={false}
              placeholder="Select or type a field..."
              formatCreateLabel={(input) => `Use "${input}"`}
              classNamePrefix="rs"
              menuPortalTarget={document.body}
              styles={{
                ...creatableSelectStyles,
                control: (base, state) => ({
                  ...creatableSelectStyles.control(base, state),
                  backgroundColor: !isEnabled ? '#f8fafc' : (base.backgroundColor as string),
                }),
              }}
            />
          );
        },
      }),

      // Operator
      columnHelper.display({
        id: 'operator',
        size: 140,
        header: () => 'Operator',
        cell: ({ row, table }) => {
          const meta = table.options.meta as TableMeta;
          const item = row.original;
          if (isContainer(item)) return null;

          const condition = item as RuleCondition;
          const isEnabled = item.enabled && isParentEnabled(row);
          const fieldType = condition.dataType || 'string';
          const operators = operatorsByType[fieldType] || operatorsByType.string;

          return (
            <OperatorSelect
              value={condition.operator}
              operators={operators}
              onChange={(val) => meta.onUpdate({ ...condition, operator: val })}
              disabled={!isEnabled}
            />
          );
        },
      }),

      // Value Type
      columnHelper.display({
        id: 'valueType',
        size: 120,
        header: () => 'Value Type',
        cell: ({ row, table }) => {
          const meta = table.options.meta as TableMeta;
          const item = row.original;
          if (isContainer(item)) return null;

          const condition = item as RuleCondition;
          const isEnabled = item.enabled && isParentEnabled(row);

          return (
            <select
              value={condition.valueType}
              onChange={(e) =>
                meta.onUpdate({
                  ...condition,
                  valueType: e.target.value as 'value' | 'field' | 'function' | 'regex',
                })
              }
              disabled={!isEnabled}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
            >
              <option value="value">Value</option>
              <option value="field">Field</option>
              <option value="function">Function</option>
              <option value="regex">Regex</option>
            </select>
          );
        },
      }),

      // Value
      columnHelper.display({
        id: 'value',
        size: 200,
        header: () => 'Value',
        cell: ({ row, table }) => {
          const meta = table.options.meta as TableMeta;
          const item = row.original;

          if (isContainer(item)) {
            const container = item as RuleGroup | RuleFolder;
            return (
              <div className="text-sm text-slate-400">
                {container.conditions.length} {container.conditions.length === 1 ? 'item' : 'items'}
              </div>
            );
          }

          const condition = item as RuleCondition;
          const isEnabled = item.enabled && isParentEnabled(row);
          const fieldType = condition.dataType || 'string';

          return (
            <div className="flex items-center gap-2">
              {condition.valueType === 'field' ? (
                <select
                  value={condition.value}
                  onChange={(e) => meta.onUpdate({ ...condition, value: e.target.value })}
                  disabled={!isEnabled}
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="">Select field...</option>
                  {collectFields(meta.rules).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
                  value={condition.value}
                  onChange={(e) => meta.onUpdate({ ...condition, value: e.target.value })}
                  disabled={!isEnabled}
                  placeholder={`Enter ${condition.valueType}...`}
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors placeholder:text-slate-300"
                />
              )}
              {condition.validation && !condition.validation.isValid && (
                <div className="relative group">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                    {condition.validation.message}
                  </div>
                </div>
              )}
            </div>
          );
        },
      }),

      // Status
      columnHelper.display({
        id: 'status',
        size: 96,
        header: () => 'Status',
        cell: ({ row }) => {
          const item = row.original;
          const condition = item as RuleCondition;
          const isEnabled = item.enabled && isParentEnabled(row);

          return (
            <div className="flex items-center justify-center">
              {condition.validation?.isValid === false ? (
                <span className="pill bg-red-50 text-red-600">
                  <X className="w-3 h-3" />
                  Invalid
                </span>
              ) : isEnabled ? (
                <span className="pill bg-emerald-50 text-emerald-700">
                  <Check className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="pill bg-slate-100 text-slate-500">
                  <X className="w-3 h-3" />
                  Disabled
                </span>
              )}
            </div>
          );
        },
      }),

      // Actions
      columnHelper.display({
        id: 'actions',
        size: 128,
        header: () => 'Actions',
        cell: ({ row, table }) => {
          const meta = table.options.meta as TableMeta;
          const item = row.original;
          const itemIsContainer = isContainer(item);
          const showActions = meta.hoveredRowId === row.id;

          return (
            <ActionButtons
              isContainer={itemIsContainer}
              showActions={showActions}
              onAddCondition={() => meta.onAddCondition(item.id)}
              onAddGroup={() => meta.onAddGroup(item.id)}
              onAddFolder={() => meta.onAddFolder(item.id)}
              onDuplicate={() => meta.onDuplicate(item)}
              onDelete={() => meta.onDelete(item.id)}
            />
          );
        },
      }),
    ],
    []
  );
}
