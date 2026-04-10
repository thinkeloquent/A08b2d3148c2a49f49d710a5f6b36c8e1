import { useState } from 'react';
import { Plus, Trash2, Database, RefreshCw } from 'lucide-react';
import { ServiceMetaComponent, ServiceBinding } from '../../types';
import { MetaComponentEditor } from '../types';

// Generate unique ID
const generateBindingId = () => `bind-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create default binding
const createDefaultBinding = (): ServiceBinding => ({
  id: generateBindingId(),
  serviceId: '',
  operation: '',
  params: {},
  outputMapping: {},
  targetElementIds: [],
  refreshTrigger: 'manual',
});

// Binding item component
interface BindingItemProps {
  binding: ServiceBinding;
  onUpdate: (binding: ServiceBinding) => void;
  onRemove: () => void;
}

const BindingItem = ({
  binding,
  onUpdate,
  onRemove,
}: BindingItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');
  const [newMappingKey, setNewMappingKey] = useState('');
  const [newMappingValue, setNewMappingValue] = useState('');

  const handleAddParam = () => {
    if (!newParamKey.trim()) return;
    onUpdate({
      ...binding,
      params: { ...binding.params, [newParamKey]: newParamValue },
    });
    setNewParamKey('');
    setNewParamValue('');
  };

  const handleRemoveParam = (key: string) => {
    const newParams = { ...binding.params };
    delete newParams[key];
    onUpdate({ ...binding, params: newParams });
  };

  const handleAddMapping = () => {
    if (!newMappingKey.trim()) return;
    onUpdate({
      ...binding,
      outputMapping: { ...binding.outputMapping, [newMappingKey]: newMappingValue },
    });
    setNewMappingKey('');
    setNewMappingValue('');
  };

  const handleRemoveMapping = (key: string) => {
    const newMapping = { ...binding.outputMapping };
    delete newMapping[key];
    onUpdate({ ...binding, outputMapping: newMapping });
  };

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      {/* Header */}
      <div
        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Database className="h-4 w-4 text-sky-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700">
            {binding.serviceId || 'New Binding'}
            {binding.operation && <span className="text-gray-400">:{binding.operation}</span>}
          </span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          binding.refreshTrigger === 'onMount' ? 'bg-green-100 text-green-700' :
          binding.refreshTrigger === 'onChange' ? 'bg-blue-100 text-blue-700' :
          binding.refreshTrigger === 'onFocus' ? 'bg-purple-100 text-purple-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {binding.refreshTrigger}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-3 space-y-3">
          {/* Service & Operation */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Service ID</label>
              <input
                type="text"
                value={binding.serviceId}
                onChange={(e) => onUpdate({ ...binding, serviceId: e.target.value })}
                placeholder="e.g., user-api, data-service"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Operation</label>
              <input
                type="text"
                value={binding.operation}
                onChange={(e) => onUpdate({ ...binding, operation: e.target.value })}
                placeholder="e.g., getUser, fetchList"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Fetch On (renamed from Refresh Trigger) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <RefreshCw className="h-3 w-3 inline mr-1" />
              Fetch On
            </label>
            <select
              value={binding.refreshTrigger ?? 'manual'}
              onChange={(e) => onUpdate({ ...binding, refreshTrigger: e.target.value as ServiceBinding['refreshTrigger'] })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="manual">Manual</option>
              <option value="onMount">On Mount</option>
              <option value="onFocus">On Focus</option>
              <option value="onChange">On Change</option>
            </select>
          </div>

          {/* Parameters */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Parameters ({Object.keys(binding.params ?? {}).length})
            </label>
            <div className="space-y-1 mb-2">
              {Object.entries(binding.params ?? {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1 text-xs bg-gray-50 p-1 rounded">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600 flex-1 truncate">{String(value)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveParam(key)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={newParamKey}
                onChange={(e) => setNewParamKey(e.target.value)}
                placeholder="Key"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <input
                type="text"
                value={newParamValue}
                onChange={(e) => setNewParamValue(e.target.value)}
                placeholder="Value"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddParam}
                className="px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded hover:bg-sky-200"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Output Mapping */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Output Mapping ({Object.keys(binding.outputMapping).length})
            </label>
            <div className="space-y-1 mb-2">
              {Object.entries(binding.outputMapping).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1 text-xs bg-gray-50 p-1 rounded">
                  <span className="font-medium text-gray-700">{key}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-600 flex-1 truncate">{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMapping(key)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={newMappingKey}
                onChange={(e) => setNewMappingKey(e.target.value)}
                placeholder="Response path"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <input
                type="text"
                value={newMappingValue}
                onChange={(e) => setNewMappingValue(e.target.value)}
                placeholder="Element field"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddMapping}
                className="px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded hover:bg-sky-200"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ServiceOrchestratorEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const serviceMeta = meta as ServiceMetaComponent;
  const spec = serviceMeta.serviceSpec ?? { bindings: [] };

  // Find the source element (first target element - now read-only)
  const sourceElementId = serviceMeta.targetElementIds?.[0] ?? '';
  const sourceElement = availableElements.find((el) => el.id === sourceElementId);

  // Update spec helper
  const updateSpec = (bindings: ServiceBinding[]) => {
    onUpdate({
      ...serviceMeta,
      serviceSpec: { bindings },
    });
  };

  // Add binding
  const handleAddBinding = () => {
    updateSpec([...spec.bindings, createDefaultBinding()]);
  };

  // Update binding
  const handleUpdateBinding = (index: number, updated: ServiceBinding) => {
    const newBindings = [...spec.bindings];
    newBindings[index] = updated;
    updateSpec(newBindings);
  };

  // Remove binding
  const handleRemoveBinding = (index: number) => {
    updateSpec(spec.bindings.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={serviceMeta.name}
          onChange={(e) => onUpdate({ ...serviceMeta, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
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
          This service is attached to this element
        </p>
      </div>

      {/* Status Summary */}
      <div className="bg-sky-50 rounded-md p-3">
        <div className="text-sm font-medium text-sky-900 mb-1">Service Status</div>
        <div className="text-xs">
          <span className="text-sky-600">Bindings:</span>{' '}
          <span className="font-medium">{spec.bindings.length}</span>
        </div>
      </div>

      {/* Bindings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Service Bindings ({spec.bindings.length})
          </label>
          <button
            type="button"
            onClick={handleAddBinding}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-sky-700 bg-sky-100 rounded-md hover:bg-sky-200"
          >
            <Plus className="h-3 w-3" />
            Add Binding
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {spec.bindings.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
              <Database className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                No service bindings defined. Add bindings to connect to external services.
              </p>
            </div>
          ) : (
            spec.bindings.map((binding, index) => (
              <BindingItem
                key={binding.id}
                binding={binding}
                onUpdate={(updated) => handleUpdateBinding(index, updated)}
                onRemove={() => handleRemoveBinding(index)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
