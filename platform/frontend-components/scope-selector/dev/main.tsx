import { createRoot } from 'react-dom/client';
import './styles.css';
import { ScopeSelector } from '../src';
import type { ScopeSelectorScope, ScopeSelectorValue } from '../src';

/* ─── sample SVG icon helper ─── */
const SvgIcon = ({ d }: { d: string }) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

/* ─── sample scopes ─── */
const SCOPES: ScopeSelectorScope[] = [
  {
    key: 'organization',
    label: 'Organizations',
    icon: <SvgIcon d="M3 21V7a2 2 0 012-2h6a2 2 0 012 2v14M13 10h6a2 2 0 012 2v9M1 21h22M9 7v.01M9 11v.01M9 15v.01M17 14v.01M17 18v.01" />,
    color: '#6C5CE7',
    items: [
      { id: 'org-1', name: 'API Create mnj8h21r_qkfe', badge: 'A' },
      { id: 'org-2', name: 'API Update mnj8h21z_axd1', badge: 'A' },
      { id: 'org-3', name: 'UI Create mnj8h21z_axd1', badge: 'U' },
      { id: 'org-4', name: 'probe_update_17752406', badge: 'P' },
      { id: 'org-5', name: 'API Update mnj8gfc4_4ycj', badge: 'A' },
      { id: 'org-6', name: 'Design System v2.4', badge: 'D' },
    ],
  },
  {
    key: 'workspace',
    label: 'Workspaces',
    icon: <SvgIcon d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM2 10h20M10 4v16" />,
    color: '#0984E3',
    items: [
      { id: 'ws-1', name: 'Frontend Platform', badge: 'F' },
      { id: 'ws-2', name: 'Backend Services', badge: 'B' },
      { id: 'ws-3', name: 'Infrastructure', badge: 'I' },
      { id: 'ws-4', name: 'Data Engineering', badge: 'D' },
    ],
  },
  {
    key: 'team',
    label: 'Teams',
    icon: <SvgIcon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
    color: '#00B894',
    items: [
      { id: 'tm-1', name: 'Core Platform', badge: 'C' },
      { id: 'tm-2', name: 'Growth Engineering', badge: 'G' },
      { id: 'tm-3', name: 'DevOps', badge: 'D' },
      { id: 'tm-4', name: 'Security', badge: 'S' },
      { id: 'tm-5', name: 'QA Automation', badge: 'Q' },
    ],
  },
  {
    key: 'application',
    label: 'Applications',
    icon: <SvgIcon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    color: '#E17055',
    items: [
      { id: 'ap-1', name: 'Auth Service v3', badge: 'A' },
      { id: 'ap-2', name: 'Billing Gateway', badge: 'B' },
      { id: 'ap-3', name: 'Notification Hub', badge: 'N' },
      { id: 'ap-4', name: 'Analytics Engine', badge: 'A' },
    ],
  },
  {
    key: 'project',
    label: 'Projects',
    icon: <SvgIcon d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />,
    color: '#FDCB6E',
    items: [
      { id: 'pj-1', name: 'Q2 Platform Migration', badge: 'Q' },
      { id: 'pj-2', name: 'SSO Integration', badge: 'S' },
      { id: 'pj-3', name: 'Performance Audit', badge: 'P' },
      { id: 'pj-4', name: 'Mobile SDK Rewrite', badge: 'M' },
      { id: 'pj-5', name: 'API v4 Rollout', badge: 'A' },
    ],
  },
];

function App() {
  const handleSelect = (val: ScopeSelectorValue) => {
    console.log('Selected:', val.scope.label, '/', val.item.name);
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center pt-24"
      style={{ background: 'linear-gradient(135deg, #f8f9fc 0%, #eef1f8 100%)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <ScopeSelector
        scopes={SCOPES}
        defaultValue={{ scope: SCOPES[0], item: SCOPES[0].items[0] }}
        onSelect={handleSelect}
        onCreateClick={(scope) => console.log('Create in', scope.label)}
        onManageClick={(scope) => console.log('Manage', scope.label)}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
