/**
 * Persona Editor Admin Application
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AdminLayout } from './components/layout';
import { DashboardPage, PersonasPage, PersonaDetailPage, PersonaFormPage, LLMDefaultsPage, LLMDefaultFormPage, AuditLogsPage } from './pages';

function AppRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/personas" element={<PersonasPage />} />
        <Route path="/personas/new" element={<PersonaFormPage />} />
        <Route path="/personas/:id/edit" element={<PersonaFormPage />} />
        <Route path="/personas/:id" element={<PersonaDetailPage />} />
        <Route path="/llm-defaults" element={<LLMDefaultsPage />} />
        <Route path="/llm-defaults/category/:category" element={<LLMDefaultsPage />} />
        <Route path="/llm-defaults/category/:category/new" element={<LLMDefaultFormPage />} />
        <Route path="/llm-defaults/category/:category/:id/edit" element={<LLMDefaultFormPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin/apps/persona-editor">
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
