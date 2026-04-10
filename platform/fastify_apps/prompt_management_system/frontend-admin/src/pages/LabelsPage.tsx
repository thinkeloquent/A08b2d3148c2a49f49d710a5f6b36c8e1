import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';

export default function LabelsPage() {
  const { data, isLoading } = useProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Labels</h2>
        <Link
          to="/labels/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          New Label
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prompts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.data.map(label => (
                <tr key={label.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{label.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{label.description || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{label.promptCount || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${label.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {label.status}
                    </span>
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
