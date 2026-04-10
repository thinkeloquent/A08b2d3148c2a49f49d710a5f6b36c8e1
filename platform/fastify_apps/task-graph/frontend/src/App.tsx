import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AppShell } from './layout/AppShell';
import TaskListPage from './pages/TaskListPage';
import TaskDetailPage from './pages/TaskDetailPage';
import ExecutionTimelinePage from './pages/ExecutionTimelinePage';
import RecentLogsPage from './pages/RecentLogsPage';
import FailedJobsPage from './pages/FailedJobsPage';

export default function App() {
  return (
    <BrowserRouter basename="/apps/task-graph">
      <AppShell>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="tasks" element={<TaskListPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="tasks/:taskId/timeline" element={<ExecutionTimelinePage />} />
          <Route path="logs" element={<RecentLogsPage />} />
          <Route path="retry-jobs" element={<FailedJobsPage />} />
        </Route>
      </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
