/**
 * Admin Dashboard App
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TaskListPage } from './pages/tasks/TaskListPage';
import { TaskDetailPage } from './pages/tasks/TaskDetailPage';
import { TaskCreatePage } from './pages/tasks/TaskCreatePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-500">This page is under construction.</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin/apps/task-graph">
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tasks" element={<TaskListPage />} />
            <Route path="tasks/new" element={<TaskCreatePage />} />
            <Route path="tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="workflows" element={<PlaceholderPage title="Workflows" />} />
            <Route path="executions" element={<PlaceholderPage title="Execution Logs" />} />
            <Route path="users" element={<PlaceholderPage title="Users" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
