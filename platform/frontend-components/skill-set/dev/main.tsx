import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SkillSet } from '../src';
import type { Skill, TagColors } from '../src';
import './styles.css';

const SKILLS: Skill[] = [
  {
    id: 1,
    name: 'run-pytest',
    ns: '@dev-tools',
    version: '2.4.1',
    desc: 'Automatically discovers and executes Python test suites using pytest with configurable markers, coverage reports, and parallel execution.',
    triggers: ['/test', '/pytest', 'run tests', 'check coverage'],
    sys: ['python>=3.9', 'pytest>=7.0'],
    tools: ['run_terminal_command', 'read_file'],
    tags: ['testing', 'python', 'automation'],
    dl: 12400,
    stars: 342,
    status: 'stable',
    updated: '2 days ago',
  },
  {
    id: 2,
    name: 'docker-compose-up',
    ns: '@infra',
    version: '1.8.0',
    desc: 'Manages Docker Compose stacks — validates configs, builds images, starts services, and streams logs with health-check awareness.',
    triggers: ['/docker', '/compose', 'start containers', 'spin up services'],
    sys: ['docker>=20.10', 'docker-compose>=2.0'],
    tools: ['run_terminal_command', 'read_file', 'list_directory'],
    tags: ['devops', 'containers', 'automation'],
    dl: 8900,
    stars: 256,
    status: 'stable',
    updated: '1 week ago',
  },
  {
    id: 3,
    name: 'eslint-fix',
    ns: '@dev-tools',
    version: '3.1.0-beta.2',
    desc: 'Runs ESLint with auto-fix on staged files or entire projects. Supports flat config, custom rule sets, and integrates with pre-commit hooks.',
    triggers: ['/lint', '/eslint', 'fix lint errors', 'check style'],
    sys: ['node>=18', 'eslint>=8.0'],
    tools: ['run_terminal_command', 'read_file', 'write_file'],
    tags: ['linting', 'javascript', 'code-quality'],
    dl: 15200,
    stars: 410,
    status: 'beta',
    updated: '3 days ago',
  },
  {
    id: 4,
    name: 'pg-migrate',
    ns: '@database',
    version: '1.2.3',
    desc: 'Generates and applies PostgreSQL schema migrations using diff detection. Supports rollbacks, dry-run mode, and seed data management.',
    triggers: ['/migrate', '/pg-migrate', 'run migration', 'schema diff'],
    sys: ['postgresql>=14', 'node>=18'],
    tools: ['run_terminal_command', 'read_file', 'write_file'],
    tags: ['database', 'migration', 'postgresql'],
    dl: 6300,
    stars: 189,
    status: 'stable',
    updated: '5 days ago',
  },
  {
    id: 5,
    name: 'k8s-deploy',
    ns: '@infra',
    version: '0.9.1-beta.1',
    desc: 'Deploys applications to Kubernetes clusters. Handles manifest generation, rolling updates, canary releases, and automatic rollback on failure.',
    triggers: ['/deploy', '/k8s', 'deploy to cluster', 'rollout'],
    sys: ['kubectl>=1.25', 'helm>=3.10'],
    tools: ['run_terminal_command', 'read_file', 'write_file', 'list_directory'],
    tags: ['devops', 'kubernetes', 'deployment'],
    dl: 4100,
    stars: 134,
    status: 'beta',
    updated: '1 day ago',
  },
  {
    id: 6,
    name: 'openapi-gen',
    ns: '@api-tools',
    version: '2.0.0',
    desc: 'Generates OpenAPI 3.1 specs from code annotations, route definitions, or existing APIs. Outputs JSON/YAML with validation and diff previews.',
    triggers: ['/openapi', '/swagger', 'generate api spec', 'api docs'],
    sys: ['node>=18'],
    tools: ['read_file', 'write_file', 'list_directory'],
    tags: ['api', 'documentation', 'code-gen'],
    dl: 7800,
    stars: 223,
    status: 'stable',
    updated: '4 days ago',
  },
];

const TAG_MAP: Record<string, TagColors> = {
  testing:        { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  python:         { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  automation:     { bg: '#E0E7FF', color: '#3730A3', border: '#C7D2FE' },
  devops:         { bg: '#FCE7F3', color: '#9D174D', border: '#FBCFE8' },
  containers:     { bg: '#CFFAFE', color: '#155E75', border: '#A5F3FC' },
  linting:        { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  javascript:     { bg: '#FEF9C3', color: '#854D0E', border: '#FEF08A' },
  'code-quality': { bg: '#F3E8FF', color: '#6B21A8', border: '#E9D5FF' },
  database:       { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  migration:      { bg: '#E0F2FE', color: '#075985', border: '#BAE6FD' },
  postgresql:     { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  kubernetes:     { bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
  deployment:     { bg: '#FFE4E6', color: '#9F1239', border: '#FECDD3' },
  api:            { bg: '#CCFBF1', color: '#115E59', border: '#99F6E4' },
  documentation:  { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  'code-gen':     { bg: '#FFF7ED', color: '#9A3412', border: '#FED7AA' },
};

function App() {
  const [installed, setInstalled] = useState<Set<string | number>>(new Set([2]));

  const handleToggle = (id: string | number) => {
    setInstalled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <SkillSet
      skills={SKILLS}
      tagColors={TAG_MAP}
      installedIds={installed}
      onInstallToggle={handleToggle}
      brand={{
        logoMark: 'S',
        title: 'SkillSet',
        subtitle: 'Agent Skill Registry',
      }}
      user={{
        initials: 'JD',
        name: 'Jane Developer',
        plan: 'Pro Plan',
      }}
      overviewStats={[
        { label: 'Total Skills', val: SKILLS.length },
        { label: 'Installed', val: installed.size },
        { label: 'Updates', val: 0 },
      ]}
    />
  );
}

createRoot(document.getElementById('root')!).render(<App />);
