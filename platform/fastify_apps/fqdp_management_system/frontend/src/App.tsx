import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { WorkspacesPage } from './pages/WorkspacesPage';
import { TeamsPage } from './pages/TeamsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ReferencesPage } from './pages/ReferencesPage';
import { AppShell } from './layout/AppShell';

function App() {
  return (
    <BrowserRouter basename="/apps/fqdp_management_system">
      <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/organizations/:id?" element={<OrganizationsPage />} />
        <Route path="/workspaces/:id?" element={<WorkspacesPage />} />
        <Route path="/teams/:id?" element={<TeamsPage />} />
        <Route path="/applications/:id?" element={<ApplicationsPage />} />
        <Route path="/projects/:id?" element={<ProjectsPage />} />
        <Route path="/resources/:id?" element={<ResourcesPage />} />
        <Route path="/references/:id?" element={<ReferencesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
