import { createRoot } from 'react-dom/client';
import './styles.css';
import { AgentChecklist } from '../src';
import type { AgentChecklistPhase } from '../src';

const SAMPLE_PHASES: AgentChecklistPhase[] = [
  {
    id: 'phase-1',
    title: 'Sensitive Data Property Name Refactoring',
    tasks: [
      { id: 't1', label: 'Create Javascript Package', code: 'packages_mjs/sensitive_data_property_name', checked: true },
      { id: 't2', label: 'Create Python Package', code: 'packages_py/sensitive_data_property_name', checked: true },
      { id: 't3', label: 'Refactor', code: 'db_connection_elasticsearch', tag: '(JS/Py)', checked: true },
      { id: 't4', label: 'Refactor', code: 'db_connection_redis', tag: '(JS/Py)', checked: true },
      { id: 't5', label: 'Refactor', code: 'db_connection_postgres', tag: '(Py)', checked: true },
      { id: 't6', label: 'Refactor', code: 'fetch-client', tag: '(JS/Py)', checked: true },
      {
        id: 't7',
        label: 'Verify changes with tests',
        checked: false,
        subtasks: [
          { id: 'st1', label: 'JS', code: 'sensitive-data-property-name', tag: 'tests', checked: true },
          { id: 'st2', label: 'Py', code: 'sensitive-data-property-name', tag: 'tests', checked: true },
          { id: 'st3', label: 'JS', code: 'fetch-client', tag: 'tests', checked: false },
          { id: 'st4', label: 'Py', code: 'fetch-client', tag: 'tests', checked: false },
        ],
      },
    ],
  },
  {
    id: 'phase-2',
    title: 'Phase 2: Provider API Getters & Broader Scan',
    tasks: [
      {
        id: 't8',
        label: 'Refactor',
        code: 'provider_api_getters',
        tag: 'package',
        checked: false,
        subtasks: [
          { id: 'st5', label: 'Remove default username in', code: 'redis_health_check.mjs', checked: true },
          { id: 'st6', label: 'Remove default username in', code: 'postgres_health_check.mjs', checked: true },
          { id: 'st7', label: 'Refactor', code: 'saucelabs.mjs', tag: 'to usage of sensitive-data-property-name', checked: true },
          { id: 'st8', label: 'Redact default values in', code: 'elasticsearch.mjs', checked: false },
          { id: 'st9', label: 'Rename', code: 'clientSecretVar', tag: 'in akamai.mjs', checked: false },
          { id: 'st10', label: 'Apply getters in', code: 'postgres_health_check.mjs', tag: '(User Request)', tagVariant: 'user', checked: true },
        ],
      },
      {
        id: 't9',
        label: 'Broader Codebase Scan',
        checked: false,
        subtasks: [
          { id: 'st16', label: 'Scan packages_mjs', checked: true },
          { id: 'st17', label: 'Scan packages_py', checked: true },
          { id: 'st18', label: 'Scan fastapi_apps', checked: false },
          { id: 'st19', label: 'Scan fastify_apps', checked: false },
        ],
      },
    ],
  },
];

createRoot(document.getElementById('root')!).render(
  <AgentChecklist
    defaultPhases={SAMPLE_PHASES}
    title="Security Refactoring Checklist"
    titleIcon={<span>&#128274;</span>}
    description="Track progress on sensitive data property name refactoring and API getter updates"
    onChange={(phases) => console.log('Phases updated:', phases)}
  />,
);
