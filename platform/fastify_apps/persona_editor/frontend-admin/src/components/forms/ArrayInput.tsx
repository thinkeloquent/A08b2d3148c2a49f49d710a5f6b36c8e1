/**
 * ArrayInput Component
 * Input for array fields (goals, tools, permissions)
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  disabled?: boolean;
}

export function ArrayInput({
  value = [],
  onChange,
  placeholder = 'Add item...',
  maxItems,
  disabled = false,
}: ArrayInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      if (!maxItems || value.length < maxItems) {
        onChange([...value, trimmed]);
        setInputValue('');
      }
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const canAdd = !maxItems || value.length < maxItems;

  return (
    <div className="space-y-2">
      {/* Existing items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded"
            >
              {item}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Add input */}
      {canAdd && !disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
