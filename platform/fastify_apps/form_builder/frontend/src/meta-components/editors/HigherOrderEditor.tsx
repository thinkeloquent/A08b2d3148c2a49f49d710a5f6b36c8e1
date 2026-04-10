import { useState } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { HigherOrderMetaComponent, HigherOrderBehaviorSpec } from '../../types';
import { MetaComponentEditor } from '../types';

// Available behavior types with their default parameters
const BEHAVIOR_TYPES = [
  {
    id: 'debounce',
    label: 'Debounce',
    description: 'Delay execution until input stops',
    defaultParams: { delay: 300 },
  },
  {
    id: 'throttle',
    label: 'Throttle',
    description: 'Limit execution rate',
    defaultParams: { interval: 1000 },
  },
  {
    id: 'retry',
    label: 'Retry',
    description: 'Retry failed operations',
    defaultParams: { maxAttempts: 3, backoff: 'exponential' },
  },
  {
    id: 'cache',
    label: 'Cache',
    description: 'Cache results for reuse',
    defaultParams: { ttl: 60000, maxSize: 100 },
  },
  {
    id: 'transform',
    label: 'Transform',
    description: 'Transform data before use',
    defaultParams: { transformer: '' },
  },
  {
    id: 'validate',
    label: 'Validate',
    description: 'Validate data with custom logic',
    defaultParams: { validator: '', mode: 'sync' },
  },
  {
    id: 'log',
    label: 'Log',
    description: 'Log operations for debugging',
    defaultParams: { level: 'info', prefix: '' },
  },
  {
    id: 'track',
    label: 'Track',
    description: 'Track analytics events',
    defaultParams: { eventName: '', category: '' },
  },
];

export const HigherOrderEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const hoMeta = meta as HigherOrderMetaComponent;
  const spec = hoMeta.behaviorSpec ?? { behaviorId: '', params: {} };

  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');

  // Find the source element (first target element - now read-only)
  const sourceElementId = hoMeta.targetElementIds?.[0] ?? '';
  const sourceElement = availableElements.find((el) => el.id === sourceElementId);

  // Update spec helper
  const updateSpec = (updates: Partial<HigherOrderBehaviorSpec>) => {
    onUpdate({
      ...hoMeta,
      behaviorSpec: { ...spec, ...updates },
    });
  };

  // Handle behavior type change
  const handleBehaviorChange = (behaviorId: string) => {
    const behaviorType = BEHAVIOR_TYPES.find(b => b.id === behaviorId);
    updateSpec({
      behaviorId,
      params: behaviorType?.defaultParams ?? {},
    });
  };

  // Handle param update
  const handleUpdateParam = (key: string, value: unknown) => {
    updateSpec({
      params: { ...spec.params, [key]: value },
    });
  };

  // Handle add custom param
  const handleAddParam = () => {
    if (!newParamKey.trim()) return;
    updateSpec({
      params: { ...spec.params, [newParamKey]: newParamValue },
    });
    setNewParamKey('');
    setNewParamValue('');
  };

  // Handle remove param
  const handleRemoveParam = (key: string) => {
    const newParams = { ...spec.params };
    delete newParams[key];
    updateSpec({ params: newParams });
  };

  // Get current behavior type info
  const currentBehavior = BEHAVIOR_TYPES.find(b => b.id === spec.behaviorId);

  return (
    <div className="p-4 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={hoMeta.name}
          onChange={(e) => onUpdate({ ...hoMeta, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Behavior Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Behavior Type</label>
        <div className="grid grid-cols-2 gap-2">
          {BEHAVIOR_TYPES.map((behavior) => (
            <button
              key={behavior.id}
              type="button"
              onClick={() => handleBehaviorChange(behavior.id)}
              className={`p-2 text-left rounded-md border transition-colors ${
                spec.behaviorId === behavior.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{behavior.label}</div>
              <div className="text-xs text-gray-500">{behavior.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Behavior Info */}
      {currentBehavior && (
        <div className="bg-blue-50 rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wand2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{currentBehavior.label}</span>
          </div>
          <p className="text-xs text-blue-700">{currentBehavior.description}</p>
        </div>
      )}

      {/* Parameters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Parameters ({Object.keys(spec.params).length})
        </label>

        <div className="space-y-2 mb-3">
          {Object.entries(spec.params).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 w-24 flex-shrink-0">{key}</span>
              <input
                type="text"
                value={String(value)}
                onChange={(e) => {
                  // Try to parse as number or boolean
                  let parsedValue: unknown = e.target.value;
                  if (!isNaN(Number(e.target.value)) && e.target.value !== '') {
                    parsedValue = Number(e.target.value);
                  } else if (e.target.value === 'true') {
                    parsedValue = true;
                  } else if (e.target.value === 'false') {
                    parsedValue = false;
                  }
                  handleUpdateParam(key, parsedValue);
                }}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveParam(key)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom parameter */}
        <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
          <div className="text-xs font-medium text-gray-600 mb-2">Add Custom Parameter</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newParamKey}
              onChange={(e) => setNewParamKey(e.target.value)}
              placeholder="Parameter name"
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
            />
            <input
              type="text"
              value={newParamValue}
              onChange={(e) => setNewParamValue(e.target.value)}
              placeholder="Value"
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
            />
            <button
              type="button"
              onClick={handleAddParam}
              disabled={!newParamKey.trim()}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
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
          This behavior is attached to this element
        </p>
      </div>
    </div>
  );
};
