import { useState, useMemo } from 'react';
import { Plus, Trash2, Settings, GripVertical, AlertCircle } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import Select, { StylesConfig } from 'react-select';
import { BlueprintMetaComponent, BlueprintSlot } from '../../types';
import { MetaComponentEditor } from '../types';

// Generate unique ID for new slots
const generateSlotId = () => `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Option type for react-select
interface ElementOption {
  value: string;
  label: string;
  type: string;
}

// Custom styles for react-select
const selectStyles: StylesConfig<ElementOption, true> = {
  control: (base) => ({
    ...base,
    minHeight: '32px',
    borderColor: '#d1d5db',
    '&:hover': { borderColor: '#9ca3af' },
    boxShadow: 'none',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#8b5cf6'
      : state.isFocused
        ? '#ede9fe'
        : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    padding: '6px 10px',
    fontSize: '12px',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#ede9fe',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#6d28d9',
    fontSize: '11px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#6d28d9',
    ':hover': {
      backgroundColor: '#c4b5fd',
      color: '#5b21b6',
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
};

// Available element types for slots
const ELEMENT_TYPES = [
  { value: 'text', label: 'Text Input', type: 'text' },
  { value: 'textarea', label: 'Text Area', type: 'textarea' },
  { value: 'number', label: 'Number', type: 'number' },
  { value: 'email', label: 'Email', type: 'email' },
  { value: 'select', label: 'Select', type: 'select' },
  { value: 'checkbox', label: 'Checkbox', type: 'checkbox' },
  { value: 'radio', label: 'Radio Group', type: 'radio' },
  { value: 'date', label: 'Date', type: 'date' },
  { value: 'file', label: 'File Upload', type: 'file' },
  { value: 'image', label: 'Image', type: 'image' },
  { value: 'button', label: 'Button', type: 'button' },
];

// Slot editor item component
interface SlotItemProps {
  slot: BlueprintSlot;
  index: number;
  assignedCount: number;
  onUpdate: (slot: BlueprintSlot) => void;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  dragOverIndex: number | null;
}

const SlotItem = ({
  slot,
  index,
  assignedCount,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  dragOverIndex,
}: SlotItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFilled = assignedCount > 0;
  const isOverCapacity = assignedCount > slot.maxElements;

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
        ${dragOverIndex === index ? 'border-purple-500 border-2' : 'border-gray-200'}
        transition-colors
      `}
    >
      {/* Slot Header */}
      <div
        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">{slot.name}</span>
            {slot.required && (
              <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">Required</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {assignedCount}/{slot.maxElements} elements
            {isOverCapacity && (
              <span className="ml-2 text-red-600">
                <AlertCircle className="h-3 w-3 inline" /> Over capacity
              </span>
            )}
          </div>
        </div>

        <div
          className={`w-2 h-2 rounded-full ${isFilled ? 'bg-green-500' : slot.required ? 'bg-red-500' : 'bg-gray-300'
            }`}
        />

        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
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
                  onClick={onRemove}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Slot
                </button>
              </div>
              <Popover.Arrow className="fill-white" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Expanded Slot Editor */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slot Name</label>
            <input
              type="text"
              value={slot.name}
              onChange={(e) => onUpdate({ ...slot, name: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Elements</label>
              <input
                type="number"
                min={1}
                max={20}
                value={slot.maxElements}
                onChange={(e) => onUpdate({ ...slot, maxElements: parseInt(e.target.value) || 1 })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-1.5">
                <input
                  type="checkbox"
                  checked={slot.required}
                  onChange={(e) => onUpdate({ ...slot, required: e.target.checked })}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                />
                <span className="text-xs text-gray-600">Required</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Allowed Types</label>
            <Select<ElementOption, true>
              isMulti
              value={ELEMENT_TYPES.filter((t) => slot.allowedTypes.includes(t.value))}
              onChange={(selected) => onUpdate({
                ...slot,
                allowedTypes: selected ? selected.map((s) => s.value) : [],
              })}
              options={ELEMENT_TYPES}
              styles={selectStyles}
              placeholder="All types allowed"
              isClearable
              isSearchable
              menuPlacement="auto"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder Text</label>
            <input
              type="text"
              value={slot.placeholder || ''}
              onChange={(e) => onUpdate({ ...slot, placeholder: e.target.value })}
              placeholder="Drag element here..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Position (Grid Units)</label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs text-gray-400">X</label>
                <input
                  type="number"
                  min={0}
                  value={slot.position.x}
                  onChange={(e) => onUpdate({
                    ...slot,
                    position: { ...slot.position, x: parseInt(e.target.value) || 0 },
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Y</label>
                <input
                  type="number"
                  min={0}
                  value={slot.position.y}
                  onChange={(e) => onUpdate({
                    ...slot,
                    position: { ...slot.position, y: parseInt(e.target.value) || 0 },
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">W</label>
                <input
                  type="number"
                  min={1}
                  value={slot.position.w}
                  onChange={(e) => onUpdate({
                    ...slot,
                    position: { ...slot.position, w: parseInt(e.target.value) || 1 },
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">H</label>
                <input
                  type="number"
                  min={1}
                  value={slot.position.h}
                  onChange={(e) => onUpdate({
                    ...slot,
                    position: { ...slot.position, h: parseInt(e.target.value) || 1 },
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const BlueprintEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const blueprint = meta as BlueprintMetaComponent;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Element options for slot assignment
  const elementOptions: ElementOption[] = useMemo(() =>
    availableElements.map((el) => ({
      value: el.id,
      label: el.label,
      type: el.type,
    })),
    [availableElements]
  );

  // Add a new slot
  const handleAddSlot = () => {
    const newSlot: BlueprintSlot = {
      id: generateSlotId(),
      name: `Slot ${(blueprint.slots?.length || 0) + 1}`,
      required: false,
      maxElements: 1,
      allowedTypes: [],
      position: { x: 0, y: (blueprint.slots?.length || 0) * 2, w: 6, h: 2 },
      placeholder: 'Drag element here',
    };

    onUpdate({
      ...blueprint,
      slots: [...(blueprint.slots || []), newSlot],
    });
  };

  // Update a slot
  const handleUpdateSlot = (updatedSlot: BlueprintSlot) => {
    onUpdate({
      ...blueprint,
      slots: blueprint.slots?.map((s) =>
        s.id === updatedSlot.id ? updatedSlot : s
      ) || [],
    });
  };

  // Remove a slot
  const handleRemoveSlot = (slotId: string) => {
    // Also remove any assignments to this slot
    const newAssignments = { ...blueprint.slotAssignments };
    delete newAssignments[slotId];

    onUpdate({
      ...blueprint,
      slots: blueprint.slots?.filter((s) => s.id !== slotId) || [],
      slotAssignments: newAssignments,
    });
  };

  // Handle slot assignment
  const handleSlotAssignment = (slotId: string, elementIds: string[]) => {
    onUpdate({
      ...blueprint,
      slotAssignments: {
        ...blueprint.slotAssignments,
        [slotId]: elementIds,
      },
    });
  };

  // Drag handlers for slot reordering
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

    const newSlots = [...(blueprint.slots || [])];
    const [draggedSlot] = newSlots.splice(dragIndex, 1);
    newSlots.splice(dragOverIndex, 0, draggedSlot);

    onUpdate({
      ...blueprint,
      slots: newSlots,
    });

    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Calculate slot statistics
  const requiredSlots = blueprint.slots?.filter((s) => s.required) || [];
  const filledRequiredSlots = requiredSlots.filter(
    (slot) => (blueprint.slotAssignments?.[slot.id]?.length || 0) > 0
  );

  return (
    <div className="p-4 space-y-4">
      {/* Blueprint Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Blueprint Name</label>
        <input
          type="text"
          value={blueprint.name}
          onChange={(e) => onUpdate({ ...blueprint, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Blueprint ID</label>
        <input
          type="text"
          value={blueprint.blueprintId}
          onChange={(e) => onUpdate({ ...blueprint, blueprintId: e.target.value })}
          placeholder="e.g., card-layout, hero-section"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Unique identifier for this blueprint template</p>
      </div>

      {/* Status Summary */}
      <div className="bg-purple-50 rounded-md p-3">
        <div className="text-sm font-medium text-purple-900 mb-1">Blueprint Status</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-purple-600">Total Slots:</span>{' '}
            <span className="font-medium">{blueprint.slots?.length || 0}</span>
          </div>
          <div>
            <span className="text-purple-600">Required:</span>{' '}
            <span className={`font-medium ${filledRequiredSlots.length < requiredSlots.length ? 'text-red-600' : 'text-green-600'
              }`}>
              {filledRequiredSlots.length}/{requiredSlots.length}
            </span>
          </div>
        </div>
      </div>

      {/* Slots Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Slots ({blueprint.slots?.length || 0})
          </label>
          <button
            type="button"
            onClick={handleAddSlot}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
          >
            <Plus className="h-3 w-3" />
            Add Slot
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {!blueprint.slots || blueprint.slots.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
              <p className="text-sm text-gray-400">
                No slots defined. Add slots to create drop zones for elements.
              </p>
            </div>
          ) : (
            blueprint.slots.map((slot, index) => (
              <SlotItem
                key={slot.id}
                slot={slot}
                index={index}
                assignedCount={blueprint.slotAssignments?.[slot.id]?.length || 0}
                onUpdate={handleUpdateSlot}
                onRemove={() => handleRemoveSlot(slot.id)}
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

      {/* Slot Assignments Section */}
      {blueprint.slots && blueprint.slots.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slot Assignments
          </label>
          <div className="space-y-2">
            {blueprint.slots.map((slot) => {
              const assignedIds = blueprint.slotAssignments?.[slot.id] || [];
              return (
                <div key={slot.id} className="border border-gray-200 rounded-md p-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {slot.name}
                    {slot.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Select<ElementOption, true>
                    isMulti
                    value={elementOptions.filter((opt) => assignedIds.includes(opt.value))}
                    onChange={(selected) => handleSlotAssignment(
                      slot.id,
                      selected ? selected.map((s) => s.value) : []
                    )}
                    options={elementOptions.filter((opt) =>
                      slot.allowedTypes.length === 0 || slot.allowedTypes.includes(opt.type)
                    )}
                    styles={selectStyles}
                    placeholder={`Assign elements (max ${slot.maxElements})`}
                    isClearable
                    isSearchable
                    isOptionDisabled={() =>
                      assignedIds.length >= slot.maxElements
                    }
                    menuPlacement="auto"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
