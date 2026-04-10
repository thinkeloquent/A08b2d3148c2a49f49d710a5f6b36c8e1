/**
 * Task Create Page
 */

import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCreateTask } from '../../hooks/useTasks';
import type { TaskStatus, RepeatInterval } from '../../types';

interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  repeatInterval: RepeatInterval;
  maxRetries: number;
  dueDate?: string;
}

export function TaskCreatePage() {
  const navigate = useNavigate();
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    defaultValues: {
      status: 'TODO',
      repeatInterval: 'NONE',
      maxRetries: 3
    }
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      const result = await createTask.mutateAsync({
        title: data.title,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate
      });
      navigate(`/tasks/${result.data.id}`);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/tasks')}
        className="text-blue-600 hover:text-blue-800 mb-4">

        ← Back to Tasks
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Task</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6 space-y-6" data-test-id="div-b802458f">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              {...register('title', { required: 'Title is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

            {errors.title &&
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            }
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">

              <option value="PENDING">Pending</option>
              <option value="TODO">Todo</option>
            </select>
          </div>

          {/* Repeat Interval */}
          <div>
            <label htmlFor="repeatInterval" className="block text-sm font-medium text-gray-700">
              Repeat Interval
            </label>
            <select
              id="repeatInterval"
              {...register('repeatInterval')}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">

              <option value="NONE">None</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          {/* Max Retries */}
          <div>
            <label htmlFor="maxRetries" className="block text-sm font-medium text-gray-700">
              Max Retries
            </label>
            <input
              type="number"
              id="maxRetries"
              min={0}
              max={10}
              {...register('maxRetries', { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              {...register('dueDate')}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">

              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">

              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      </form>
    </div>);

}