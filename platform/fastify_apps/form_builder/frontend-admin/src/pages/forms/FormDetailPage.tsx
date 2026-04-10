import { useParams, Link } from 'react-router-dom';
import { useForm } from '@/hooks/useForms';
import { Edit, History, ArrowLeft } from 'lucide-react';

export function FormDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useForm(id!);
  const form = data?.formDefinition;

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (!form) return <p className="text-red-500">Form not found.</p>;

  const schema = form.schema_data as Record<string, unknown> | null;
  const pages = (schema?.pages as unknown[]) ?? [];
  const elementCount = pages.reduce((sum: number, p: unknown) => {
    const pg = p as { elements?: unknown[] };
    return sum + (pg.elements?.length ?? 0);
  }, 0);

  return (
    <div>
      <Link to="/forms" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Forms
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
          <p className="text-gray-500 mt-1">{form.description || 'No description'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/forms/${id}/edit`} className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Edit className="h-4 w-4" /> Edit
          </Link>
          <Link to={`/forms/${id}/versions`} className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <History className="h-4 w-4" /> Versions
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metadata */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Metadata</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-gray-500">Version</dt><dd className="font-medium">v{form.version}</dd></div>
            <div><dt className="text-gray-500">Status</dt>
              <dd><span className={`text-xs px-2 py-1 rounded-full font-medium ${form.status === 'published' ? 'bg-green-100 text-green-700' : form.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{form.status}</span></dd>
            </div>
            <div><dt className="text-gray-500">Created by</dt><dd className="font-medium">{form.created_by || 'Unknown'}</dd></div>
            <div><dt className="text-gray-500">Created</dt><dd className="font-medium">{new Date(form.createdAt).toLocaleDateString()}</dd></div>
            <div><dt className="text-gray-500">Updated</dt><dd className="font-medium">{new Date(form.updatedAt).toLocaleDateString()}</dd></div>
          </dl>
        </div>

        {/* Schema Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Schema Stats</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-gray-500">Pages</dt><dd className="text-2xl font-bold">{pages.length}</dd></div>
            <div><dt className="text-gray-500">Elements</dt><dd className="text-2xl font-bold">{elementCount}</dd></div>
          </dl>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {form.tags?.map(t => (
              <span key={t.id} className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{t.name}</span>
            ))}
            {(!form.tags || form.tags.length === 0) && <p className="text-sm text-gray-400">No tags</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
