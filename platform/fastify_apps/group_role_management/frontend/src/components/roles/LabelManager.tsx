/**
 * LabelManager Component
 * Add/remove labels to a role with autocomplete
 * Based on REQ.v002.md Section 2.3 (Label System)
 */

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui';
import { labelSuggestions, getLabelColor } from '@/utils/labelColors';

interface LabelManagerProps {
  selectedLabels: string[];
  onChange: (labels: string[]) => void;
  maxLabels?: number;
}

export function LabelManager({
  selectedLabels,
  onChange,
  maxLabels = 10,
}: LabelManagerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on input
  const filteredSuggestions = labelSuggestions.filter(
    s =>
      s.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedLabels.includes(s.name)
  );

  const addLabel = (labelName: string) => {
    if (selectedLabels.length >= maxLabels) {
      alert(`Maximum ${maxLabels} labels allowed`);
      return;
    }

    if (!selectedLabels.includes(labelName)) {
      onChange([...selectedLabels, labelName]);
    }

    setInputValue('');
    setShowSuggestions(false);
  };

  const removeLabel = (labelName: string) => {
    onChange(selectedLabels.filter(l => l !== labelName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addLabel(inputValue.trim());
    }
  };

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500">
          <Tag className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Add labels... (press Enter)"
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1 outline-none text-sm"
          />
          <span className="text-xs text-gray-500">
            {selectedLabels.length}/{maxLabels}
          </span>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
            {filteredSuggestions.map(suggestion => (
              <button
                type="button"
                key={suggestion.name}
                onClick={() => addLabel(suggestion.name)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
              >
                <Badge variant={suggestion.color} size="sm">
                  {suggestion.name}
                </Badge>
                <span className="text-xs text-gray-500">Click to add</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map(label => (
            <Badge key={label} variant={getLabelColor(label)} size="md" removable onRemove={() => removeLabel(label)}>
              {label}
            </Badge>
          ))}
        </div>
      )}

      {/* Suggested Labels (if no input) */}
      {!inputValue && selectedLabels.length < maxLabels && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Suggested labels:</p>
          <div className="flex flex-wrap gap-2">
            {labelSuggestions
              .filter(s => !selectedLabels.includes(s.name))
              .slice(0, 5)
              .map(suggestion => (
                <button
                  type="button"
                  key={suggestion.name}
                  onClick={() => addLabel(suggestion.name)}
                  className="transition-transform hover:scale-105"
                >
                  <Badge variant={suggestion.color} size="sm">
                    {suggestion.name}
                  </Badge>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
