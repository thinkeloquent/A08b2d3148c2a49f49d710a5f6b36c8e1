import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { FormsPage } from './pages/forms/FormsPage';
import { FormDetailPage } from './pages/forms/FormDetailPage';
import { FormCreatePage } from './pages/forms/FormCreatePage';
import { FormEditPage } from './pages/forms/FormEditPage';
import { FormVersionsPage } from './pages/forms/FormVersionsPage';
import { TagsPage } from './pages/tags/TagsPage';
import { TagEditPage } from './pages/tags/TagEditPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/forms/new" element={<FormCreatePage />} />
        <Route path="/forms/:id" element={<FormDetailPage />} />
        <Route path="/forms/:id/edit" element={<FormEditPage />} />
        <Route path="/forms/:id/versions" element={<FormVersionsPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/tags/:id/edit" element={<TagEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
