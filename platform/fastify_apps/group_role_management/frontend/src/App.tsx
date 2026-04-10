/**
 * Main App Component
 * Sets up React Router and React Query
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './contexts/ToastContext';
import { AppShell } from './layout/AppShell';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import RolesPage from './pages/RolesPage';
import GroupsPage from './pages/GroupsPage';
import LabelsPage from './pages/LabelsPage';
import ActionsPage from './pages/ActionsPage';
import RestrictionsPage from './pages/RestrictionsPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter basename="/apps/group-role-management">
          <AppShell>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="roles/:roleId" element={<RolesPage />} />
              <Route path="roles/:roleId/edit" element={<RolesPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="labels" element={<LabelsPage />} />
              <Route path="actions" element={<ActionsPage />} />
              <Route path="restrictions" element={<RestrictionsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          </AppShell>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
