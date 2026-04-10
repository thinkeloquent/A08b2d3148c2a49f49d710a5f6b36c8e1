/**
 * LoadDefaultsButton Component
 * Dropdown button to load and apply LLM default configurations
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { useLLMDefaultsByCategory } from '../hooks/useLLMDefaults';
import type { LLMDefault, LLMDefaultCategory } from '../types/llm-default';
import { CATEGORY_LABELS } from '../types/llm-default';

interface LoadDefaultsButtonProps {
  category: LLMDefaultCategory;
  onSelect: (defaultConfig: LLMDefault) => void;
  selectedId?: string;
  disabled?: boolean;
}

export function LoadDefaultsButton({
  category,
  onSelect,
  selectedId,
  disabled = false,
}: LoadDefaultsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lazy load defaults when dropdown is opened
  const {
    data: defaults,
    isLoading,
    error,
  } = useLLMDefaultsByCategory(category, {
    enabled: isOpen,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (defaultConfig: LLMDefault) => {
    onSelect(defaultConfig);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
          transition-colors
          ${
            disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        Load {CATEGORY_LABELS[category]}
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading...
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">
              Failed to load defaults
            </div>
          ) : defaults && defaults.length > 0 ? (
            <ul className="py-1 max-h-64 overflow-y-auto">
              {defaults.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`
                      w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                      flex items-center justify-between
                      ${selectedId === item.id ? 'bg-blue-50' : ''}
                    `}
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.name}
                        {item.is_default && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {item.description}
                      </div>
                    </div>
                    {selectedId === item.id && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-gray-500 text-center">
              No {CATEGORY_LABELS[category].toLowerCase()} available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
