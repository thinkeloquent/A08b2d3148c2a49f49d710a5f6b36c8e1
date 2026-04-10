import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import {
  listDropdownOptions,
  createDropdownOption,
  updateDropdownOption,
  deleteDropdownOption,
  type DropdownOptionRecord } from
'@/services/api/dropdown-options';

interface FormState {
  value: string;
  label: string;
  category: string;
  sort_order: number;
}

const EMPTY_FORM: FormState = { value: '', label: '', category: '', sort_order: 0 };

export default function DropdownOptionsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: options = [], isLoading, isError, error } = useQuery({
    queryKey: ['dropdown-options'],
    queryFn: () => listDropdownOptions()
  });

  const createMutation = useMutation({
    mutationFn: createDropdownOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dropdown-options'] });
      setShowAddForm(false);
      setForm(EMPTY_FORM);
      setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: {id: string;data: Partial<FormState>;}) =>
    updateDropdownOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dropdown-options'] });
      setEditingId(null);
      setForm(EMPTY_FORM);
      setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDropdownOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dropdown-options'] });
    }
  });

  const startEdit = (option: DropdownOptionRecord) => {
    setEditingId(option.id);
    setForm({
      value: option.value,
      label: option.label,
      category: option.category || '',
      sort_order: option.sort_order
    });
    setShowAddForm(false);
    setFormError(null);
  };

  const startAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowAddForm(true);
    setFormError(null);
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value.trim() || !form.label.trim()) {
      setFormError('Value and Label are required');
      return;
    }

    const payload = {
      value: form.value.trim(),
      label: form.label.trim(),
      category: form.category.trim() || undefined,
      sort_order: form.sort_order
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, label: string) => {
    if (window.confirm(`Delete "${label}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Dropdown Options</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage the field options available in filter dropdowns.
          </p>
        </div>
        {!showAddForm && !editingId &&
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">

            <Plus className="w-4 h-4" />
            Add Option
          </button>
        }
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) &&
      <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-3" data-test-id="h3-53abeddf">
            {editingId ? 'Edit Option' : 'New Option'}
          </h3>

          {formError &&
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {formError}
            </div>
        }

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3" data-test-id="div-537e7f23">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Value <span className="text-red-500">*</span>
              </label>
              <input
              type="text"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="e.g. master_contact.email"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />

            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Label <span className="text-red-500">*</span>
              </label>
              <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. master_contact › email"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />

            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. contact, behaviour"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />

            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sort Order</label>
              <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />

            </div>
          </div>

          <div className="flex items-center gap-2" data-test-id="div-e5cd1f18">
            <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50">

              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
            type="button"
            onClick={cancelForm}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">

              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      }

      {/* Table */}
      {isLoading &&
      <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }

      {isError &&
      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load options'}
        </div>
      }

      {!isLoading && !isError &&
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Value</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Label</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {options.length === 0 &&
            <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No dropdown options yet. Click "Add Option" to create one.
                  </td>
                </tr>
            }
              {options.map((option) =>
            <tr
              key={option.id}
              className={`border-b border-gray-100 hover:bg-gray-50 ${
              editingId === option.id ? 'bg-blue-50' : ''}`
              }>

                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{option.value}</td>
                  <td className="px-4 py-3 text-gray-900">{option.label}</td>
                  <td className="px-4 py-3">
                    {option.category ?
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {option.category}
                      </span> :

                <span className="text-gray-300">—</span>
                }
                  </td>
                  <td className="px-4 py-3 text-gray-500">{option.sort_order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                    onClick={() => startEdit(option)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit">

                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                    onClick={() => handleDelete(option.id, option.label)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete">

                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }
    </div>);

}