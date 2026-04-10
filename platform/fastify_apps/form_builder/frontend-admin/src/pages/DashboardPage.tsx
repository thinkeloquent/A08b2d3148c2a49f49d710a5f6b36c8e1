import { useForms } from '@/hooks/useForms';
import { useTags } from '@/hooks/useTags';
import { Link } from 'react-router-dom';
import { FileText, Tags, Plus } from 'lucide-react';

export function DashboardPage() {
  const { data: formsData } = useForms();
  const { data: tagsData } = useTags();

  const totalForms = formsData?.pagination?.total ?? 0;
  const totalTags = tagsData?.tags?.length ?? 0;
  const draftForms = formsData?.formDefinitions?.filter(f => f.status === 'draft').length ?? 0;
  const publishedForms = formsData?.formDefinitions?.filter(f => f.status === 'published').length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/forms/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> New Form
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-500">Total Forms</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalForms}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-500">Drafts</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{draftForms}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-500">Published</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{publishedForms}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Tags className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-500">Tags</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalTags}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Forms</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {formsData?.formDefinitions?.slice(0, 5).map(form => (
            <Link key={form.id} to={`/forms/${form.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{form.name}</p>
                <p className="text-sm text-gray-500">{form.description || 'No description'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${form.status === 'published' ? 'bg-green-100 text-green-700' : form.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                  {form.status}
                </span>
                <span className="text-xs text-gray-400">v{form.version}</span>
              </div>
            </Link>
          ))}
          {(!formsData?.formDefinitions || formsData.formDefinitions.length === 0) && (
            <p className="p-6 text-center text-gray-500">No forms yet. Create your first form!</p>
          )}
        </div>
      </div>
    </div>
  );
}
