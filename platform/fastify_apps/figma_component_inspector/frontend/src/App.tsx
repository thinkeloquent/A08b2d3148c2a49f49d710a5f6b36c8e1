import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FigmaComponentInspector from './components/FigmaComponentInspector';
import { AppShell } from './layout/AppShell';

function App() {
  return (
    <BrowserRouter basename="/apps/figma_component_inspector">
      <AppShell>
      <Routes>
        <Route path="/" element={<FigmaComponentInspector />} />
        <Route path="/load/file/:id" element={<FigmaComponentInspector />} />
        <Route path="/load/file/:id/:tab" element={<FigmaComponentInspector />} />
        <Route path="/load/file/:id/:tab/:subSection" element={<FigmaComponentInspector />} />
      </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
