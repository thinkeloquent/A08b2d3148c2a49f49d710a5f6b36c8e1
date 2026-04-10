import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  GithubWorkflowBuilderProps,
  WorkflowPreset,
  WorkflowUtil,
  Workflow,
  WorkflowBuilderIcons,
} from './types';
import { DEFAULT_ICONS } from './icons';
import { compileTemplate } from './template-engine';

/* ─── Helpers ─── */

const genId = () => 'w' + Math.random().toString(36).slice(2, 10);

/** Shorthand for building an import line */
const _im = (pkg: string, named: string) => `import { ${named} } from '${pkg}';`;
/** Shorthand for building a default import line */
const _imd = (pkg: string, name: string) => `import ${name} from '${pkg}';`;

/* ─── Preset Templates ─── */

const PRESET_TEMPLATES: WorkflowPreset[] = [
  {
    id: 'preset-ci',
    name: 'CI Pipeline',
    description: 'Continuous integration with build, test, and lint steps',
    category: 'CI/CD',
    template: `name: {{ workflowName ?? 'CI Pipeline' }}

on:
  push:
    branches: [{{ branch ?? 'main' }}]
  pull_request:
    branches: [{{ branch ?? 'main' }}]

jobs:
  build:
    runs-on: {{ runner ?? 'ubuntu-latest' }}
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '{{ nodeVersion ?? '20' }}'
          cache: '{{ packageManager ?? 'npm' }}'
      - name: Install dependencies
        run: {{ packageManager ?? 'npm' }} install
      - name: Lint
        run: {{ packageManager ?? 'npm' }} run lint
      - name: Test
        run: {{ packageManager ?? 'npm' }} test
      - name: Build
        run: {{ packageManager ?? 'npm' }} run build`,
    variables: {
      workflowName: 'CI Pipeline',
      branch: 'main',
      runner: 'ubuntu-latest',
      nodeVersion: '20',
      packageManager: 'npm',
    },
  },
  {
    id: 'preset-deploy',
    name: 'Deploy to Production',
    description: 'Build and deploy to a cloud provider on push to main',
    category: 'Deployment',
    template: `name: {{ workflowName ?? 'Deploy' }}

on:
  push:
    branches: [{{ branch ?? 'main' }}]

jobs:
  deploy:
    runs-on: {{ runner ?? 'ubuntu-latest' }}
    environment: {{ environment ?? 'production' }}
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '{{ nodeVersion ?? '20' }}'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy
        run: |
          echo "Deploying to {{ provider ?? 'aws' }}..."
          {{ deployCommand ?? 'echo "Add your deploy command here"' }}
        env:
          DEPLOY_TOKEN: \${{ '{{' }} secrets.DEPLOY_TOKEN {{ '}}' }}`,
    variables: {
      workflowName: 'Deploy',
      branch: 'main',
      runner: 'ubuntu-latest',
      environment: 'production',
      nodeVersion: '20',
      provider: 'aws',
      deployCommand: 'echo "Add your deploy command here"',
    },
  },
  {
    id: 'preset-release',
    name: 'Release & Publish',
    description: 'Semantic release with changelog generation and npm publish',
    category: 'Release',
    template: `name: {{ workflowName ?? 'Release' }}

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write
  packages: write

jobs:
  release:
    runs-on: {{ runner ?? 'ubuntu-latest' }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '{{ nodeVersion ?? '20' }}'
          registry-url: '{{ registry ?? 'https://registry.npmjs.org' }}'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
@if(publishToNpm)
      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: \${{ '{{' }} secrets.NPM_TOKEN {{ '}}' }}
@endif`,
    variables: {
      workflowName: 'Release',
      runner: 'ubuntu-latest',
      nodeVersion: '20',
      registry: 'https://registry.npmjs.org',
      publishToNpm: true,
    },
  },
];

/* ─── Initial Utilities ─── */

