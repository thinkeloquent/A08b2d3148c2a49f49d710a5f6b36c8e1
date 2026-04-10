import { useState, useCallback, useMemo } from 'react';
import { Settings, Plus, Trash2, GripVertical } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import Select, { StylesConfig, components } from 'react-select';
import { GroupingMetaComponent, ContainerChildElement, ContainerChildLayoutItem } from '../../types';
import { MetaComponentEditor } from '../types';
import { draggableComponents } from '../../draggable-components';
import { useFormBuilder } from '../../context/FormBuilderContext';

// Generate unique ID for new elements
const generateId = () => `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Get component config by field type
const getComponentConfig = (fieldType: string) =>
  draggableComponents.find((c) => c.fieldType === fieldType);

// Option type for react-select
interface ElementOption {
  value: string;
  label: string;
  type: 'new' | 'existing';
  fieldType?: string;
  description?: string;
  elementId?: string;
}

interface GroupedOption {
  label: string;
  options: ElementOption[];
}

// Custom styles for react-select
const selectStyles: StylesConfig<ElementOption, false, GroupedOption> = {
  control: (base) => ({
    ...base,
    minHeight: '38px',
    borderColor: '#d1d5db',
    '&:hover': { borderColor: '#9ca3af' },
    boxShadow: 'none',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#4f46e5'
      : state.isFocused
      ? '#e0e7ff'
      : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    padding: '8px 12px',
  }),
  groupHeading: (base) => ({
    ...base,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#6b7280',
    padding: '8px 12px 4px',
    backgroundColor: '#f9fafb',
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
};

// Custom option component to show description
const CustomOption = (props: any) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div>
        <div className="font-medium">{data.label}</div>
        {data.description && (
          <div className="text-xs text-gray-500">{data.description}</div>
        )}
      </div>
    </components.Option>
  );
};

// Child Element List Item with popover menu
interface ChildElementItemProps {
  element: ContainerChildElement;
  index: number;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  dragOverIndex: number | null;
}

const ChildElementItem = ({
  element,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  dragOverIndex,
}: ChildElementItemProps) => {
  const componentConfig = getComponentConfig(element.type);
  const Icon = componentConfig?.icon;
  const description = componentConfig?.description || '';

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
        flex items-start gap-2 p-2 rounded-md border bg-white cursor-move
        ${isDragging ? 'opacity-50' : ''}
        ${dragOverIndex === index ? 'border-indigo-500 border-2' : 'border-gray-200'}
        hover:border-gray-300 transition-colors
      `}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0 pt-1 text-gray-400 cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
            {element.type}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-900 truncate">
          {element.label}
        </div>
        {description && (
          <div className="text-xs text-gray-500 truncate">
            {description}
          </div>
        )}
      </div>

      {/* Gear Menu */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Settings className="h-4 w-4" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-48 rounded-md border border-gray-200 bg-white shadow-lg"
            sideOffset={5}
            align="end"
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  onRemove();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <div className="border-t border-gray-100 my-1" />
              <div className="px-3 py-2 text-xs text-gray-400">
                More options coming soon...
              </div>
            </div>
            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export const GroupingEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const grouping = meta as GroupingMetaComponent;
  const [selectedOption, setSelectedOption] = useState<ElementOption | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Get context for moving elements between root and containers
  const { moveElementToContainer } = useFormBuilder();

  // Get IDs of elements already assigned to this grouping
  const assignedElementIds = useMemo(() => {
    return new Set(grouping.childElements.map((el) => el.id));
  }, [grouping.childElements]);

  // Build grouped options for the dropdown
  const groupedOptions: GroupedOption[] = useMemo(() => {
    // Group 1: Add New (component types)
    const newComponentOptions: ElementOption[] = draggableComponents.map((comp) => ({
      value: `new:${comp.fieldType}`,
      label: comp.type,
      type: 'new' as const,
      fieldType: comp.fieldType,
      description: comp.description,
    }));

    // Group 2: Existing unassigned elements from root
    const existingElementOptions: ElementOption[] = availableElements
      .filter((el) => !assignedElementIds.has(el.id))
      .map((el) => {
        const config = getComponentConfig(el.type);
        return {
          value: `existing:${el.id}`,
          label: el.label,
          type: 'existing' as const,
          fieldType: el.type,
          elementId: el.id,
          description: config?.description,
        };
      });

    const groups: GroupedOption[] = [
      {
        label: 'Add New Component',
        options: newComponentOptions,
      },
    ];

    if (existingElementOptions.length > 0) {
      groups.push({
        label: 'Existing Elements (Unassigned)',
        options: existingElementOptions,
      });
    }

    return groups;
  }, [availableElements, assignedElementIds]);

  // Handle adding element (either new or existing)
  const handleAddElement = () => {
    if (!selectedOption) return;

    if (selectedOption.type === 'new' && selectedOption.fieldType) {
      // Add a new element
      const componentConfig = draggableComponents.find(
        (c) => c.fieldType === selectedOption.fieldType
      );
      if (!componentConfig) return;

      const newId = generateId();
      const newElement: ContainerChildElement = {
        ...componentConfig.defaultProps,
        id: newId,
        type: componentConfig.fieldType,
        label: componentConfig.defaultProps.label,
      };

      const newLayoutItem: ContainerChildLayoutItem = {
        i: newId,
        x: 0,
        y: grouping.childLayout.length > 0
          ? Math.max(...grouping.childLayout.map((l) => l.y + l.h))
          : 0,
        w: componentConfig.layout.defaultW,
        h: componentConfig.layout.defaultH,
        minW: componentConfig.layout.minW,
        minH: componentConfig.layout.minH,
      };

      onUpdate({
        ...grouping,
        childElements: [...grouping.childElements, newElement],
        childLayout: [...grouping.childLayout, newLayoutItem],
      });
    } else if (selectedOption.type === 'existing' && selectedOption.elementId) {
      // Move existing element from root to this grouping using context function
      // This handles both removing from root and adding to container
      moveElementToContainer(selectedOption.elementId, null, grouping.id);
    }

    setSelectedOption(null);
  };

  // Remove a child element
  const handleRemoveElement = useCallback((elementId: string) => {
    onUpdate({
      ...grouping,
      childElements: grouping.childElements.filter((el) => el.id !== elementId),
      childLayout: grouping.childLayout.filter((l) => l.i !== elementId),
    });
  }, [grouping, onUpdate]);

  // Remove a member element reference
  const handleRemoveMember = (elementId: string) => {
    onUpdate({
      ...grouping,
      memberElementIds: grouping.memberElementIds.filter((id) => id !== elementId),
    });
  };

  // Drag and drop handlers for sorting
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder elements
    const newElements = [...grouping.childElements];
    const newLayout = [...grouping.childLayout];

    const [draggedElement] = newElements.splice(dragIndex, 1);
    newElements.splice(dragOverIndex, 0, draggedElement);

    const [draggedLayout] = newLayout.splice(dragIndex, 1);
    newLayout.splice(dragOverIndex, 0, draggedLayout);

    // Update Y positions to reflect new order
    let currentY = 0;
    const updatedLayout = newLayout.map((item) => {
      const updated = { ...item, y: currentY };
      currentY += item.h;
      return updated;
    });

    onUpdate({
      ...grouping,
      childElements: newElements,
      childLayout: updatedLayout,
    });

    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Label</label>
        <input
          type="text"
          value={grouping.label}
          onChange={(e) =>
            onUpdate({ ...grouping, label: e.target.value })
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Grid Mode</label>
        <select
          value={grouping.gridMode}
          onChange={(e) =>
            onUpdate({ ...grouping, gridMode: e.target.value as 'nested' | 'shared' })
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="nested">Nested Grid (independent)</option>
          <option value="shared">Shared Grid (reference-only)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {grouping.gridMode === 'nested'
            ? 'Elements dropped here have their own grid layout'
            : 'Elements are referenced but remain on the root grid'}
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="visible"
          checked={grouping.visible}
          onChange={(e) =>
            onUpdate({ ...grouping, visible: e.target.checked })
          }
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="visible" className="ml-2 block text-sm text-gray-700">
          Visible
        </label>
      </div>

      {grouping.gridMode === 'nested' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nested Grid Configuration
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-500">Columns</label>
              <input
                type="number"
                min={1}
                max={24}
                value={grouping.nestedGridConfig.cols}
                onChange={(e) =>
                  onUpdate({
                    ...grouping,
                    nestedGridConfig: {
                      ...grouping.nestedGridConfig,
                      cols: parseInt(e.target.value) || 12,
                    },
                  })
                }
                className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Row Height</label>
              <input
                type="number"
                min={10}
                max={100}
                value={grouping.nestedGridConfig.rowHeight}
                onChange={(e) =>
                  onUpdate({
                    ...grouping,
                    nestedGridConfig: {
                      ...grouping.nestedGridConfig,
                      rowHeight: parseInt(e.target.value) || 30,
                    },
                  })
                }
                className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Margin</label>
              <input
                type="number"
                min={0}
                max={20}
                value={grouping.nestedGridConfig.margin[0]}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 8;
                  onUpdate({
                    ...grouping,
                    nestedGridConfig: {
                      ...grouping.nestedGridConfig,
                      margin: [val, val],
                    },
                  });
                }}
                className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {grouping.gridMode === 'nested' ? 'Child Elements' : 'Member Elements'} ({
            grouping.gridMode === 'nested'
              ? grouping.childElements.length
              : grouping.memberElementIds.length
          })
        </label>

        {/* Add Element Dropdown - only for nested mode */}
        {grouping.gridMode === 'nested' && (
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <Select<ElementOption, false, GroupedOption>
                value={selectedOption}
                onChange={(option) => setSelectedOption(option)}
                options={groupedOptions}
                styles={selectStyles}
                components={{ Option: CustomOption }}
                placeholder="Select element to add..."
                isClearable
                isSearchable
                menuPlacement="auto"
              />
            </div>
            <button
              type="button"
              onClick={handleAddElement}
              disabled={!selectedOption}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Element List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {grouping.gridMode === 'nested' ? (
            grouping.childElements.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                <p className="text-sm text-gray-400">
                  No child elements. Use the dropdown above to add elements.
                </p>
              </div>
            ) : (
              grouping.childElements.map((el, index) => (
                <ChildElementItem
                  key={el.id}
                  element={el}
                  index={index}
                  onRemove={() => handleRemoveElement(el.id)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  isDragging={dragIndex === index}
                  dragOverIndex={dragOverIndex}
                />
              ))
            )
          ) : (
            grouping.memberElementIds.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                <p className="text-sm text-gray-400">
                  No elements referenced
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {grouping.memberElementIds.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2 rounded-md border border-gray-200 bg-white"
                  >
                    <span className="text-sm text-gray-600">{id}</span>
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          className="z-50 w-48 rounded-md border border-gray-200 bg-white shadow-lg"
                          sideOffset={5}
                          align="end"
                        >
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove Reference
                            </button>
                          </div>
                          <Popover.Arrow className="fill-white" />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
