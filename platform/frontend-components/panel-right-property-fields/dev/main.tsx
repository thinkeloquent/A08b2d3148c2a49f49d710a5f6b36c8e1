import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DevEnvUrlSwitcher } from '@internal/dev-env-url-switcher';
import './styles.css';

import ExampleDefault from './example-default';
import ExampleEmpty from './example-empty';

const EXAMPLES = [
  { name: 'Default', path: '/' },
  { name: 'Empty State', path: '/empty' },
];

function DevNav() {
  const navigate = useNavigate();
  return (
    <DevEnvUrlSwitcher
      links={EXAMPLES.map((e) => ({ name: e.name, url: e.path }))}
      onNavigate={(url) => navigate(url)}
      triggerLabel="Examples"
      title="Component Examples"
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <DevNav />
    <Routes>
      <Route path="/" element={<ExampleDefault />} />
      <Route path="/empty" element={<ExampleEmpty />} />
    </Routes>
  </BrowserRouter>,
);
