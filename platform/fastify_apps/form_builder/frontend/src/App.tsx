import { Routes, Route } from 'react-router-dom';
import FormListPage from './pages/FormListPage';
import FormBuilderPage from './pages/FormBuilderPage';
import { AppShell } from './layout/AppShell';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<FormListPage />} />
        <Route path="/builder/new" element={<FormBuilderPage />} />
        <Route path="/builder/:id" element={<FormBuilderPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
