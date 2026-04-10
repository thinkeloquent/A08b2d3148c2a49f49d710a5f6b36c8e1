import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { RepoAgentScaffold } from '../src';
import type { Container, FileTypeConfig, StatItem } from '../src';

/* ------------------------------------------------------------------ */
/*  Sample data                                                        */
/* ------------------------------------------------------------------ */

const FILE_TYPES: Record<string, FileTypeConfig> = {
  prompt: { color: '#00d4ff', bg: 'rgba(0,212,255,0.12)', label: 'Prompt' },
  tool: { color: '#a3e635', bg: 'rgba(163,230,53,0.12)', label: 'Tool' },
  agent: { color: '#c084fc', bg: 'rgba(192,132,252,0.12)', label: 'Agent' },
  config: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Config' },
  schema: { color: '#fb7185', bg: 'rgba(251,113,133,0.12)', label: 'Schema' },
};

const CONTAINERS: Container[] = [
  {
    id: 'c1',
    name: 'core-agents',
    visibility: 'public',
    children: [
      {
        id: 'c1-1',
        name: 'assistants',
        visibility: 'team',
        children: [],
        files: [
          {
            id: 'f1',
            filename: 'code-reviewer.prompt.md',
            file_type: 'prompt',
            tags: ['review', 'code-quality', 'automation'],
            version: '2.1.0',
            frontmatter: {
              model: 'claude-3-opus',
              temperature: 0.3,
              max_tokens: 4096,
              system_role: 'Senior code reviewer',
            },
            content:
              'You are a senior code reviewer. Analyze the following code for:\n\n1. **Correctness** - Logic errors, edge cases\n2. **Performance** - Time/space complexity issues\n3. **Security** - Injection, auth bypass, data exposure\n4. **Style** - Naming, structure, readability\n\nProvide specific line references and suggested fixes.',
          },
          {
            id: 'f2',
            filename: 'doc-writer.prompt.md',
            file_type: 'prompt',
            tags: ['documentation', 'automation'],
            version: '1.4.0',
            frontmatter: {
              model: 'claude-3-sonnet',
              temperature: 0.5,
              max_tokens: 8192,
              system_role: 'Technical documentation writer',
            },
            content:
              'You are a technical documentation writer. Given source code and context, produce clear, structured documentation including:\n\n- Overview and purpose\n- API reference with type signatures\n- Usage examples\n- Edge cases and limitations',
          },
        ],
      },
      {
        id: 'c1-2',
        name: 'tools',
        visibility: 'public',
        children: [],
        files: [
          {
            id: 'f3',
            filename: 'github-search.tool.yaml',
            file_type: 'tool',
            tags: ['github', 'search', 'api'],
            version: '1.0.0',
            frontmatter: {
              name: 'github_code_search',
              description: 'Search GitHub repositories for code patterns',
              auth: 'github_token',
              rate_limit: '30/min',
            },
            content:
              'name: github_code_search\nparameters:\n  - name: query\n    type: string\n    required: true\n  - name: repo\n    type: string\n    required: false\n  - name: language\n    type: string\n    required: false\n  - name: max_results\n    type: integer\n    default: 10',
          },
          {
            id: 'f4',
            filename: 'shell-exec.tool.yaml',
            file_type: 'tool',
            tags: ['shell', 'execution', 'system'],
            version: '0.9.0',
            frontmatter: {
              name: 'shell_execute',
              description: 'Execute shell commands in sandboxed environment',
              auth: 'none',
              sandbox: true,
            },
            content:
              'name: shell_execute\nparameters:\n  - name: command\n    type: string\n    required: true\n  - name: timeout\n    type: integer\n    default: 30\n  - name: working_dir\n    type: string\n    required: false',
          },
        ],
      },
    ],
    files: [
      {
        id: 'f5',
        filename: 'orchestrator.agent.yaml',
        file_type: 'agent',
        tags: ['orchestration', 'multi-agent', 'core'],
        version: '3.0.0',
        frontmatter: {
          name: 'orchestrator',
          model: 'claude-3-opus',
          max_steps: 50,
          tools: ['github_code_search', 'shell_execute', 'file_read'],
          sub_agents: ['code-reviewer', 'doc-writer'],
        },
        content:
          'name: orchestrator\ntype: agent\nmodel: claude-3-opus\n\nbehavior:\n  planning: enabled\n  delegation: auto\n  fallback: retry_with_different_approach\n\ntools:\n  - github_code_search\n  - shell_execute\n  - file_read\n  - file_write\n\nsub_agents:\n  - code-reviewer\n  - doc-writer',
      },
    ],
  },
  {
    id: 'c2',
    name: 'project-configs',
    visibility: 'private',
    children: [],
    files: [
      {
        id: 'f6',
        filename: 'api-gateway.config.yaml',
        file_type: 'config',
        tags: ['gateway', 'routing', 'infrastructure'],
        version: '1.2.0',
        frontmatter: {
          service: 'api-gateway',
          port: 8080,
          cors_enabled: true,
          rate_limit: { window: '1m', max: 100 },
        },
        content:
          'service: api-gateway\nport: 8080\n\ncors:\n  enabled: true\n  origins:\n    - "https://app.example.com"\n    - "http://localhost:3000"\n\nrate_limit:\n  window: 1m\n  max: 100\n  key: ip\n\nroutes:\n  - path: /api/v1/*\n    upstream: backend-service\n  - path: /ws/*\n    upstream: websocket-service',
      },
      {
        id: 'f7',
        filename: 'task-graph.schema.json',
        file_type: 'schema',
        tags: ['validation', 'task-graph'],
        version: '2.0.0',
        frontmatter: {
          schema_version: 'draft-07',
          entity: 'TaskNode',
          description: 'Validates task graph node structure',
        },
        content:
          '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object",\n  "required": ["id", "type", "label"],\n  "properties": {\n    "id": { "type": "string", "format": "uuid" },\n    "type": { "type": "string", "enum": ["task", "milestone", "decision"] },\n    "label": { "type": "string", "minLength": 1 },\n    "dependencies": { "type": "array", "items": { "type": "string" } }\n  }\n}',
      },
    ],
  },
];

const STATS: StatItem[] = [
  { label: 'Total Files', value: 7, sub: 'Across 2 containers', accent: '#00d4ff' },
  { label: 'Agent Configs', value: 1, sub: 'Active orchestrators', accent: '#c084fc' },
  { label: 'Tools', value: 2, sub: 'Registered integrations', accent: '#a3e635' },
  { label: 'Schemas', value: 1, sub: 'Validation definitions', accent: '#fb7185' },
];

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

function App() {
  return (
    <RepoAgentScaffold
      containers={CONTAINERS}
      fileTypes={FILE_TYPES}
      stats={STATS}
      brandName="Agent Hub"
      brandSubtitle="Configuration Registry"
      title="Agent Hub"
      subtitle="Configuration Registry Dashboard"
      defaultOrg="mta-org"
      statusLabel="Registry Online"
      statusConnected={true}
      onFileSelect={(file) => {
        // eslint-disable-next-line no-console
        console.log('File selected:', file.filename, file.path);
      }}
      onCopyCommand={(cmd) => {
        // eslint-disable-next-line no-console
        console.log('Command copied:', cmd);
      }}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
