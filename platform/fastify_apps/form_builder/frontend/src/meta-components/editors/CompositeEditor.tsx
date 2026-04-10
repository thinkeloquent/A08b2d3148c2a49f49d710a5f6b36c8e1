import { useState, useMemo } from 'react';
import { Plus, Trash2, Link2, Lock } from 'lucide-react';
import Select, { StylesConfig } from 'react-select';
import { CompositeMetaComponent } from '../../types';
import { MetaComponentEditor } from '../types';

// Option type for react-select
interface SelectOption {
  value: string;
  label: string;
}

// Custom styles for react-select
const selectStyles: StylesConfig<SelectOption, true> = {
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
      ? '#7c3aed'
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
    backgroundColor: '#f3e8ff',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#7c3aed',
    fontSize: '11px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#7c3aed',
    ':hover': {
      backgroundColor: '#ddd6fe',
      color: '#5b21b6',
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
};

// Data binding item component
interface DataBindingItemProps {
  sourceKey: string;
  targetPath: string;
  onUpdate: (sourceKey: string, targetPath: string) => void;
  onRemove: () => void;
}

const DataBindingItem = ({
  sourceKey,
  targetPath,
  onUpdate,
  onRemove,
}: DataBindingItemProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
      <Link2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
      <input
        type="text"
        value={sourceKey}
        onChange={(e) => onUpdate(e.target.value, targetPath)}
        placeholder="Source key"
        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
      />
      <span className="text-gray-400 text-xs">→</span>
      <input
        type="text"
        value={targetPath}
        onChange={(e) => onUpdate(sourceKey, e.target.value)}
        placeholder="Target path"
        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
      />
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500 rounded"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};

export const CompositeEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const composite = meta as CompositeMetaComponent;
  const [newBindingKey, setNewBindingKey] = useState('');
  const [newBindingTarget, setNewBindingTarget] = useState('');

  // Find the source element (first target element - now read-only)
  const sourceElementId = (composite as unknown as { targetElementIds?: string[] }).targetElementIds?.[0] ?? '';
  const sourceElement = availableElements.find((el) => el.id === sourceElementId);

  // Available blueprints (in a real app, these would come from a registry)
  // For now, we'll use a static list that can be extended
  const availableBlueprints: SelectOption[] = useMemo(() => [
    { value: 'card-layout', label: 'Card Layout' },
    { value: 'hero-section', label: 'Hero Section' },
    { value: 'list-item', label: 'List Item' },
    { value: 'form-row', label: 'Form Row' },
    { value: 'stat-box', label: 'Stat Box' },
    { value: 'product-card', label: 'Product Card' },
    { value: 'pricing-table', label: 'Pricing Table' },
    { value: 'contact-form', label: 'Contact Form' },
    { value: 'dashboard-widget', label: 'Dashboard Widget' },
  ], []);

  // Convert blueprintRefs to select options
  const selectedBlueprints: SelectOption[] = useMemo(() =>
    (composite.blueprintRefs || []).map((ref) => {
      const found = availableBlueprints.find((b) => b.value === ref);
      return found || { value: ref, label: ref };
    }),
    [composite.blueprintRefs, availableBlueprints]
  );

  // Handle blueprint selection
  const handleBlueprintChange = (selected: readonly SelectOption[] | null) => {
    onUpdate({
      ...composite,
      blueprintRefs: selected ? selected.map((s) => s.value) : [],
    });
  };

  // Handle adding a new data binding
  const handleAddBinding = () => {
    if (!newBindingKey.trim() || !newBindingTarget.trim()) return;

    onUpdate({
      ...composite,
      dataBindings: {
        ...composite.dataBindings,
        [newBindingKey]: newBindingTarget,
      },
    });

    setNewBindingKey('');
    setNewBindingTarget('');
  };

  // Handle updating a data binding
  const handleUpdateBinding = (oldKey: string, newKey: string, newTarget: string) => {
    const newBindings = { ...composite.dataBindings };

    // If key changed, remove old key
    if (oldKey !== newKey) {
      delete newBindings[oldKey];
    }

    newBindings[newKey] = newTarget;

    onUpdate({
      ...composite,
      dataBindings: newBindings,
    });
  };

  // Handle removing a data binding
  const handleRemoveBinding = (key: string) => {
    const newBindings = { ...composite.dataBindings };
    delete newBindings[key];

    onUpdate({
      ...composite,
      dataBindings: newBindings,
    });
  };

  const bindingEntries = Object.entries(composite.dataBindings || {});

  return (
    <div className="p-4 space-y-4">
      {/* Composite Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Composite Name</label>
        <input
          type="text"
          value={composite.name}
          onChange={(e) => onUpdate({ ...composite, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Composite ID</label>
        <input
          type="text"
          value={composite.compositeId}
          onChange={(e) => onUpdate({ ...composite, compositeId: e.target.value })}
          placeholder="e.g., product-card, pricing-section"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Unique identifier for this composite component</p>
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
          This composite is attached to this element
        </p>
      </div>

      {/* Use Component */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Use Component ({composite.blueprintRefs?.length || 0})
        </label>
        <Select<SelectOption, true>
          isMulti
          value={selectedBlueprints}
          onChange={handleBlueprintChange}
          options={availableBlueprints}
          styles={selectStyles}
          placeholder="Select components to use..."
          isClearable
          isSearchable
          menuPlacement="auto"
          isDisabled={composite.isLocked}
        />
        <p className="mt-1 text-xs text-gray-500">
          Select components that make up this composite
        </p>
      </div>

      {/* Data Bindings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Bindings ({bindingEntries.length})
        </label>

        {/* Existing bindings */}
        <div className="space-y-2 mb-3">
          {bindingEntries.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
              <Link2 className="h-6 w-6 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                No data bindings defined
              </p>
            </div>
          ) : (
            bindingEntries.map(([key, target]) => (
              <DataBindingItem
                key={key}
                sourceKey={key}
                targetPath={target}
                onUpdate={(newKey, newTarget) => handleUpdateBinding(key, newKey, newTarget)}
                onRemove={() => handleRemoveBinding(key)}
              />
            ))
          )}
        </div>

        {/* Add new binding */}
        {!composite.isLocked && (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <div className="text-xs font-medium text-gray-600 mb-2">Add New Binding</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBindingKey}
                onChange={(e) => setNewBindingKey(e.target.value)}
                placeholder="Source key (e.g., title)"
                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded"
              />
              <span className="text-gray-400 text-xs">→</span>
              <input
                type="text"
                value={newBindingTarget}
                onChange={(e) => setNewBindingTarget(e.target.value)}
                placeholder="Target (e.g., hero.header)"
                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddBinding}
                disabled={!newBindingKey.trim() || !newBindingTarget.trim()}
                className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info about locked state */}
      {composite.isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-amber-800">Composite is Locked</div>
              <div className="text-xs text-amber-700 mt-1">
                Blueprint references and data bindings cannot be modified while locked.
                Unlock to make changes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