const INITIAL_UTILS: WorkflowUtil[] = [
  {
    id: 'util-notify',
    name: 'slack-notify.sh',
    description: 'Send a Slack notification on workflow completion',
    language: 'bash',
    associatedWorkflows: [],
    content: [
      '#!/bin/bash',
      '# Slack notification helper',
      '# Usage: ./slack-notify.sh <status> <message>',
      '',
      'STATUS=${1:-"success"}',
      'MESSAGE=${2:-"Workflow completed"}',
      'WEBHOOK_URL="${SLACK_WEBHOOK_URL}"',
      '',
      'if [ -z "$WEBHOOK_URL" ]; then',
      '  echo "Error: SLACK_WEBHOOK_URL is not set"',
      '  exit 1',
      'fi',
      '',
      'COLOR="good"',
      'if [ "$STATUS" = "failure" ]; then',
      '  COLOR="danger"',
      'fi',
      '',
      'curl -s -X POST "$WEBHOOK_URL" \\',
      "  -H 'Content-Type: application/json' \\",
      '  -d "{',
      '    \\"attachments\\": [{',
      '      \\"color\\": \\"$COLOR\\",',
      '      \\"title\\": \\"Workflow $STATUS\\",',
      '      \\"text\\": \\"$MESSAGE\\",',
      '      \\"ts\\": $(date +%s)',
      '    }]',
      '  }"',
    ].join('\n'),
  },
  {
    id: 'util-cache',
    name: 'setup-cache.sh',
    description: 'Advanced caching setup for monorepo builds',
    language: 'bash',
    associatedWorkflows: [],
    content: [
      '#!/bin/bash',
      '# Advanced cache setup for CI',
      '# Restores caches for node_modules, build output, and turbo',
      '',
      'CACHE_KEY="build-${RUNNER_OS}-$(shasum package-lock.json | cut -d \' \' -f 1)"',
      'echo "Cache key: $CACHE_KEY"',
      '',
      '# Restore node_modules cache',
      'if [ -d "node_modules/.cache" ]; then',
      '  echo "Cache hit: node_modules"',
      'else',
      '  echo "Cache miss: installing dependencies"',
      '  npm ci',
      'fi',
      '',
      '# Restore turbo cache',
      'if [ -d ".turbo" ]; then',
      '  echo "Turbo cache restored"',
      'fi',
    ].join('\n'),
  },
  {
    id: 'util-version',
    name: 'bump-version.mjs',
    description: 'Semantic version bumping utility',
    language: 'javascript',
    associatedWorkflows: [],
    content: [
      _imd('fs', 'fs'),
      _im('path', 'resolve'),
      _imd('child_process', 'cp'),
      '',
      "const BUMP_TYPE = process.argv[2] || 'patch';",
      "const pkgPath = resolve(process.cwd(), 'package.json');",
      "const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));",
      '',
      "const [major, minor, patch] = pkg.version.split('.').map(Number);",
      '',
      'const newVersion = {',
      '  major: `${major + 1}.0.0`,',
      '  minor: `${major}.${minor + 1}.0`,',
      '  patch: `${major}.${minor}.${patch + 1}`,',
      '}[BUMP_TYPE];',
      '',
      'pkg.version = newVersion;',
      "fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\\n');",
      'console.log(`Bumped version to ${newVersion}`);',
    ].join('\n'),
  },
  {
    id: 'util-health',
    name: 'health-check.sh',
    description: 'Post-deploy health check with retry logic',
    language: 'bash',
    associatedWorkflows: [],
    content: [
      '#!/bin/bash',
      '# Health check with retry',
      '# Usage: ./health-check.sh <url> [max_retries] [delay_seconds]',
      '',
      'URL=${1:?"Usage: health-check.sh <url> [retries] [delay]"}',
      'MAX_RETRIES=${2:-10}',
      'DELAY=${3:-5}',
      '',
      'echo "Checking health at $URL"',
      'for i in $(seq 1 $MAX_RETRIES); do',
      '  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")',
      '  if [ "$STATUS" = "200" ]; then',
      '    echo "Health check passed (attempt $i)"',
      '    exit 0',
      '  fi',
      '  echo "Attempt $i/$MAX_RETRIES: status $STATUS, retrying in ${DELAY}s..."',
      '  sleep $DELAY',
      'done',
      '',
      'echo "Health check failed after $MAX_RETRIES attempts"',
      'exit 1',
    ].join('\n'),
  },
];

/* ─── Sub-Components ─── */

function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) {
  const variants: Record<string, string> = {
    default: 'bg-slate-100 text-slate-600 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        variants[variant] || variants.default,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-slate-300',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
      {label && <span className="text-sm text-slate-600">{label}</span>}
    </label>
  );
}

