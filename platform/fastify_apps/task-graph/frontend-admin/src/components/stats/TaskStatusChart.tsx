/**
 * Task Status Chart Component
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TaskStatus } from '../../types';

const COLORS: Record<TaskStatus, string> = {
  PENDING: '#9CA3AF',
  TODO: '#6B7280',
  IN_PROGRESS: '#3B82F6',
  DONE: '#10B981',
  BLOCKED: '#F59E0B',
  SKIPPED: '#8B5CF6',
  RETRYING: '#F97316',
  FAILED: '#EF4444',
};

interface TaskStatusChartProps {
  data: Record<TaskStatus, number>;
}

export function TaskStatusChart({ data }: TaskStatusChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.replace(/_/g, ' '),
      value: count,
      color: COLORS[status as TaskStatus],
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No task data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
