import { useProjects } from '../hooks/useProjects';
import { usePrompts } from '../hooks/usePrompts';

export default function DashboardPage() {
  const { data: projectsData } = useProjects();
  const { data: promptsData } = usePrompts();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Labels</p>
          <p className="text-3xl font-bold text-gray-900">{projectsData?.pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Prompts</p>
          <p className="text-3xl font-bold text-gray-900">{promptsData?.pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Status</p>
          <p className="text-3xl font-bold text-green-600">Online</p>
        </div>
      </div>
    </div>
  );
}
