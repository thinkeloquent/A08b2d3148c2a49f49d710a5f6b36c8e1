import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { usePrompts } from '../hooks/usePrompts';

export default function DashboardPage() {
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const { data: promptsData, isLoading: loadingPrompts } = usePrompts();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Labels</p>
          <p className="text-3xl font-bold text-gray-900">
            {loadingProjects ? '...' : projectsData?.pagination.total || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Prompts</p>
          <p className="text-3xl font-bold text-gray-900">
            {loadingPrompts ? '...' : promptsData?.pagination.total || 0}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prompts</h3>
      <div className="bg-white rounded-lg shadow">
        {loadingPrompts ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promptsData?.data.map((prompt) => (
                <tr key={prompt.id}>
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link
                      to={`/prompts/${prompt.id}`}
                      className="text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      {prompt.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{prompt.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{prompt.project?.name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      prompt.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prompt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
