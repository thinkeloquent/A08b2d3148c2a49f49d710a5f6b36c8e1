import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { AppShell } from './layout/AppShell';

function App() {
  return (
    <BrowserRouter basename="/apps/organizations">
      <AppShell>
        <Routes>
          <Route path="/:id?" element={<OrganizationsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
