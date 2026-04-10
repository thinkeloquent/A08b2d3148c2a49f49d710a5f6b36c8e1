/**
 * ArrayTextArea Component
 * Array input where each entry is a textarea (for multiline content like prompt templates)
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ArrayTextAreaProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  disabled?: boolean;
  rows?: number;
}

export function ArrayTextArea({
  value = [],
  onChange,
  placeholder = 'Add item...',
  maxItems,
  disabled = false,
  rows = 3,
}: ArrayTextAreaProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      if (!maxItems || value.length < maxItems) {
        onChange([...value, trimmed]);
        setInputValue('');
      }
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, newValue: string) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };

  const canAdd = !maxItems || value.length < maxItems;

  return (
    <div className="space-y-3">
      {/* Existing items */}
      {value.map((item, index) => (
        <div key={index} className="relative">
          <textarea
            value={item}
            onChange={(e) => handleUpdate(index, e.target.value)}
            disabled={disabled}
            rows={rows}
            className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}

      {/* Add new */}
      {canAdd && !disabled && (
        <div className="space-y-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      )}

      {maxItems && (
        <p className="text-xs text-gray-500">
          {value.length} / {maxItems} items
        </p>
      )}
    </div>
  );
}
