/**
 * Task List Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks, useDeleteTask } from '../../hooks/useTasks';
import { DataTable } from '../../components/table/DataTable';
import { Badge } from '../../components/common/Badge';
import type { Task, TaskStatus } from '../../types';

const statusOptions: TaskStatus[] = [
  'PENDING',
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'BLOCKED',
  'SKIPPED',
  'RETRYING',
  'FAILED',
];

export function TaskListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useTasks({
    limit,
    offset: page * limit,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const deleteTask = useDeleteTask();

  const columns = [
    { key: 'title', header: 'Title' },
    {
      key: 'status',
      header: 'Status',
      render: (task: Task) => <Badge status={task.status} />,
    },
    {
      key: 'stepsCount',
      header: 'Steps',
      render: (task: Task) => task.stepsCount || 0,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (task: Task) => new Date(task.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (task: Task) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tasks/${task.id}`);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this task?')) {
                deleteTask.mutate(task.id);
              }
            }}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => navigate('/tasks/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          onRowClick={(task) => navigate(`/tasks/${task.id}`)}
          keyExtractor={(task) => task.id}
        />

        {/* Pagination */}
        {data?.pagination && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, data.pagination.total)} of{' '}
              {data.pagination.total} tasks
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.hasMore}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
