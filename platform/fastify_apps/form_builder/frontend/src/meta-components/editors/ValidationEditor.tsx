import { ValidationMetaComponent } from '../../types';
import { MetaComponentEditor } from '../types';

// Default rule values
const DEFAULT_RULE = {
  ruleType: 'required',
  config: {},
};

export const ValidationEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const validation = meta as ValidationMetaComponent;

  // Safely access rule with fallback
  const rule = validation.rule ?? DEFAULT_RULE;

  // Find the source element (first target element - now read-only)
  const sourceElementId = validation.targetElementIds?.[0] ?? '';
  const sourceElement = availableElements.find((el) => el.id === sourceElementId);

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={validation.name}
          onChange={(e) =>
            onUpdate({ ...validation, name: e.target.value })
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Rule Type</label>
        <select
          value={rule.ruleType}
          onChange={(e) =>
            onUpdate({
              ...validation,
              rule: { ...rule, ruleType: e.target.value },
            })
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="required">Required</option>
          <option value="pattern">Pattern</option>
          <option value="range">Range</option>
          <option value="custom">Custom</option>
          <option value="crossField">Cross-Field</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Error Message</label>
        <input
          type="text"
          value={validation.errorMessage ?? 'Validation failed'}
          onChange={(e) =>
            onUpdate({ ...validation, errorMessage: e.target.value })
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          This validation is attached to this element
        </p>
      </div>
    </div>
  );
};
