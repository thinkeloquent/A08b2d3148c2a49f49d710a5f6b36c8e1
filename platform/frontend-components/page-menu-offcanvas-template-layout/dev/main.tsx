import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import './styles.css';
import { PageMenuOffcanvasTemplateLayout } from '../src';
import type {
  NavGroup, ActionItem, UserAvatar, TrailingTab,
  RailItem, ShellTheme, ComponentRegistryMap, RegionConfig, OrgConfig,
} from '../src';
import { DashboardMain } from './blocks/DashboardMain';
import { PropertiesDrawer } from './blocks/PropertiesDrawer';
import { OverviewLeftNav } from './blocks/OverviewLeftNav';
import { WorkflowsLeftNav } from './blocks/WorkflowsLeftNav';
import { WorkflowsMain } from './blocks/WorkflowsMain';
import { WorkflowsDrawer } from './blocks/WorkflowsDrawer';

/* ─── Inline SVG icon helper (dev-only) ─── */
const Svg = ({ children, size = 20 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {children}
  </svg>
);

const icons = {
  bell: <Svg size={18}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></Svg>,
  panelRight: <Svg size={18}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="15" y1="3" x2="15" y2="21" /></Svg>,
  settings: <Svg size={18}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></Svg>,
  closeSm: <Svg size={16}><path d="M18 6L6 18M6 6l12 12" /></Svg>,
  panelLeftClose: <Svg size={20}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="m16 15-3-3 3-3" /></Svg>,
  panelRightClose: <Svg size={20}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m8 9 3 3-3 3" /></Svg>,
};

const userIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/* ─── Sample data ─── */

const USER: UserAvatar = { icon: userIcon };

const GROUPS: NavGroup[] = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'workflows', label: 'Workflows' },
      { id: 'activity', label: 'Activity' },
      { id: 'insights', label: 'Insights' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'ai-agent-workflow-node-type', label: 'AI Agent Workflow Node Type Registry' },
      { id: 'ai-ask-v2', label: 'Ai Ask V2' },
      { id: 'form-builder', label: 'App Form Builder' },
      { id: 'categories', label: 'Category Manager' },
      { id: 'chroma-explorer', label: 'ChromaDB Explorer' },
      { id: 'clipboard2md', label: 'Clipboard2MD' },
      { id: 'code-repositories', label: 'Code Repositories' },
      { id: 'component-registry', label: 'Component Registry' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      { id: 'csv-datasource-hub', label: 'CSV Datasource Hub' },
      { id: 'fqdp-management-system', label: 'Fqdp Management System' },
      { id: 'github-workflow-action-ui', label: 'GitHub Actions Dashboard' },
      { id: 'github-file-metadata-retrieval', label: 'GitHub File Metadata Retrieval' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    items: [
      { id: 'figma-component-inspector', label: 'Figma Component Inspector' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { id: 'group-role-management', label: 'Group Role Management' },
      { id: 'langgraph-flow', label: 'LangGraph Flow Editor' },
      { id: 'langgraph-static-flow', label: 'LangGraph Reflection Studio' },
      { id: 'onboarding', label: 'Onboarding' },
      { id: 'persona-editor', label: 'Persona Editor' },
      { id: 'process-checklist', label: 'Process Checklist' },
      { id: 'prompt-management-system', label: 'Prompt Management System' },
      { id: 'rule-tree-table', label: 'Rule Tree Admin' },
      { id: 'task-graph', label: 'Task Graph' },
      { id: 'test-integrations', label: 'Test Integrations' },
      { id: 'ui-component-metadata', label: 'UI Component Metadata' },
    ],
  },
  {
    id: 'devsecops',
    label: 'DevSecOps',
    items: [
      { id: 'vulnerability-csv-workbench', label: 'Vulnerability CSV Workbench' },
    ],
  },
];

const TRAILING_TABS: TrailingTab[] = [
  { id: 'settings-tab', label: 'Settings', icon: icons.settings },
];

const THEME: ShellTheme = {
  rail: '#1E293B',
  railHover: '#334155',
  railIcon: '#94A3B8',
  accent: '#3B82F6',
  brand: '#2563EB',
};

const RAIL_BOTTOM: RailItem[] = [
  { key: 'settings', icon: icons.settings },
];

/* ─── Component Registry ─── */
const REGISTRY: ComponentRegistryMap = Object.freeze({
  'overview-left-nav': OverviewLeftNav,
  'dashboard-main': DashboardMain,
  'properties-drawer': PropertiesDrawer,
  'workflows-left-nav': WorkflowsLeftNav,
  'workflows-main': WorkflowsMain,
  'workflows-drawer': WorkflowsDrawer,
});

/* ─── Region Configuration — keyed by activeId ─── */
const REGIONS: Record<string, RegionConfig> = {
  overview: {
    left: [{ id: 'left-overview', type: 'overview-left-nav' }],
    main: [{ id: 'main-overview', type: 'dashboard-main' }],
    drawer: [{ id: 'drawer-overview', type: 'properties-drawer' }],
  },
  workflows: {
    left: [{ id: 'left-workflows', type: 'workflows-left-nav' }],
    main: [{ id: 'main-workflows', type: 'workflows-main' }],
    drawer: [{ id: 'drawer-workflows', type: 'workflows-drawer' }],
  },
  // Items without explicit config get empty panels
};

/* ─── Org config (baked-in fetch) ─── */
const ORG_CONFIG: OrgConfig = {
  endpoint: '/~/api/fqdp_management_system/organizations',
  createHref: '/apps/fqdp_management_system/organizations/new',
  manageHref: '/apps/fqdp_management_system/organizations/',
};

/* ─── App ─── */
function App() {
  const [activeId, setActiveId] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const actions: ActionItem[] = [
    { id: 'notifications', icon: icons.bell, ariaLabel: 'Notifications', showDot: true },
    { id: 'drawer-toggle', icon: icons.panelRight, ariaLabel: 'Toggle drawer', onClick: () => setDrawerOpen((o) => !o) },
  ];

  return (
    <PageMenuOffcanvasTemplateLayout
      /* Top navigation */
      groups={GROUPS}
      activeId={activeId}
      onActiveChange={setActiveId}
      orgConfig={ORG_CONFIG}
      search={{ placeholder: 'Search pages...' }}
      user={USER}
      actions={actions}
      trailingTabs={TRAILING_TABS}
      /* Left sidebar chrome */
      theme={THEME}
      railBottomItems={RAIL_BOTTOM}
      menuIcon={icons.panelRightClose}
      closeIcon={icons.panelLeftClose}
      /* Right drawer */
      drawerTitle="Properties"
      drawerCloseIcon={icons.closeSm}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
      /* Registry + regions (per-activeId map) */
      registry={REGISTRY}
      regions={REGIONS}
    />
  );
}

createRoot(document.getElementById('root')!).render(<App />);
