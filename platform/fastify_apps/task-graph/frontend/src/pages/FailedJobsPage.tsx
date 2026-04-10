import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

export default function FailedJobsPage() {
  const { data: tasksData, isLoading, error } = useTasks({ status: 'RETRYING', limit: 100 });

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>);

  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load retrying tasks</p>
        </div>
      </div>);

  }

  const tasks = tasksData?.data || [];

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <RefreshCw size={28} data-test-id="refreshcw-09eee544" />
          Retrying Tasks
          {tasks.length > 0 &&
          <span className="ml-2 px-2 py-0.5 text-sm font-medium rounded-full bg-orange-100 text-orange-700">
              {tasks.length}
            </span>
          }
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Tasks that failed and are pending retry
        </p>
      </div>

      {tasks.length === 0 ?
      <div className="bg-white shadow rounded-lg p-8 text-center">
          <RefreshCw size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No tasks retrying</p>
          <p className="text-sm text-gray-400 mt-1">All tasks are running smoothly</p>
        </div> :

      <div className="space-y-4">
          {tasks.map((task) =>
        <Link
          key={task.id}
          to={`/tasks/${task.id}`}
          className="block bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors">

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900">
                  {task.title}
                </h3>
                {task.description &&
            <p className="mt-1 text-sm text-gray-600 truncate">
                    {task.description}
                  </p>
            }
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>Retry count: {task.retryCount} / {task.maxRetries}</span>
                  {task.metadata && 'lastError' in task.metadata &&
              <span className="text-red-600">
                      Error: {String(task.metadata.lastError)}
                    </span>
              }
                </div>
              </div>
            </Link>
        )}
        </div>
      }
    </div>);

}