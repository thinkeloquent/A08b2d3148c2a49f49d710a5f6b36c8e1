import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FlowListPage } from '@/pages/FlowListPage';
import { FlowEditorPage } from '@/pages/FlowEditorPage';

export default function App() {
  return (
    <BrowserRouter basename="/apps/langgraph-flow">
      <Routes>
        <Route path="/" element={<FlowListPage />} />
        <Route path="/editor/new" element={<FlowEditorPage />} />
        <Route path="/editor/:id" element={<FlowEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
