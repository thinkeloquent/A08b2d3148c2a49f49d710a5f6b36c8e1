import { useState } from 'react';
import { Plus, Trash2, BarChart3, Tag } from 'lucide-react';
import { SpecificationMetaComponent, TelemetrySpec } from '../../types';
import { MetaComponentEditor } from '../types';

// Trigger options
const TRIGGER_OPTIONS = [
  { value: 'click', label: 'On Click' },
  { value: 'change', label: 'On Change' },
  { value: 'focus', label: 'On Focus' },
  { value: 'blur', label: 'On Blur' },
  { value: 'submit', label: 'On Submit' },
  { value: 'mount', label: 'On Mount' },
  { value: 'unmount', label: 'On Unmount' },
  { value: 'visible', label: 'On Visible' },
];

// Event item component
interface TelemetryEventItemProps {
  event: NonNullable<TelemetrySpec['events']>[number];
  onUpdate: (event: NonNullable<TelemetrySpec['events']>[number]) => void;
  onRemove: () => void;
}

const TelemetryEventItem = ({
  event,
  onUpdate,
  onRemove,
}: TelemetryEventItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropValue, setNewPropValue] = useState('');

  const handleAddProperty = () => {
    if (!newPropKey.trim()) return;
    onUpdate({
      ...event,
      properties: {
        ...event.properties,
        [newPropKey.trim()]: newPropValue,
      },
    });
    setNewPropKey('');
    setNewPropValue('');
  };

  const handleRemoveProperty = (key: string) => {
    const newProps = { ...event.properties };
    delete newProps[key];
    onUpdate({ ...event, properties: newProps });
  };

  const propCount = Object.keys(event.properties ?? {}).length;

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      {/* Header */}
      <div
        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <BarChart3 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900">
            {event.eventName || 'Unnamed Event'}
          </span>
        </div>
        <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
          {event.trigger}
        </span>
        {propCount > 0 && (
          <span className="text-xs text-gray-500">
            {propCount} prop{propCount !== 1 ? 's' : ''}
          </span>
        )}
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
          {/* Event Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Event Name</label>
            <input
              type="text"
              value={event.eventName}
              onChange={(e) => onUpdate({ ...event, eventName: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              placeholder="e.g., form_submit, field_change"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Trigger</label>
            <select
              value={event.trigger}
              onChange={(e) => onUpdate({ ...event, trigger: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              {TRIGGER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Properties */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Tag className="h-3 w-3 inline mr-1" />
              Event Properties ({propCount})
            </label>

            <div className="space-y-1 mb-2">
              {Object.entries(event.properties ?? {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1 text-xs bg-gray-50 p-1 rounded">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600 flex-1 truncate">{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProperty(key)}
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
                value={newPropKey}
                onChange={(e) => setNewPropKey(e.target.value)}
                placeholder="Property"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <input
                type="text"
                value={newPropValue}
                onChange={(e) => setNewPropValue(e.target.value)}
                placeholder="Value/Expression"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddProperty}
                className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use expressions like <code className="bg-gray-100 px-1 rounded">$elementId.value</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const SpecificationEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const specification = meta as SpecificationMetaComponent;
  const telemetry = specification.telemetry ?? {};
  const events = telemetry.events ?? [];

  // Find the source element (first target element - now read-only)
  const sourceElementId = specification.targetElementIds?.[0] ?? '';
  const sourceElement = availableElements.find((el) => el.id === sourceElementId);

  // Update telemetry helper
  const updateTelemetry = (updates: Partial<TelemetrySpec>) => {
    onUpdate({
      ...specification,
      telemetry: { ...telemetry, ...updates },
    });
  };

  // Add event
  const handleAddEvent = () => {
    const newEvent = {
      eventName: 'new_event',
      trigger: 'click',
      properties: {},
    };
    updateTelemetry({ events: [...events, newEvent] });
  };

  // Update event
  const handleUpdateEvent = (index: number, updated: NonNullable<TelemetrySpec['events']>[number]) => {
    const newEvents = [...events];
    newEvents[index] = updated;
    updateTelemetry({ events: newEvents });
  };

  // Remove event
  const handleRemoveEvent = (index: number) => {
    updateTelemetry({ events: events.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={specification.name}
          onChange={(e) => onUpdate({ ...specification, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
        />
      </div>

      {/* Spec ID and Version */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Spec ID</label>
          <input
            type="text"
            value={specification.specId}
            onChange={(e) => onUpdate({ ...specification, specId: e.target.value })}
            placeholder="e.g., checkout-form"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Version</label>
          <input
            type="text"
            value={specification.specVersion}
            onChange={(e) => onUpdate({ ...specification, specVersion: e.target.value })}
            placeholder="e.g., 1.0.0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-emerald-50 rounded-md p-3">
        <div className="text-sm font-medium text-emerald-900 mb-1">Analytics Status</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-emerald-600">Events:</span>{' '}
            <span className="font-medium">{events.length}</span>
          </div>
          <div>
            <span className="text-emerald-600">Category:</span>{' '}
            <span className="font-medium">{telemetry.category || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Telemetry Configuration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <BarChart3 className="h-4 w-4 inline mr-1" />
          Telemetry Configuration
        </label>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <input
              type="text"
              value={telemetry.category ?? ''}
              onChange={(e) => updateTelemetry({ category: e.target.value })}
              placeholder="e.g., forms, checkout"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Spec ID Override</label>
            <input
              type="text"
              value={telemetry.specId ?? ''}
              onChange={(e) => updateTelemetry({ specId: e.target.value })}
              placeholder="Optional override"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Telemetry Events */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Telemetry Events ({events.length})
          </label>
          <button
            type="button"
            onClick={handleAddEvent}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200"
          >
            <Plus className="h-3 w-3" />
            Add Event
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
              <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                No telemetry events defined.
              </p>
            </div>
          ) : (
            events.map((event, index) => (
              <TelemetryEventItem
                key={index}
                event={event}
                onUpdate={(updated) => handleUpdateEvent(index, updated)}
                onRemove={() => handleRemoveEvent(index)}
              />
            ))
          )}
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
          This analytics is attached to this element
        </p>
      </div>
    </div>
  );
};
