import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Archive, AlertTriangle } from 'lucide-react';
import { useTasks, useCreateTask, useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import TaskCard from '../components/task/TaskCard';
import CreateTaskModal from '../components/task/CreateTaskModal';
import type { Task, TaskStatus } from '../types';

export default function TaskListPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToArchive, setTaskToArchive] = useState<Task | null>(null);
  const { data: tasksData, isLoading, error } = useTasks({ status: statusFilter, limit: 50 });
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  const statuses: (TaskStatus | undefined)[] = [
  undefined,
  'PENDING',
  'IN_PROGRESS',
  'DONE',
  'BLOCKED',
  'SKIPPED',
  'FAILED'];


  const handleDelete = async () => {
    if (!taskToDelete) return;
    await deleteTask.mutateAsync(taskToDelete.id);
    setTaskToDelete(null);
  };

  const handleArchive = async () => {
    if (!taskToArchive) return;
    await updateTask.mutateAsync({
      id: taskToArchive.id,
      input: { status: 'SKIPPED' as TaskStatus }
    });
    setTaskToArchive(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load tasks: {(error as Error).message}</p>
      </div>);

  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your workflow tasks and track execution progress
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">

          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create Task
        </button>
      </div>

      {/* Status filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {statuses.map((status) =>
        <button
          key={status || 'all'}
          onClick={() => setStatusFilter(status)}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
          statusFilter === status ?
          'bg-blue-600 text-white' :
          'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`
          }>

            {status || 'All'}
          </button>
        )}
      </div>

      {/* Task list */}
      {isLoading ?
      <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div> :
      tasksData?.data && tasksData.data.length > 0 ?
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasksData.data.map((task) =>
        <div key={task.id} className="relative group">
              <Link to={`/tasks/${task.id}`}>
                <TaskCard task={task} />
              </Link>
              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTaskToArchive(task);
              }}
              className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
              title="Archive task">

                  <Archive size={16} className="text-purple-600" />
                </button>
                <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTaskToDelete(task);
              }}
              className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-colors"
              title="Delete task">

                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
        )}
        </div> :

      <div className="text-center py-12">
          <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor" data-test-id="svg-69cc0b91">

            <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />

          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
          <div className="mt-6">
            <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">

              Create Task
            </button>
          </div>
        </div>
      }

      {/* Create task modal */}
      {showCreateModal &&
      <CreateTaskModal
        onClose={() => setShowCreateModal(false)}
        onCreate={async (data) => {
          await createTask.mutateAsync(data);
          setShowCreateModal(false);
        }}
        isLoading={createTask.isPending} />

      }

      {/* Delete confirmation modal */}
      {taskToDelete &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Delete Task</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong>"{taskToDelete.title}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All steps and associated data will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
              onClick={() => setTaskToDelete(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">

                Cancel
              </button>
              <button
              onClick={handleDelete}
              disabled={deleteTask.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50">

                {deleteTask.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Archive confirmation modal */}
      {taskToArchive &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Archive className="text-purple-600" size={20} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Archive Task</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to archive <strong>"{taskToArchive.title}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The task will be marked as SKIPPED and can be filtered out from the active task list.
            </p>
            <div className="flex gap-3 justify-end">
              <button
              onClick={() => setTaskToArchive(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">

                Cancel
              </button>
              <button
              onClick={handleArchive}
              disabled={updateTask.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50">

                {updateTask.isPending ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Stats footer */}
      {tasksData?.pagination &&
      <div className="mt-6 text-sm text-gray-500 text-center">
          Showing {tasksData.data.length} of {tasksData.pagination.total} tasks
        </div>
      }
    </div>);

}