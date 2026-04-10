import { Link } from 'react-router-dom';
import { usePrompts } from '../hooks/usePrompts';

export default function PromptsPage() {
  const { data, isLoading } = usePrompts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Prompts</h2>
        <Link
          to="/prompts/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          New Prompt
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.data.map(prompt => (
                <tr key={prompt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{prompt.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{prompt.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{prompt.project?.name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${prompt.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {prompt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/prompts/${prompt.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
