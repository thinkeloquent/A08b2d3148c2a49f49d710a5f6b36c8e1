/**
 * Shared navigation menu items for all apps using PageMenuOffcanvasTemplateLayout.
 * Pure data — no JSX. See page-navigation-menu-items.jsx for JSX exports.
 */

export const SHELL_GROUPS = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { id: 'overview', label: 'Overview' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'form-builder', label: 'App Form Builder' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      { id: 'categories', label: 'Category Manager' },
      { id: 'chroma-explorer', label: 'ChromaDB Explorer' },
      { id: 'csv-datasource-hub', label: 'CSV Datasource Hub' },
      { id: 'fqdp-management-system', label: 'Fqdp Management System' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    items: [
      { id: 'figma-component-inspector', label: 'Figma Component Inspector' },
      { id: 'figma-file-navigator', label: 'Figma File Navigator' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { id: 'group-role-management', label: 'Group Role Management' },
      { id: 'organizations', label: 'Organizations' },
    ],
  },
  {
    id: 'aiops',
    label: 'AIOps',
    items: [
      { id: 'ai-agent-workflow-node-type', label: 'AI Agent Workflow Node Type Registry' },
      { id: 'ai-ask-v2', label: 'Ai Ask V2' },
      { id: 'persona-editor', label: 'Persona Editor' },
      { id: 'prompt-management-system', label: 'Prompt Management System' },
      { id: 'prompt-oneshot-template', label: 'Prompt Oneshot Template' },
    ],
  },
  {
    id: 'ui-component',
    label: 'UI Component',
    items: [
      { id: 'component-registry', label: 'Component Registry' },
    ],
  },
  {
    id: 'repo',
    label: 'Code',
    items: [
      { id: 'code-repositories', label: 'Code Repositories' },
      { id: 'rule-tree-table', label: 'Rule Tree Admin' },
      { id: 'ui-component-metadata', label: 'UI Component Metadata' },
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    items: [
      { id: 'github-workflow-action-ui', label: 'GitHub Actions Dashboard' },
      { id: 'langgraph-static-flow', label: 'LangGraph Reflection Studio' },
      { id: 'process-checklist', label: 'Process Checklist' },
      { id: 'task-graph', label: 'Task Graph' },
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

/** Maps nav item id → /apps/ URL slug */
export const APP_SLUG_MAP = {
  'ai-agent-workflow-node-type': 'ai-agent-workflow-node-type',
  'ai-ask-v2': 'ai-ask-v2',
  'form-builder': 'form-builder',
  'categories': 'categories',
  'chroma-explorer': 'chroma-explorer',
  'code-repositories': 'code-repositories',
  'component-registry': 'component-registry',
  'csv-datasource-hub': 'csv-datasource-hub',
  'figma-component-inspector': 'figma_component_inspector',
  'figma-file-navigator': 'figma-file-navigator',
  'fqdp-management-system': 'fqdp_management_system',
  'github-workflow-action-ui': 'github-workflow-action-ui',
  'group-role-management': 'group-role-management',
  'langgraph-static-flow': 'langgraph-static-flow',
  'persona-editor': 'persona-editor',
  'process-checklist': 'process-checklist',
  'prompt-management-system': 'prompt-management-system',
  'rule-tree-table': 'rule_tree_table',
  'task-graph': 'task-graph',
  'ui-component-metadata': 'ui-component-metadata',
  'prompt-oneshot-template': 'prompt-oneshot-template',
  'vulnerability-csv-workbench': 'vulnerability-csv-workbench',
  'organizations': 'organizations',
};

export const SHELL_THEME = {
  rail: '#1E293B',
  railHover: '#334155',
  railIcon: '#94A3B8',
  accent: '#3B82F6',
  brand: '#2563EB',
};
