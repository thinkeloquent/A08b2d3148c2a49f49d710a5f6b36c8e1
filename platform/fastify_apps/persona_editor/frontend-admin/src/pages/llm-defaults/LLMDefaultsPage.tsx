/**
 * LLM Defaults List Page
 */

import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Star, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useLLMDefaults, useDeleteLLMDefault, useUpdateLLMDefault } from '../../hooks/useLLMDefaults';
import type { LLMDefaultCategory } from '../../types/llm-default';
import { CATEGORY_OPTIONS } from '../../types/llm-default';

const VALID_CATEGORIES = new Set<string>(CATEGORY_OPTIONS.map((c) => c.value));

export function LLMDefaultsPage() {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();

  const selectedCategory: LLMDefaultCategory =
    category && VALID_CATEGORIES.has(category) ? (category as LLMDefaultCategory) : 'tools';

  // Redirect bare /llm-defaults to /llm-defaults/tools
  useEffect(() => {
    if (!category || !VALID_CATEGORIES.has(category)) {
      navigate('/llm-defaults/category/tools', { replace: true });
    }
  }, [category, navigate]);

  const { data: defaults, isLoading, error } = useLLMDefaults(selectedCategory);
  const deleteDefault = useDeleteLLMDefault();
  const updateDefault = useUpdateLLMDefault();

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteDefault.mutate({ id, category: selectedCategory });
    }
  };

  const handleToggleDefault = (id: string, currentIsDefault: boolean) => {
    updateDefault.mutate({
      id,
      data: { is_default: !currentIsDefault },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">LLM Defaults</h1>
        <Link
          to={`/llm-defaults/category/${selectedCategory}/new`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Default
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((cat) => (
          <Link
            key={cat.value}
            to={`/llm-defaults/category/${cat.value}`}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">
            Failed to load defaults
          </div>
        ) : defaults && defaults.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {defaults.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 line-clamp-2">
                      {item.description}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleDefault(item.id, item.is_default)}
                      className={`p-1 rounded transition-colors ${
                        item.is_default
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-300 hover:text-yellow-500'
                      }`}
                      title={item.is_default ? 'Remove as default' : 'Set as default'}
                    >
                      <Star
                        className="w-5 h-5"
                        fill={item.is_default ? 'currentColor' : 'none'}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/llm-defaults/category/${selectedCategory}/${item.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No defaults configured for this category
          </div>
        )}
      </div>
    </div>
  );
}
