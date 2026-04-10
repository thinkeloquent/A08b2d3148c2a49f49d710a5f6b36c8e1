/**
 * Form List Page — shows saved forms from the API
 * Allows creating new forms or opening existing ones in the builder.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForms, useCreateForm, useDeleteForm } from '../hooks/useForms';
import { Plus, Trash2, Edit, FileText } from 'lucide-react';

export default function FormListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useForms({ search: search || undefined });
  const createForm = useCreateForm();
  const deleteForm = useDeleteForm();

  const handleCreateNew = async () => {
    try {
      const result = await createForm.mutateAsync({
        name: 'Untitled Form',
        status: 'draft',
        version: '1.0.0',
      });
      const id = result.formDefinition.id;
      navigate(`/builder/${id}`);
    } catch (err) {
      console.error('Failed to create form:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteForm.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete form:', err);
    }
  };

  return (
    <div style={{ width: '100%', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Form Builder</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/builder/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none',
              borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem',
            }}
          >
            <Plus size={16} /> New (Blank)
          </button>
          <button
            onClick={handleCreateNew}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem',
            }}
          >
            <Plus size={16} /> New (Saved)
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search forms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '0.5rem 0.75rem', marginBottom: '1rem',
          border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem',
        }}
      />

      {isLoading && <p>Loading forms...</p>}
      {error && <p style={{ color: '#ef4444' }}>Error loading forms: {(error as Error).message}</p>}

      {data && data.formDefinitions.length === 0 && (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>
          No forms yet. Create one to get started.
        </p>
      )}

      {data && data.formDefinitions.length > 0 && (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {data.formDefinitions.map((form) => (
            <div
              key={form.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8,
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} style={{ color: '#6b7280' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{form.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    v{form.version} &middot; {form.status} &middot; {new Date(form.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate(`/builder/${form.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.375rem 0.75rem', background: '#f3f4f6', border: 'none',
                    borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem',
                  }}
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(form.id, form.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.375rem 0.75rem', background: '#fef2f2', color: '#ef4444',
                    border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
          Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} forms)
        </div>
      )}
    </div>
  );
}
