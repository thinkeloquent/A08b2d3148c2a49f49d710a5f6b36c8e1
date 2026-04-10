import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DevEnvUrlSwitcher } from '@internal/dev-env-url-switcher';
import './styles.css';

import ExampleDefault from './example-default';
import ExampleMinimal from './example-minimal';

const EXAMPLES = [
  { name: 'Full Featured', path: '/' },
  { name: 'Minimal', path: '/minimal' },
];

function DevNav() {
  const navigate = useNavigate();
  return (
    <DevEnvUrlSwitcher
      links={EXAMPLES.map((e) => ({ name: e.name, url: e.path }))}
      onNavigate={(url) => navigate(url)}
      triggerLabel="Examples"
      title="PanelContextHeaderAbout Examples"
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <DevNav />
    <Routes>
      <Route path="/" element={<ExampleDefault />} />
      <Route path="/minimal" element={<ExampleMinimal />} />
    </Routes>
  </BrowserRouter>,
);
