/**
 * LLM Default Create Page
 * Full-page form for creating a new LLM default category entry.
 */

import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type {
  LLMDefaultCategory,
  CreateLLMDefaultRequest } from
'../types/llm-default';
import { CATEGORY_LABELS } from '../types/llm-default';
import { useCreateLLMDefault } from '../hooks/useLLMDefaults';

const BASE = '/apps/persona-editor';

const CATEGORIES: LLMDefaultCategory[] = [
'tools',
'permissions',
'goals',
'prompts',
'tones',
'roles'];


export function LLMDefaultCreatePage() {
  const [formData, setFormData] = useState<CreateLLMDefaultRequest>({
    category: 'tools',
    name: '',
    description: '',
    value: [],
    is_default: false
  });

  const [valueInput, setValueInput] = useState('');

  const createLLMDefault = useCreateLLMDefault({
    onSuccess: () => {
      window.location.href = BASE;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(valueInput);
    } catch {
      parsedValue = valueInput.
      split('\n').
      map((s) => s.trim()).
      filter(Boolean);
    }

    createLLMDefault.mutate({ ...formData, value: parsedValue });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-test-id="div-fbf88b77">
          <div className="flex items-center gap-4 h-16">
            <a
              href={BASE}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">

              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-xl font-semibold text-gray-900">
              Create New Category
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6" data-test-id="form-93346ed2">
          <div className="grid gap-6 lg:grid-cols-2" data-test-id="div-44f19265">
            {/* Category */}
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

            {/* Name */}
            <div>
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
          </div>

          {/* Description */}
          <div data-test-id="div-0347d16c">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe this default..." />

          </div>

          {/* Value */}
          <div data-test-id="div-4570d904">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value (one per line or JSON)
            </label>
            <textarea
              required
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={"read_file\nwrite_file\nsearch"} />

            <p className="mt-1 text-xs text-gray-500">
              Enter values one per line, or valid JSON for complex structures
            </p>
          </div>

          {/* Is Default */}
          <div className="flex items-center gap-2" data-test-id="div-4ff022c9">
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
          <div className="flex items-center gap-3" data-test-id="div-8a4ef065">
            <button
              type="submit"
              disabled={createLLMDefault.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors">

              {createLLMDefault.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
            <a
              href={BASE}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">

              Cancel
            </a>
          </div>
        </form>
      </main>
    </div>);

}