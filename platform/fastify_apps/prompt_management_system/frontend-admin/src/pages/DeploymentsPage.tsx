import { usePrompts } from '../hooks/usePrompts';

export default function DeploymentsPage() {
  const { data, isLoading } = usePrompts();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Deployments</h2>
      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {data?.data.map(prompt => (
            <div key={prompt.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900">{prompt.name}</h3>
              <p className="text-sm text-gray-500 font-mono mb-3">{prompt.slug}</p>
              <div className="flex gap-4">
                {prompt.deployments?.map(d => (
                  <div key={d.id} className="border rounded px-4 py-2">
                    <span className="text-sm font-medium capitalize">{d.environment}</span>
                    <span className="text-sm text-gray-500 ml-2">→ v{d.version?.version_number}</span>
                  </div>
                ))}
                {(!prompt.deployments || prompt.deployments.length === 0) && (
                  <span className="text-sm text-gray-400">No deployments</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
