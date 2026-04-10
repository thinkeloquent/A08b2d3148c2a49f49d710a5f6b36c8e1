import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DevEnvUrlSwitcher } from '@internal/dev-env-url-switcher';
import './styles.css';
import { PanelLeftSidebarMenu001 } from '../src';
import type { SidebarCategory, SidebarItem, CategoryColorScheme } from '../src';
import { useState } from 'react';

// --- Sample Data ---

const CATEGORIES: SidebarCategory[] = [
  { id: 'all', label: 'All', icon: '◈', count: 18 },
  { id: 'requirements', label: 'Requirements', icon: '◉', count: 5 },
  { id: 'design', label: 'Design', icon: '◎', count: 4 },
  { id: 'specification', label: 'Specification', icon: '◇', count: 5 },
  { id: 'operational', label: 'Operational', icon: '▣', count: 4 },
];

const TEMPLATES: SidebarItem[] = [
  { id: 1, name: 'User Story Map', category: 'requirements', tags: ['agile', 'planning'], updated: '2d ago', usageCount: 142, starred: true },
  { id: 2, name: 'Feature Requirements Doc', category: 'requirements', tags: ['PRD', 'product'], updated: '5d ago', usageCount: 98, starred: false },
  { id: 3, name: 'Acceptance Criteria', category: 'requirements', tags: ['QA', 'testing'], updated: '1w ago', usageCount: 67, starred: false },
  { id: 4, name: 'Stakeholder Analysis', category: 'requirements', tags: ['discovery'], updated: '3d ago', usageCount: 45, starred: true },
  { id: 5, name: 'Business Rules Matrix', category: 'requirements', tags: ['logic', 'rules'], updated: '2w ago', usageCount: 31, starred: false },
  { id: 6, name: 'Wireframe Layout', category: 'design', tags: ['UI', 'wireframe'], updated: '1d ago', usageCount: 210, starred: true },
  { id: 7, name: 'Component Library', category: 'design', tags: ['design system'], updated: '4d ago', usageCount: 185, starred: true },
  { id: 8, name: 'Color & Typography Guide', category: 'design', tags: ['branding'], updated: '1w ago', usageCount: 73, starred: false },
  { id: 9, name: 'Interaction Patterns', category: 'design', tags: ['UX', 'motion'], updated: '6d ago', usageCount: 54, starred: false },
  { id: 10, name: 'API Specification', category: 'specification', tags: ['REST', 'backend'], updated: '3d ago', usageCount: 156, starred: true },
  { id: 11, name: 'Data Model Schema', category: 'specification', tags: ['database', 'ERD'], updated: '5d ago', usageCount: 120, starred: false },
  { id: 12, name: 'Integration Contract', category: 'specification', tags: ['API', 'contract'], updated: '1w ago', usageCount: 88, starred: false },
  { id: 13, name: 'Event Schema Registry', category: 'specification', tags: ['events', 'async'], updated: '2d ago', usageCount: 62, starred: false },
  { id: 14, name: 'Auth Flow Specification', category: 'specification', tags: ['security', 'OAuth'], updated: '4d ago', usageCount: 94, starred: true },
  { id: 15, name: 'Runbook Template', category: 'operational', tags: ['SRE', 'incident'], updated: '1d ago', usageCount: 177, starred: true },
  { id: 16, name: 'Deployment Checklist', category: 'operational', tags: ['CI/CD', 'release'], updated: '3d ago', usageCount: 134, starred: false },
  { id: 17, name: 'Monitoring Dashboard', category: 'operational', tags: ['observability'], updated: '6d ago', usageCount: 99, starred: false },
  { id: 18, name: 'Capacity Planning', category: 'operational', tags: ['infra', 'scaling'], updated: '1w ago', usageCount: 41, starred: false },
];

const CATEGORY_COLORS: Record<string, CategoryColorScheme> = {
  requirements: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  design: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  specification: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
  operational: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
};

const MINIMAL_CATEGORIES: SidebarCategory[] = [
  { id: 'all', label: 'All', count: 3 },
  { id: 'active', label: 'Active', count: 2 },
  { id: 'archived', label: 'Archived', count: 1 },
];

const MINIMAL_ITEMS: SidebarItem[] = [
  { id: 'a', name: 'Project Alpha', category: 'active', updated: '1h ago' },
  { id: 'b', name: 'Project Beta', category: 'active', tags: ['urgent'], updated: '3d ago' },
  { id: 'c', name: 'Legacy System', category: 'archived', updated: '2mo ago' },
];

// --- Examples ---

const EXAMPLES = [
  { name: 'Default (Templates)', path: '/' },
  { name: 'Minimal (No Stars/Usage)', path: '/minimal' },
];

function DefaultExample() {
  const [items, setItems] = useState(TEMPLATES);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30 p-4">
      <PanelLeftSidebarMenu001
        title="Templates"
        categories={CATEGORIES}
        items={items}
        categoryColors={CATEGORY_COLORS}
        searchPlaceholder="Search templates..."
        onItemSelect={(item) => alert(`Selected: ${item.name}`)}
        onStarToggle={(id, starred) => {
          setItems((prev) => prev.map((t) => (t.id === id ? { ...t, starred } : t)));
        }}
        onHeaderAction={() => alert('Add new template')}
        footerLabel="Browse All Templates"
        onFooterAction={() => alert('Browse all')}
      />
    </div>
  );
}

function MinimalExample() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <PanelLeftSidebarMenu001
        title="Projects"
        categories={MINIMAL_CATEGORIES}
        items={MINIMAL_ITEMS}
        searchPlaceholder="Search projects..."
        onItemSelect={(item) => alert(`Selected: ${item.name}`)}
        headerActionIcon={null}
        footerLabel="View All Projects"
        onFooterAction={() => alert('View all')}
      />
    </div>
  );
}

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
      <Route path="/" element={<DefaultExample />} />
      <Route path="/minimal" element={<MinimalExample />} />
    </Routes>
  </BrowserRouter>,
);