function TabBar({
  tabs,
  active,
  onSelect,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-slate-200 px-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={[
            'px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
            active === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
          ].join(' ')}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function CodeBlock({
  code,
  language = 'yaml',
  maxHeight = '400px',
  icons,
}: {
  code: string;
  language?: string;
  maxHeight?: string;
  icons: Required<WorkflowBuilderIcons>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border border-slate-200 bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <span className="w-3.5 h-3.5">{copied ? icons.check : icons.copy}</span>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        className="p-3 text-sm font-mono text-slate-300 overflow-auto"
        style={{ maxHeight }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  icons,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
  icons: Required<WorkflowBuilderIcons>;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={[
          'bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col',
          wide ? 'w-[720px] max-h-[85vh]' : 'w-[520px] max-h-[80vh]',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="w-4 h-4 block">{icons.x}</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-xs text-slate-400 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

function UtilForm({
  util,
  onChange,
  icons,
}: {
  util: Partial<WorkflowUtil>;
  onChange: (updated: Partial<WorkflowUtil>) => void;
  icons: Required<WorkflowBuilderIcons>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
        <input
          type="text"
          value={util.name || ''}
          onChange={(e) => onChange({ ...util, name: e.target.value })}
          placeholder="my-script.sh"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <input
          type="text"
          value={util.description || ''}
          onChange={(e) => onChange({ ...util, description: e.target.value })}
          placeholder="What does this utility do?"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
        <select
          value={util.language || 'bash'}
          onChange={(e) => onChange({ ...util, language: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="bash">Bash</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="yaml">YAML</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
        <textarea
          value={util.content || ''}
          onChange={(e) => onChange({ ...util, content: e.target.value })}
          placeholder="#!/bin/bash..."
          rows={12}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
      </div>
    </div>
  );
}

function Toast({
  message,
  onClose,
  icons,
}: {
  message: string;
  onClose: () => void;
  icons: Required<WorkflowBuilderIcons>;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm rounded-xl shadow-2xl animate-[slideUp_0.25s_ease-out]">
      <span className="w-4 h-4 text-emerald-400">{icons.check}</span>
      {message}
    </div>
  );
}

/* ─── Main Component ─── */

export function GithubWorkflowBuilder({
  presets: presetsProp,
  initialWorkflows: initialWorkflowsProp,
  initialUtils: initialUtilsProp,
  icons: iconsProp,
  onWorkflowCreate,
  onWorkflowDelete,
  onUtilCreate,
  onUtilDelete,
  onExport,
  className = '',
  children,
}: GithubWorkflowBuilderProps) {
  /* Merge icons with defaults */
  const icons: Required<WorkflowBuilderIcons> = { ...DEFAULT_ICONS, ...iconsProp };
  const presets = presetsProp ?? PRESET_TEMPLATES;
  const defaultWorkflows = initialWorkflowsProp ?? [];
  const defaultUtils = initialUtilsProp ?? INITIAL_UTILS;

  /* ─── State ─── */
  const [workflows, setWorkflows] = useState<Workflow[]>(defaultWorkflows);
  const [utils, setUtils] = useState<WorkflowUtil[]>(defaultUtils);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [selectedUtilId, setSelectedUtilId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'workflows' | 'utils'>('workflows');
  const [mainTab, setMainTab] = useState<'editor' | 'preview' | 'variables'>('editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  /* Modals */
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showCreateUtilModal, setShowCreateUtilModal] = useState(false);
  const [showEditUtilModal, setShowEditUtilModal] = useState(false);
  const [showLinkUtilsModal, setShowLinkUtilsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  /* Util form state */
  const [utilFormData, setUtilFormData] = useState<Partial<WorkflowUtil>>({
    language: 'bash',
  });

  /* Export data */
  const [exportData, setExportData] = useState<string>('');

  /* Derived state */
  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId) ?? null;
  const selectedUtil = utils.find((u) => u.id === selectedUtilId) ?? null;

  const filteredWorkflows = workflows.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.presetId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredUtils = utils.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /* ─── Toast helper ─── */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  /* ─── Workflow CRUD ─── */

  const createWorkflow = (preset: WorkflowPreset) => {
    const workflow: Workflow = {
      id: genId(),
      name: preset.name + ' Workflow',
      presetId: preset.id,
      template: preset.template,
      variables: { ...preset.variables },
      utils: [],
    };
    setWorkflows((prev) => [...prev, workflow]);
    setSelectedWorkflowId(workflow.id);
    setSelectedUtilId(null);
    setSidebarTab('workflows');
    setShowPresetModal(false);
    showToast(`Created workflow "${workflow.name}"`);
    onWorkflowCreate?.(workflow);
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    if (selectedWorkflowId === id) setSelectedWorkflowId(null);
    showToast('Workflow deleted');
    onWorkflowDelete?.(id);
  };

  const updateWorkflow = (id: string, updates: Partial<Workflow>) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    );
  };

  const updateWorkflowVariable = (workflowId: string, key: string, value: unknown) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? { ...w, variables: { ...w.variables, [key]: value } }
          : w,
      ),
    );
  };

  /* ─── Utility CRUD ─── */

  const createUtil = () => {
    if (!utilFormData.name || !utilFormData.content) return;
    const util: WorkflowUtil = {
      id: genId(),
      name: utilFormData.name,
      description: utilFormData.description || '',
      language: utilFormData.language || 'bash',
      associatedWorkflows: [],
      content: utilFormData.content,
    };
    setUtils((prev) => [...prev, util]);
    setShowCreateUtilModal(false);
    setUtilFormData({ language: 'bash' });
    showToast(`Created utility "${util.name}"`);
    onUtilCreate?.(util);
  };

  const deleteUtil = (id: string) => {
    setUtils((prev) => prev.filter((u) => u.id !== id));
    // Remove from all workflow linkages
    setWorkflows((prev) =>
      prev.map((w) => ({
        ...w,
        utils: w.utils.filter((uid) => uid !== id),
      })),
    );
    if (selectedUtilId === id) setSelectedUtilId(null);
    showToast('Utility deleted');
    onUtilDelete?.(id);
  };

  const updateUtil = () => {
    if (!selectedUtil || !utilFormData.name) return;
    setUtils((prev) =>
      prev.map((u) =>
        u.id === selectedUtil.id
          ? {
              ...u,
              name: utilFormData.name!,
              description: utilFormData.description || '',
              language: utilFormData.language || u.language,
              content: utilFormData.content || u.content,
            }
          : u,
      ),
    );
    setShowEditUtilModal(false);
    showToast(`Updated utility "${utilFormData.name}"`);
  };

  /* ─── Link/Unlink Utils ─── */

  const toggleUtilLink = (workflowId: string, utilId: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id !== workflowId) return w;
        const linked = w.utils.includes(utilId);
        return {
          ...w,
          utils: linked
            ? w.utils.filter((uid) => uid !== utilId)
            : [...w.utils, utilId],
        };
      }),
    );
    setUtils((prev) =>
      prev.map((u) => {
        if (u.id !== utilId) return u;
        const linked = u.associatedWorkflows.includes(workflowId);
        return {
          ...u,
          associatedWorkflows: linked
            ? u.associatedWorkflows.filter((wid) => wid !== workflowId)
            : [...u.associatedWorkflows, workflowId],
        };
      }),
    );
  };

  /* ─── Export ─── */

  const generateExport = () => {
    const bundle = {
      _links: {
        self: { href: '/api/workflows', method: 'GET' },
        create: { href: '/api/workflows', method: 'POST' },
      },
      workflows: workflows.map((w) => ({
        ...w,
        _compiled: compileTemplate(w.template, w.variables),
        _links: {
          self: { href: `/api/workflows/${w.id}`, method: 'GET' },
          update: { href: `/api/workflows/${w.id}`, method: 'PUT' },
          delete: { href: `/api/workflows/${w.id}`, method: 'DELETE' },
          utils: { href: `/api/workflows/${w.id}/utils`, method: 'GET' },
        },
      })),
      utils: utils.map((u) => ({
        ...u,
        _links: {
          self: { href: `/api/utils/${u.id}`, method: 'GET' },
          update: { href: `/api/utils/${u.id}`, method: 'PUT' },
          delete: { href: `/api/utils/${u.id}`, method: 'DELETE' },
        },
      })),
    };
    const json = JSON.stringify(bundle, null, 2);
    setExportData(json);
    setShowExportModal(true);
    onExport?.(bundle);
  };

  /* ─── Sidebar ─── */

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
            <span className="w-4 h-4">{icons.workflow}</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">Workflow Builder</h1>
            <p className="text-[10px] text-slate-400">GitHub Actions Manager</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400">
            {icons.search}
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Tab bar */}
      <TabBar
        tabs={[
          { id: 'workflows', label: 'Workflows', count: workflows.length },
          { id: 'utils', label: 'Utilities', count: utils.length },
        ]}
        active={sidebarTab}
        onSelect={(id) => setSidebarTab(id as 'workflows' | 'utils')}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {sidebarTab === 'workflows' ? (
          filteredWorkflows.length === 0 ? (
            <EmptyState
              icon={<span className="w-6 h-6">{icons.workflow}</span>}
              title="No workflows"
              description="Create your first workflow from a preset template"
              action={
                <button
                  onClick={() => setShowPresetModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="w-3 h-3">{icons.plus}</span>
                  New Workflow
                </button>
              }
            />
          ) : (
            <div className="space-y-1">
              {filteredWorkflows.map((w) => {
                const preset = presets.find((p) => p.id === w.presetId);
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWorkflowId(w.id);
                      setSelectedUtilId(null);
                    }}
                    className={[
                      'w-full text-left px-3 py-2.5 rounded-lg transition-colors group',
                      selectedWorkflowId === w.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-slate-50 border border-transparent',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 text-blue-500">{icons.workflow}</span>
                      <span className="text-sm font-medium text-slate-700 truncate flex-1">
                        {w.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkflow(w.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-4 h-4 text-slate-400 hover:text-red-500 transition-all"
                      >
                        {icons.trash}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-5.5">
                      {preset && (
                        <Badge variant="info">{preset.category}</Badge>
                      )}
                      {w.utils.length > 0 && (
                        <Badge variant="success">
                          <span className="w-2.5 h-2.5">{icons.link}</span>
                          {w.utils.length}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : filteredUtils.length === 0 ? (
          <EmptyState
            icon={<span className="w-6 h-6">{icons.file}</span>}
            title="No utilities"
            description="Create utility scripts to use across workflows"
            action={
              <button
                onClick={() => {
                  setUtilFormData({ language: 'bash' });
                  setShowCreateUtilModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                <span className="w-3 h-3">{icons.plus}</span>
                New Utility
              </button>
            }
          />
        ) : (
          <div className="space-y-1">
            {filteredUtils.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setSelectedUtilId(u.id);
                  setSelectedWorkflowId(null);
                }}
                className={[
                  'w-full text-left px-3 py-2.5 rounded-lg transition-colors group',
                  selectedUtilId === u.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-slate-50 border border-transparent',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 text-emerald-500">{icons.file}</span>
                  <span className="text-sm font-medium text-slate-700 truncate flex-1">
                    {u.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteUtil(u.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 w-4 h-4 text-slate-400 hover:text-red-500 transition-all"
                  >
                    {icons.trash}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 ml-5.5 truncate">
                  {u.description}
                </p>
                <div className="flex items-center gap-1 mt-1 ml-5.5">
                  <Badge>{u.language}</Badge>
                  {u.associatedWorkflows.length > 0 && (
                    <Badge variant="success">
                      <span className="w-2.5 h-2.5">{icons.link}</span>
                      {u.associatedWorkflows.length}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar footer */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-1.5">
        {sidebarTab === 'workflows' ? (
          <button
            onClick={() => setShowPresetModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <span className="w-4 h-4">{icons.plus}</span>
            New Workflow
          </button>
        ) : (
          <button
            onClick={() => {
              setUtilFormData({ language: 'bash' });
              setShowCreateUtilModal(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <span className="w-4 h-4">{icons.plus}</span>
            New Utility
          </button>
        )}
        <button
          onClick={generateExport}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span className="w-4 h-4">{icons.export}</span>
          Export Bundle
        </button>
      </div>
    </div>
  );

  /* ─── Variable Editor ─── */

  const VariableEditor = ({ workflow }: { workflow: Workflow }) => (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-4 h-4 text-slate-500">{icons.settings}</span>
        <h3 className="text-sm font-semibold text-slate-700">Template Variables</h3>
      </div>
      {Object.entries(workflow.variables).map(([key, value]) => (
        <div key={key}>
          <label className="block text-xs font-medium text-slate-500 mb-1">{key}</label>
          {typeof value === 'boolean' ? (
            <Toggle
              checked={value}
              onChange={(v) => updateWorkflowVariable(workflow.id, key, v)}
              label={value ? 'Enabled' : 'Disabled'}
            />
          ) : (
            <input
              type="text"
              value={String(value ?? '')}
              onChange={(e) => updateWorkflowVariable(workflow.id, key, e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      ))}
    </div>
  );

  /* ─── Right Panel ─── */

  const RightPanel = () => {
    if (!selectedWorkflow) return null;

    const linkedUtils = utils.filter((u) => selectedWorkflow.utils.includes(u.id));

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Details</h3>
        </div>

        {/* Workflow info */}
        <div className="px-4 py-3 space-y-3 border-b border-slate-100">
          <div>
            <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
              Name
            </label>
            <input
              type="text"
              value={selectedWorkflow.name}
              onChange={(e) => updateWorkflow(selectedWorkflow.id, { name: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
              Preset
            </label>
            <Badge variant="info">
              <span className="w-2.5 h-2.5">{icons.template}</span>
              {presets.find((p) => p.id === selectedWorkflow.presetId)?.name ?? 'Custom'}
            </Badge>
          </div>
        </div>

        {/* Linked utils */}
        <div className="px-4 py-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Linked Utilities ({linkedUtils.length})
            </h4>
            <button
              onClick={() => setShowLinkUtilsModal(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage
            </button>
          </div>
          {linkedUtils.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No utilities linked. Click Manage to link some.
            </p>
          ) : (
            <div className="space-y-1.5">
              {linkedUtils.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="w-3.5 h-3.5 text-emerald-500">{icons.file}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.description}</p>
                  </div>
                  <button
                    onClick={() => toggleUtilLink(selectedWorkflow.id, u.id)}
                    className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {icons.x}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ─── Main Content ─── */

  const MainContent = () => {
    if (selectedUtil) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 text-emerald-500">{icons.file}</span>
              <h2 className="text-base font-semibold text-slate-800">{selectedUtil.name}</h2>
              <Badge>{selectedUtil.language}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setUtilFormData({
                    name: selectedUtil.name,
                    description: selectedUtil.description,
                    language: selectedUtil.language,
                    content: selectedUtil.content,
                  });
                  setShowEditUtilModal(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span className="w-3.5 h-3.5">{icons.edit}</span>
                Edit
              </button>
              <button
                onClick={() => deleteUtil(selectedUtil.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <span className="w-3.5 h-3.5">{icons.trash}</span>
                Delete
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <p className="text-sm text-slate-500 mb-4">{selectedUtil.description}</p>
            <CodeBlock code={selectedUtil.content} language={selectedUtil.language} icons={icons} />
            {selectedUtil.associatedWorkflows.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Used in workflows
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUtil.associatedWorkflows.map((wid) => {
                    const w = workflows.find((ww) => ww.id === wid);
                    return w ? (
                      <button
                        key={wid}
                        onClick={() => {
                          setSelectedWorkflowId(wid);
                          setSelectedUtilId(null);
                          setSidebarTab('workflows');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <span className="w-2.5 h-2.5">{icons.workflow}</span>
                        {w.name}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (!selectedWorkflow) {
      return (
        <div className="flex-1 flex items-center justify-center">
          {children || (
            <EmptyState
              icon={<span className="w-7 h-7">{icons.layers}</span>}
              title="Select or create a workflow"
              description="Choose an existing workflow from the sidebar or create a new one from a preset template"
              action={
                <button
                  onClick={() => setShowPresetModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="w-3.5 h-3.5">{icons.plus}</span>
                  New Workflow
                </button>
              }
            />
          )}
        </div>
      );
    }

    const compiledYaml = compileTemplate(selectedWorkflow.template, selectedWorkflow.variables);

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 text-blue-500">{icons.workflow}</span>
            <h2 className="text-base font-semibold text-slate-800">{selectedWorkflow.name}</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                navigator.clipboard.writeText(compiledYaml);
                showToast('YAML copied to clipboard');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="w-3.5 h-3.5">{icons.copy}</span>
              Copy
            </button>
            <button
              onClick={() => {
                const blob = new Blob([compiledYaml], { type: 'text/yaml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = selectedWorkflow.name.toLowerCase().replace(/\s+/g, '-') + '.yml';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Downloaded YAML file');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="w-3.5 h-3.5">{icons.download}</span>
              Download
            </button>
            <button
              onClick={() => deleteWorkflow(selectedWorkflow.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="w-3.5 h-3.5">{icons.trash}</span>
              Delete
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <TabBar
          tabs={[
            { id: 'editor', label: 'Template' },
            { id: 'preview', label: 'Preview' },
            { id: 'variables', label: 'Variables', count: Object.keys(selectedWorkflow.variables).length },
          ]}
          active={mainTab}
          onSelect={(id) => setMainTab(id as 'editor' | 'preview' | 'variables')}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {mainTab === 'editor' && (
            <div className="p-5">
              <textarea
                value={selectedWorkflow.template}
                onChange={(e) =>
                  updateWorkflow(selectedWorkflow.id, { template: e.target.value })
                }
                className="w-full h-[calc(100vh-280px)] min-h-[400px] px-4 py-3 rounded-lg border border-slate-200 text-sm font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                spellCheck={false}
              />
            </div>
          )}
          {mainTab === 'preview' && (
            <div className="p-5">
              <CodeBlock code={compiledYaml} language="yaml" icons={icons} maxHeight="calc(100vh - 280px)" />
            </div>
          )}
          {mainTab === 'variables' && selectedWorkflow && (
            <VariableEditor workflow={selectedWorkflow} />
          )}
        </div>
      </div>
    );
  };

  /* ─── Render ─── */

  return (
    <div
      className={['flex h-screen bg-slate-50/50 font-sans text-slate-700', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <MainContent />
      </div>

      {/* Right panel */}
      {selectedWorkflow && (
        <div className="w-64 flex-shrink-0 bg-white border-l border-slate-200">
          <RightPanel />
        </div>
      )}

      {/* ─── Modals ─── */}

      {/* Preset selection modal */}
      <Modal open={showPresetModal} onClose={() => setShowPresetModal(false)} title="Choose a Template" icons={icons} wide>
        <div className="grid grid-cols-1 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => createWorkflow(preset)}
              className="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <span className="w-5 h-5">{icons.template}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-slate-800">{preset.name}</h4>
                    <Badge variant="info">{preset.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{preset.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.keys(preset.variables).slice(0, 4).map((key) => (
                      <span
                        key={key}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono"
                      >
                        {key}
                      </span>
                    ))}
                    {Object.keys(preset.variables).length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                        +{Object.keys(preset.variables).length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                <span className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors mt-1">
                  {icons.chevronRight}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Create utility modal */}
      <Modal
        open={showCreateUtilModal}
        onClose={() => setShowCreateUtilModal(false)}
        title="Create Utility Script"
        icons={icons}
        wide
      >
        <UtilForm util={utilFormData} onChange={setUtilFormData} icons={icons} />
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowCreateUtilModal(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={createUtil}
            disabled={!utilFormData.name || !utilFormData.content}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </Modal>

      {/* Edit utility modal */}
      <Modal
        open={showEditUtilModal}
        onClose={() => setShowEditUtilModal(false)}
        title="Edit Utility Script"
        icons={icons}
        wide
      >
        <UtilForm util={utilFormData} onChange={setUtilFormData} icons={icons} />
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowEditUtilModal(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={updateUtil}
            disabled={!utilFormData.name}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Link utilities modal */}
      <Modal
        open={showLinkUtilsModal}
        onClose={() => setShowLinkUtilsModal(false)}
        title="Link Utilities"
        icons={icons}
      >
        {selectedWorkflow && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-3">
              Toggle which utilities are linked to <strong>{selectedWorkflow.name}</strong>.
            </p>
            {utils.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No utilities available. Create one first.
              </p>
            ) : (
              utils.map((u) => {
                const linked = selectedWorkflow.utils.includes(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggleUtilLink(selectedWorkflow.id, u.id)}
                    className={[
                      'w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors',
                      linked
                        ? 'border-blue-200 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'w-5 h-5 rounded flex items-center justify-center border',
                        linked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white',
                      ].join(' ')}
                    >
                      {linked && <span className="w-3 h-3">{icons.check}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{u.name}</p>
                      <p className="text-xs text-slate-400 truncate">{u.description}</p>
                    </div>
                    <Badge>{u.language}</Badge>
                  </button>
                );
              })
            )}
          </div>
        )}
      </Modal>

      {/* Export modal */}
      <Modal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Bundle (HATEOAS)"
        icons={icons}
        wide
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Full export with HATEOAS links for API integration. Copy or download the JSON below.
          </p>
          <CodeBlock code={exportData} language="json" icons={icons} maxHeight="400px" />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(exportData);
                showToast('Export JSON copied');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="w-3.5 h-3.5">{icons.copy}</span>
              Copy JSON
            </button>
            <button
              onClick={() => {
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'workflow-bundle.json';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Downloaded export file');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <span className="w-3.5 h-3.5">{icons.download}</span>
              Download
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} icons={icons} />}
    </div>
  );
}
