import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TemplatesListPage } from './pages/templates/TemplatesListPage';
import { TemplateCreatePage } from './pages/templates/TemplateCreatePage';
import { TemplateDetailPage } from './pages/templates/TemplateDetailPage';
import { TemplateEditPage } from './pages/templates/TemplateEditPage';
import { ChecklistsListPage } from './pages/checklists/ChecklistsListPage';
import { ChecklistDetailPage } from './pages/checklists/ChecklistDetailPage';

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="templates">
          <Route index element={<TemplatesListPage />} />
          <Route path="new" element={<TemplateCreatePage />} />
          <Route path=":templateId" element={<TemplateDetailPage />} />
          <Route path=":templateId/edit" element={<TemplateEditPage />} />
        </Route>
        <Route path="checklists">
          <Route index element={<ChecklistsListPage />} />
          <Route path=":checklistId" element={<ChecklistDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
