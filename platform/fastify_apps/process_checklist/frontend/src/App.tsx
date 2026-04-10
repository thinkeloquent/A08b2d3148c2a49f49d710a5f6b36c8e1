import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { Navigation } from "./components/layout/Navigation";
import { HomePage } from "./pages/HomePage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { CreateTemplatePage } from "./pages/CreateTemplatePage";
import { EditTemplatePage } from "./pages/EditTemplatePage";
import { TemplateDetailPage } from "./pages/TemplateDetailPage";
import { ChecklistsPage } from "./pages/ChecklistsPage";
import { ChecklistDetailPage } from "./pages/ChecklistDetailPage";
import { GenerateChecklistPage } from "./pages/GenerateChecklistPage";

function App() {
  return (
    <BrowserRouter basename="/apps/process-checklist">
      <AppShell>
        <div className="relative flex min-h-screen flex-col bg-white text-neutral-900">
          <div className="relative flex flex-1 flex-col gap-10 pb-20">
            <Navigation />
            <main className="flex-1">
              <Routes data-test-id="routes-7866f273">
                <Route path="/" element={<HomePage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/templates/new" element={<CreateTemplatePage />} />
                <Route path="/templates/:templateId/edit" element={<EditTemplatePage />} />
                <Route path="/templates/:templateId" element={<TemplateDetailPage />} />
                <Route path="/checklists" element={<ChecklistsPage />} />
                <Route path="/checklists/generate" element={<GenerateChecklistPage />} />
                <Route path="/checklists/:checklistId" element={<ChecklistDetailPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </AppShell>
    </BrowserRouter>);

}

export default App;