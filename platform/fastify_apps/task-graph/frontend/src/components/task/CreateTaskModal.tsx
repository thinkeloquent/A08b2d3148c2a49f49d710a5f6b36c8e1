import { useState } from 'react';
import type { CreateTaskInput } from '../../types';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (data: CreateTaskInput) => void;
  isLoading: boolean;
}

export default function CreateTaskModal({ onClose, onCreate, isLoading }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    status: 'TODO'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { idempotencyKey, ...rest } = formData;
    onCreate(idempotencyKey ? { ...rest, idempotencyKey } : rest);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isLoading}>

            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-test-id="svg-f5095030">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />

            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div data-test-id="div-1d0b3d74">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter task title" />

          </div>

          <div data-test-id="div-054aae56">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter task description" />

          </div>

          <div data-test-id="div-49e151f1">
            <label htmlFor="idempotencyKey" className="block text-sm font-medium text-gray-700">
              Idempotency Key (optional)
            </label>
            <input
              type="text"
              id="idempotencyKey"
              value={formData.idempotencyKey || ''}
              onChange={(e) => setFormData({ ...formData, idempotencyKey: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Unique key for idempotent creation" />

            <p className="mt-1 text-xs text-gray-500">
              Prevents duplicate tasks when retrying requests
            </p>
          </div>

          <div className="flex gap-3 pt-4" data-test-id="div-ca6721f1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">

              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">

              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}