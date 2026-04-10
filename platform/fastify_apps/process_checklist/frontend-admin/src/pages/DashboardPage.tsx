import { Link } from 'react-router-dom';
import {
  ClipboardList,
  CheckSquare,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import { useChecklists } from '../hooks/useChecklists';
import { StatsCard } from '../components/feedback/StatsCard';

export function DashboardPage() {
  const { data: templates, isLoading: templatesLoading } = useTemplates({
    limit: 1,
  });
  const { data: checklists, isLoading: checklistsLoading } = useChecklists({
    limit: 1,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Process Checklist administration overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Total Templates"
          value={templatesLoading ? '...' : (templates?.meta.total ?? 0)}
          icon={<ClipboardList className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
          linkTo="/templates"
          linkText="View all templates"
        />
        <StatsCard
          title="Total Checklists"
          value={checklistsLoading ? '...' : (checklists?.meta.total ?? 0)}
          icon={<CheckSquare className="w-6 h-6 text-green-600" />}
          color="bg-green-50"
          linkTo="/checklists"
          linkText="View all checklists"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/templates/new"
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 bg-blue-50 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Create Template</p>
              <p className="text-sm text-gray-500">
                Define a new process checklist template
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link
            to="/checklists"
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckSquare className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                View Generated Checklists
              </p>
              <p className="text-sm text-gray-500">
                Browse all generated checklist instances
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
