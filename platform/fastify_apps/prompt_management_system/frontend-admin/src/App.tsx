import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import LabelsPage from './pages/LabelsPage';
import NewLabelPage from './pages/NewLabelPage';
import PromptsPage from './pages/PromptsPage';
import NewPromptPage from './pages/NewPromptPage';
import PromptEditorPage from './pages/PromptEditorPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="labels" element={<LabelsPage />} />
        <Route path="labels/new" element={<NewLabelPage />} />
        <Route path="prompts" element={<PromptsPage />} />
        <Route path="prompts/new" element={<NewPromptPage />} />
        <Route path="prompts/:id" element={<PromptEditorPage />} />
      </Route>
    </Routes>
  );
}
