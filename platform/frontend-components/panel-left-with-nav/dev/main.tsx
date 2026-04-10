import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DevEnvUrlSwitcher } from '@internal/dev-env-url-switcher';
import './styles.css';
import { PanelLeftTypesDashboard } from '../src';
import type { TypeNavItem } from '../src';

/* ------------------------------------------------------------------ */
/*  Sample data                                                       */
/* ------------------------------------------------------------------ */

const FQDP_ITEMS: TypeNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { key: 'organizations', label: 'Organizations', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg> },
  { key: 'workspaces', label: 'Workspaces', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg> },
  { key: 'teams', label: 'Teams', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: 'applications', label: 'Applications', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg> },
  { key: 'projects', label: 'Projects', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg> },
  { key: 'resources', label: 'Resources', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg> },
  { key: 'references', label: 'References', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
];

const MINIMAL_ITEMS: TypeNavItem[] = [
  { key: 'home', label: 'Home' },
  { key: 'settings', label: 'Settings' },
  { key: 'profile', label: 'Profile' },
];

/* ------------------------------------------------------------------ */
/*  Examples                                                          */
/* ------------------------------------------------------------------ */

const EXAMPLES = [
  { name: 'FQDP Manager', path: '/' },
  { name: 'Minimal (no icons)', path: '/minimal' },
  { name: 'With Footer', path: '/with-footer' },
];

function FqdpExample() {
  const [active, setActive] = useState('dashboard');
  return (
    <div className="flex h-screen bg-gray-50">
      <PanelLeftTypesDashboard
        title="FQDP Manager"
        items={FQDP_ITEMS}
        activeKey={active}
        onItemSelect={(item) => setActive(item.key)}
      />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {FQDP_ITEMS.find((i) => i.key === active)?.label}
        </h2>
        <p className="mt-2 text-gray-500">Content area for the selected type.</p>
      </div>
    </div>
  );
}

function MinimalExample() {
  const [active, setActive] = useState('home');
  return (
    <div className="flex h-screen bg-gray-50">
      <PanelLeftTypesDashboard
        items={MINIMAL_ITEMS}
        activeKey={active}
        onItemSelect={(item) => setActive(item.key)}
      />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {MINIMAL_ITEMS.find((i) => i.key === active)?.label}
        </h2>
      </div>
    </div>
  );
}

function WithFooterExample() {
  const [active, setActive] = useState('dashboard');
  return (
    <div className="flex h-screen bg-gray-50">
      <PanelLeftTypesDashboard
        title="FQDP Manager"
        items={FQDP_ITEMS}
        activeKey={active}
        onItemSelect={(item) => setActive(item.key)}
        footer={
          <div className="text-xs text-gray-500">
            <p className="font-medium">FQDP Management System</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        }
      />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {FQDP_ITEMS.find((i) => i.key === active)?.label}
        </h2>
      </div>
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
      <Route path="/" element={<FqdpExample />} />
      <Route path="/minimal" element={<MinimalExample />} />
      <Route path="/with-footer" element={<WithFooterExample />} />
    </Routes>
  </BrowserRouter>,
);
