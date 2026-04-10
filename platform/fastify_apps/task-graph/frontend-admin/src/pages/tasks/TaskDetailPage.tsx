/**
 * Task Detail Page
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useTask, useStartTask, useCompleteTask, useRetryTask, useDeleteTask } from '../../hooks/useTasks';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useTask(taskId!);
  const startTask = useStartTask();
  const completeTask = useCompleteTask();
  const retryTask = useRetryTask();
  const deleteTask = useDeleteTask();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Task not found</p>
      </div>
    );
  }

  const task = data.data;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(task.id);
      navigate('/tasks');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => navigate('/tasks')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Tasks
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <div className="mt-2">
            <Badge status={task.status} />
          </div>
        </div>

        <div className="flex gap-2">
          {task.status === 'TODO' && (
            <button
              onClick={() => startTask.mutate(task.id)}
              disabled={startTask.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Start
            </button>
          )}
          {task.status === 'IN_PROGRESS' && (
            <button
              onClick={() => completeTask.mutate(task.id)}
              disabled={completeTask.isPending}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Complete
            </button>
          )}
          {task.status === 'FAILED' && task.retryCount < task.maxRetries && (
            <button
              onClick={() => retryTask.mutate(task.id)}
              disabled={retryTask.isPending}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              Retry
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteTask.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{task.id}</dd>
            </div>
            {task.idempotencyKey && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Idempotency Key</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{task.idempotencyKey}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{task.description || 'No description'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Repeat Interval</dt>
              <dd className="mt-1 text-sm text-gray-900">{task.repeatInterval}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Retry Count</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {task.retryCount} / {task.maxRetries}
              </dd>
            </div>
            {task.dueDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(task.dueDate).toLocaleString()}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(task.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(task.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
          {task.metadata && Object.keys(task.metadata).length > 0 ? (
            <pre className="bg-gray-50 rounded p-4 text-sm overflow-auto max-h-96">
              {JSON.stringify(task.metadata, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No metadata</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{task.stepsCount || 0}</p>
          <p className="text-sm text-gray-500">Steps</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{task.prerequisitesCount || 0}</p>
          <p className="text-sm text-gray-500">Prerequisites</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{task.dependentsCount || 0}</p>
          <p className="text-sm text-gray-500">Dependents</p>
        </div>
      </div>
    </div>
  );
}
