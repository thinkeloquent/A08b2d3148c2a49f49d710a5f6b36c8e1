import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DevEnvUrlSwitcher } from '@internal/dev-env-url-switcher';
import './styles.css';

import ExampleDefault from './example-default';
import ExampleCatalogOnly from './example-catalog-only';
import ExampleEmpty from './example-empty';

const EXAMPLES = [
  { name: 'Default (Full Platform)', path: '/' },
  { name: 'Catalog Only', path: '/catalog-only' },
  { name: 'Empty State', path: '/empty' },
];

function DevNav() {
  const navigate = useNavigate();
  return (
    <DevEnvUrlSwitcher
      links={EXAMPLES.map((e) => ({ name: e.name, url: e.path }))}
      onNavigate={(url) => navigate(url)}
      triggerLabel="Examples"
      title="TemplateManagePresents Examples"
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <DevNav />
    <Routes>
      <Route path="/catalog-only" element={<ExampleCatalogOnly />} />
      <Route path="/empty" element={<ExampleEmpty />} />
      <Route path="/*" element={<ExampleDefault />} />
    </Routes>
  </BrowserRouter>,
);
