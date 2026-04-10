import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForms, useDeleteForm } from '@/hooks/useForms';
import { Plus, Search, Trash2, Eye, Edit, History } from 'lucide-react';

export function FormsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useForms({ page, status: status || undefined, search: search || undefined });
  const deleteMut = useDeleteForm();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Form Definitions</h1>
        <Link to="/forms/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> New Form
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search forms..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Version</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Pages</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Elements</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tags</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>}
            {data?.formDefinitions?.map(form => (
              <tr key={form.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{form.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{form.description}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">v{form.version}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${form.status === 'published' ? 'bg-green-100 text-green-700' : form.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {form.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{form.pageCount}</td>
                <td className="px-4 py-3 text-gray-600">{form.elementCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {form.tags?.map(t => (
                      <span key={t.id} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">{t.name}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/forms/${form.id}`} className="p-1.5 rounded hover:bg-gray-100" title="View"><Eye className="h-4 w-4 text-gray-500" /></Link>
                    <Link to={`/forms/${form.id}/edit`} className="p-1.5 rounded hover:bg-gray-100" title="Edit"><Edit className="h-4 w-4 text-gray-500" /></Link>
                    <Link to={`/forms/${form.id}/versions`} className="p-1.5 rounded hover:bg-gray-100" title="Versions"><History className="h-4 w-4 text-gray-500" /></Link>
                    <button
                      onClick={() => { if (confirm('Delete this form?')) deleteMut.mutate(form.id); }}
                      className="p-1.5 rounded hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50">Previous</button>
            <button disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
