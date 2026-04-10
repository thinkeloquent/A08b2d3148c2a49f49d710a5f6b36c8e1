/**
 * Dashboard Page
 */

import { useDashboardStats } from '../hooks/useDashboard';
import { StatCard } from '../components/stats/StatCard';
import { TaskStatusChart } from '../components/stats/TaskStatusChart';
import { Spinner } from '../components/common/Spinner';

export function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load dashboard stats</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          icon="📋"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
        />
        <StatCard
          title="Active Workflows"
          value={stats?.totalWorkflows || 0}
          icon="🔄"
        />
        <StatCard
          title="Completion Rate"
          value={
            stats?.totalTasks
              ? `${Math.round(((stats.tasksByStatus.DONE || 0) / stats.totalTasks) * 100)}%`
              : '0%'
          }
          icon="✅"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h2>
          {stats?.tasksByStatus && (
            <TaskStatusChart data={stats.tasksByStatus} />
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            {stats?.tasksByStatus && Object.entries(stats.tasksByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{status.replace(/_/g, ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
