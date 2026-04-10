import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout';
import { DashboardPage } from './pages/DashboardPage';
import {
  FigmaFilesPage,
  FigmaFileCreatePage,
  FigmaFileDetailPage,
  FigmaFileEditPage,
} from './pages/figma-files';
import { TagsPage, TagEditPage } from './pages/tags';
import { MetadataPage, MetadataEditPage } from './pages/metadata';
import { BulkInsertPage } from './pages/BulkInsertPage';

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="figma-files">
          <Route index element={<FigmaFilesPage />} />
          <Route path="new" element={<FigmaFileCreatePage />} />
          <Route path=":id" element={<FigmaFileDetailPage />} />
          <Route path=":id/edit" element={<FigmaFileEditPage />} />
        </Route>
        <Route path="tags">
          <Route index element={<TagsPage />} />
          <Route path="new" element={<TagEditPage />} />
          <Route path=":id/edit" element={<TagEditPage />} />
        </Route>
        <Route path="metadata">
          <Route index element={<MetadataPage />} />
          <Route path=":id/edit" element={<MetadataEditPage />} />
        </Route>
        <Route path="bulk-insert" element={<BulkInsertPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
