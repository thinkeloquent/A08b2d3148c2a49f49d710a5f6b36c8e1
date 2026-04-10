import { useState } from 'react';
import { Plus, Trash2, Settings, FileJson } from 'lucide-react';
import { StaticConfigMetaComponent } from '../../types';
import { MetaComponentEditor } from '../types';

// Config value types
type ConfigValueType = 'string' | 'number' | 'boolean' | 'json';

interface ConfigEntry {
  key: string;
  value: unknown;
  type: ConfigValueType;
}

// Detect value type
const detectType = (value: unknown): ConfigValueType => {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object') return 'json';
  return 'string';
};

// Parse value by type
const parseValue = (value: string, type: ConfigValueType): unknown => {
  switch (type) {
    case 'number':
      return Number(value) || 0;
    case 'boolean':
      return value === 'true';
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    default:
      return value;
  }
};

// Config entry component
interface ConfigEntryItemProps {
  entry: ConfigEntry;
  onUpdate: (key: string, value: unknown, type: ConfigValueType) => void;
  onRemove: () => void;
  onKeyChange: (oldKey: string, newKey: string) => void;
}

const ConfigEntryItem = ({
  entry,
  onUpdate,
  onRemove,
  onKeyChange,
}: ConfigEntryItemProps) => {
  const [localKey, setLocalKey] = useState(entry.key);
  const [localValue, setLocalValue] = useState(
    entry.type === 'json' ? JSON.stringify(entry.value, null, 2) : String(entry.value)
  );

  const handleKeyBlur = () => {
    if (localKey !== entry.key && localKey.trim()) {
      onKeyChange(entry.key, localKey.trim());
    }
  };

  const handleValueChange = (newValue: string) => {
    setLocalValue(newValue);
    onUpdate(entry.key, parseValue(newValue, entry.type), entry.type);
  };

  const handleTypeChange = (newType: ConfigValueType) => {
    const converted = parseValue(localValue, newType);
    setLocalValue(newType === 'json' ? JSON.stringify(converted, null, 2) : String(converted));
    onUpdate(entry.key, converted, newType);
  };

  return (
    <div className="border border-gray-200 rounded-md p-2 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={localKey}
          onChange={(e) => setLocalKey(e.target.value)}
          onBlur={handleKeyBlur}
          className="flex-1 px-2 py-1 text-sm font-medium border border-gray-300 rounded"
          placeholder="Key"
        />
        <select
          value={entry.type}
          onChange={(e) => handleTypeChange(e.target.value as ConfigValueType)}
          className="px-2 py-1 text-xs border border-gray-300 rounded"
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="json">JSON</option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {entry.type === 'boolean' ? (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={entry.value === true}
              onChange={() => onUpdate(entry.key, true, 'boolean')}
              className="text-teal-600"
            />
            <span className="text-sm">True</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={entry.value === false}
              onChange={() => onUpdate(entry.key, false, 'boolean')}
              className="text-teal-600"
            />
            <span className="text-sm">False</span>
          </label>
        </div>
      ) : entry.type === 'json' ? (
        <textarea
          value={localValue}
          onChange={(e) => handleValueChange(e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono"
          rows={3}
          placeholder='{"key": "value"}'
        />
      ) : (
        <input
          type={entry.type === 'number' ? 'number' : 'text'}
          value={localValue}
          onChange={(e) => handleValueChange(e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          placeholder="Value"
        />
      )}
    </div>
  );
};

export const StaticConfigEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const config = meta as StaticConfigMetaComponent;
  const [newKey, setNewKey] = useState('');
  const [schemaMode, setSchemaMode] = useState<'none' | 'ref' | 'inline'>(
    config.schemaRef ? 'ref' : config.inlineSchema ? 'inline' : 'none'
  );

  // Find the source element (first target element - now read-only)
  const sourceElementId = config.targetElementIds?.[0] ?? '';
  const sourceElement = availableElements.find((el) => el.id === sourceElementId);

  // Convert configValues to entries array
  const entries: ConfigEntry[] = Object.entries(config.configValues ?? {}).map(([key, value]) => ({
    key,
    value,
    type: detectType(value),
  }));

  // Add new config value
  const handleAddValue = () => {
    if (!newKey.trim()) return;
    onUpdate({
      ...config,
      configValues: {
        ...config.configValues,
        [newKey.trim()]: '',
      },
    });
    setNewKey('');
  };

  // Update config value
  const handleUpdateValue = (key: string, value: unknown, _type: ConfigValueType) => {
    onUpdate({
      ...config,
      configValues: {
        ...config.configValues,
        [key]: value,
      },
    });
  };

  // Remove config value
  const handleRemoveValue = (key: string) => {
    const newValues = { ...config.configValues };
    delete newValues[key];
    onUpdate({ ...config, configValues: newValues });
  };

  // Change key
  const handleKeyChange = (oldKey: string, newKey: string) => {
    const value = config.configValues?.[oldKey];
    const newValues = { ...config.configValues };
    delete newValues[oldKey];
    newValues[newKey] = value;
    onUpdate({ ...config, configValues: newValues });
  };

  // Handle schema mode change
  const handleSchemaModeChange = (mode: 'none' | 'ref' | 'inline') => {
    setSchemaMode(mode);
    if (mode === 'none') {
      onUpdate({ ...config, schemaRef: undefined, inlineSchema: undefined });
    } else if (mode === 'ref') {
      onUpdate({ ...config, inlineSchema: undefined });
    } else {
      onUpdate({ ...config, schemaRef: undefined });
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => onUpdate({ ...config, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        />
      </div>

      {/* Status Summary */}
      <div className="bg-teal-50 rounded-md p-3">
        <div className="text-sm font-medium text-teal-900 mb-1">Config Status</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-teal-600">Values:</span>{' '}
            <span className="font-medium">{entries.length}</span>
          </div>
          <div>
            <span className="text-teal-600">Schema:</span>{' '}
            <span className="font-medium">
              {schemaMode === 'ref' ? 'Reference' : schemaMode === 'inline' ? 'Inline' : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Schema Configuration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileJson className="h-4 w-4 inline mr-1" />
          Schema Validation
        </label>
        <div className="flex gap-2 mb-2">
          {(['none', 'ref', 'inline'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleSchemaModeChange(mode)}
              className={`flex-1 py-1.5 px-2 rounded-md border text-xs font-medium capitalize ${
                schemaMode === mode
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {mode === 'none' ? 'No Schema' : mode === 'ref' ? 'Reference' : 'Inline'}
            </button>
          ))}
        </div>

        {schemaMode === 'ref' && (
          <input
            type="text"
            value={config.schemaRef ?? ''}
            onChange={(e) => onUpdate({ ...config, schemaRef: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            placeholder="e.g., schemas/form-config.json"
          />
        )}

        {schemaMode === 'inline' && (
          <textarea
            value={config.inlineSchema ? JSON.stringify(config.inlineSchema, null, 2) : ''}
            onChange={(e) => {
              try {
                const schema = JSON.parse(e.target.value);
                onUpdate({ ...config, inlineSchema: schema });
              } catch {
                // Invalid JSON, don't update
              }
            }}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono"
            rows={4}
            placeholder='{"type": "object", "properties": {...}}'
          />
        )}
      </div>

      {/* Config Values */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            <Settings className="h-4 w-4 inline mr-1" />
            Config Values ({entries.length})
          </label>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
          {entries.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
              <Settings className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                No config values defined.
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <ConfigEntryItem
                key={entry.key}
                entry={entry}
                onUpdate={handleUpdateValue}
                onRemove={() => handleRemoveValue(entry.key)}
                onKeyChange={handleKeyChange}
              />
            ))
          )}
        </div>

        {/* Add new value */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="New config key"
            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
            onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
          />
          <button
            type="button"
            onClick={handleAddValue}
            disabled={!newKey.trim()}
            className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
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
          This config is attached to this element
        </p>
      </div>
    </div>
  );
};
