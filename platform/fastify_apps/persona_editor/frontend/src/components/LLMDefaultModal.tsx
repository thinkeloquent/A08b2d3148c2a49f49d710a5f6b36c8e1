/**
 * LLMDefaultModal Component
 * Modal form for creating and editing LLM defaults
 */

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type {
  LLMDefault,
  LLMDefaultCategory,
  CreateLLMDefaultRequest,
  UpdateLLMDefaultRequest } from
'../types/llm-default';
import { CATEGORY_LABELS } from '../types/llm-default';

interface LLMDefaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLLMDefaultRequest | UpdateLLMDefaultRequest) => void;
  llmDefault?: LLMDefault | null;
  category: LLMDefaultCategory;
  isLoading?: boolean;
}

const CATEGORIES: LLMDefaultCategory[] = [
'tools',
'permissions',
'goals',
'prompts',
'tones',
'roles'];


export function LLMDefaultModal({
  isOpen,
  onClose,
  onSubmit,
  llmDefault,
  category,
  isLoading = false
}: LLMDefaultModalProps) {
  const isEditing = !!llmDefault;

  const [formData, setFormData] = useState<CreateLLMDefaultRequest>({
    category: category,
    name: '',
    description: '',
    value: [],
    is_default: false
  });

  const [valueInput, setValueInput] = useState('');

  useEffect(() => {
    if (llmDefault) {
      setFormData({
        category: llmDefault.category,
        name: llmDefault.name,
        description: llmDefault.description,
        value: llmDefault.value,
        is_default: llmDefault.is_default
      });
      // Convert value to string for display
      if (Array.isArray(llmDefault.value)) {
        setValueInput(llmDefault.value.join('\n'));
      } else if (typeof llmDefault.value === 'object') {
        setValueInput(JSON.stringify(llmDefault.value, null, 2));
      } else {
        setValueInput(String(llmDefault.value || ''));
      }
    } else {
      setFormData({
        category: category,
        name: '',
        description: '',
        value: [],
        is_default: false
      });
      setValueInput('');
    }
  }, [llmDefault, category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse value based on category
    let parsedValue: unknown;
    try {
      // Try parsing as JSON first
      parsedValue = JSON.parse(valueInput);
    } catch {
      // If not JSON, treat as array of lines
      parsedValue = valueInput.
      split('\n').
      map((s) => s.trim()).
      filter(Boolean);
    }

    const data = {
      ...formData,
      value: parsedValue
    };

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose} />


        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ?
              `Edit ${CATEGORY_LABELS[llmDefault.category]}` :
              `Add ${CATEGORY_LABELS[category]}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors">

              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category (only for create) */}
            {!isEditing &&
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                value={formData.category}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as LLMDefaultCategory
                })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                  {CATEGORIES.map((c) =>
                <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                )}
                </select>
              </div>
            }

            {/* Name */}
            <div data-test-id="div-081ab144">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name" />

            </div>

            {/* Description */}
            <div data-test-id="div-b30940a9">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe this default..." />

            </div>

            {/* Value */}
            <div data-test-id="div-ccb38104">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value (one per line or JSON)
              </label>
              <textarea
                required
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="read_file&#10;write_file&#10;search" />

              <p className="mt-1 text-xs text-gray-500">
                Enter values one per line, or valid JSON for complex structures
              </p>
            </div>

            {/* Is Default */}
            <div className="flex items-center gap-2" data-test-id="div-31a119fd">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) =>
                setFormData({ ...formData, is_default: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />

              <label
                htmlFor="is_default"
                className="text-sm font-medium text-gray-700">

                Set as default for this category
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200" data-test-id="div-7576b081">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">

                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors">

                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Add Default'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>);

}