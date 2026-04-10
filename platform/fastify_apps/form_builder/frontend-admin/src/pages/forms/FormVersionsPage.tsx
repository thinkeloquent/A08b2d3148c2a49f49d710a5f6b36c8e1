import { useParams, Link } from 'react-router-dom';
import { useForm, useFormVersions, useCreateVersion, useRestoreVersion } from '@/hooks/useForms';
import { ArrowLeft, RotateCcw, Plus } from 'lucide-react';
import { useState } from 'react';

export function FormVersionsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: formData } = useForm(id!);
  const { data: versionsData, isLoading } = useFormVersions(id!);
  const createMut = useCreateVersion();
  const restoreMut = useRestoreVersion();
  const [summary, setSummary] = useState('');

  const form = formData?.formDefinition;
  const versions = versionsData?.versions ?? [];

  return (
    <div>
      <Link to={`/forms/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Form
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Version History</h1>
          {form && <p className="text-gray-500 mt-1">{form.name} (current: v{form.version})</p>}
        </div>
      </div>

      {/* Create snapshot */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Change summary (optional)..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={async () => { await createMut.mutateAsync({ formId: id!, changeSummary: summary }); setSummary(''); }}
            disabled={createMut.isPending}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Snapshot
          </button>
        </div>
      </div>

      {/* Version list */}
      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading && <p className="p-6 text-center text-gray-500">Loading...</p>}
        {versions.length === 0 && !isLoading && <p className="p-6 text-center text-gray-500">No versions yet. Create a snapshot to start tracking changes.</p>}
        <div className="divide-y divide-gray-100">
          {versions.map(v => (
            <div key={v.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">v{v.version}</p>
                <p className="text-sm text-gray-500">{v.changeSummary || 'No summary'}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(v.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => { if (confirm(`Restore to v${v.version}?`)) restoreMut.mutate({ formId: id!, versionId: v.id }); }}
                disabled={restoreMut.isPending}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
