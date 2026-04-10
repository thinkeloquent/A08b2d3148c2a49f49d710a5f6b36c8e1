import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout';
import {
  DashboardPage,
  RuleTreesPage,
  RuleTreeCreatePage,
  RuleTreeDetailPage,
  RuleTreeEditPage,
  ImportPreviewPage,
} from './pages';

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="trees">
          <Route index element={<RuleTreesPage />} />
          <Route path="new" element={<RuleTreeCreatePage />} />
          <Route path=":id" element={<RuleTreeDetailPage />} />
          <Route path=":id/edit" element={<RuleTreeEditPage />} />
        </Route>
        <Route path="import" element={<ImportPreviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
