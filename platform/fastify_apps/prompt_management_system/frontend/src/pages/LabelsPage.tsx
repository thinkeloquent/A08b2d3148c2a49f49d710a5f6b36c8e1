import { useProjects } from '../hooks/useProjects';

export default function LabelsPage() {
  const { data, isLoading } = useProjects();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Labels</h2>
      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading labels...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data.map((label) => (
            <div key={label.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">{label.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{label.description || 'No description'}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  label.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {label.status}
                </span>
                <span className="text-sm text-gray-400">
                  {label.promptCount || 0} prompts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
