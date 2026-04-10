import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const statusClass = `status-${task.status.toLowerCase().replace('_', '-')}`;

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">{task.title}</h3>
          {task.description &&
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
          }
        </div>
        <span
          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>

          {task.status.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        {task.stepsCount !== undefined &&
        <div className="flex items-center">
            <svg
            className="mr-1.5 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor" data-test-id="svg-aa4c09f9">

              <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />

            </svg>
            {task.stepsCount} steps
          </div>
        }

        {task.retryCount > 0 &&
        <div className="flex items-center text-orange-600">
            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-test-id="svg-86a40829">
              <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />

            </svg>
            {task.retryCount} retries
          </div>
        }

        {(task.prerequisitesCount || 0) > 0 &&
        <div className="flex items-center">
            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-test-id="svg-bf33f2ee">
              <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />

            </svg>
            {task.prerequisitesCount} deps
          </div>
        }
      </div>

      {task.createdAt &&
      <div className="mt-3 text-xs text-gray-400">
          Created {new Date(task.createdAt).toLocaleString()}
        </div>
      }
    </div>);

}