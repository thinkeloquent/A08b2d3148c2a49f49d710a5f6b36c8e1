import { TemplateManagePresents } from '../src';
import type {
  TemplatePreset,
  Template,
  TemplateInstance,
  AuditEntry,
  NavItem,
  Module,
  TemplateVersion,
  PresetVariable,
} from '../src';

// ─── Inline SVG Icons ──────────────────────────────────────

const GridIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const DocIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CubeIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const LayersIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const ClockIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BrandIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const PuzzleIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 7.8c0 .3.1.6.3.9l1.6 1.5c.9.9.9 2.5 0 3.4l-1.6 1.6c-.2.2-.3.5-.3.8 0 .5-.3.9-.7 1.1a2.5 2.5 0 1 0-3.2 3.2c.2.5.6.9 1.1.7a1 1 0 0 1 .8.3" />
  </svg>
);

// ─── Sample Data ───────────────────────────────────────────

const MODULES: Module[] = [
  { id: 'm1', slug: 'auth-jwt', name: 'JWT Authentication', description: 'Fastify JWT plugin with RBAC middleware', category: 'auth', version: '2.1.0', status: 'published', owner: 'Security Team' },
  { id: 'm2', slug: 'db-postgres', name: 'PostgreSQL Setup', description: 'Connection pool, migrations, health probe', category: 'database', version: '1.5.0', status: 'published', owner: 'Platform Engineering' },
  { id: 'm3', slug: 'observability', name: 'Observability Stack', description: 'OpenTelemetry, Prometheus, structured logs', category: 'monitoring', version: '2.0.0', status: 'published', owner: 'SRE Team' },
  { id: 'm4', slug: 'ci-github', name: 'GitHub Actions CI', description: 'Lint, test, build, push Docker image', category: 'ci-cd', version: '1.2.0', status: 'published' },
  { id: 'm5', slug: 'docker', name: 'Docker Support', description: 'Multi-stage Dockerfile with distroless base', category: 'infra', version: '1.0.0', status: 'published' },
  { id: 'm6', slug: 'rate-limiter', name: 'Rate Limiter', description: 'Redis-backed request rate limiting', category: 'security', version: '1.3.0', status: 'published', owner: 'Security Team' },
  { id: 'm7', slug: 'chart-engine', name: 'Chart Engine', description: 'Interactive charting with D3 and Recharts', category: 'visualization', version: '3.0.0', status: 'published', dependencies: ['data-table'] },
  { id: 'm8', slug: 'data-table', name: 'Data Table', description: 'Sortable, filterable data grid component', category: 'ui', version: '2.5.0', status: 'published' },
  { id: 'm9', slug: 'graphql-layer', name: 'GraphQL Layer', description: 'Apollo Server with schema stitching', category: 'api', version: '1.2.0', status: 'draft' },
  { id: 'm10', slug: 'websocket-adapter', name: 'WebSocket Adapter', description: 'Real-time bidirectional communication', category: 'networking', version: '0.9.0', status: 'draft' },
  { id: 'm11', slug: 'auth-middleware', name: 'Auth Middleware', description: 'Express/Fastify auth middleware with token validation', category: 'security', version: '2.1.0', status: 'published', owner: 'Security Team' },
  { id: 'm12', slug: 'health-check', name: 'Health Check', description: 'Liveness and readiness endpoints', category: 'monitoring', version: '1.0.0', status: 'published' },
];

const PRESETS: TemplatePreset[] = [
  {
    id: 'p1',
    slug: 'rest-api-service',
    name: 'REST API Service',
    description: 'Production-ready REST API with authentication, rate limiting, and OpenAPI documentation. Includes health checks, structured logging, and graceful shutdown.',
    purpose: 'Rapidly scaffold a backend API service',
    audience: 'Backend engineers',
    category: 'Backend',
    version: '2.4.0',
    template: 'node-service',
    templateVersion: '3.1.0',
    owner: 'Platform Team',
    uses: 847,
    successRate: 99.2,
    setupTime: '~5 min',
    status: 'published',
    featured: true,
    tags: ['api', 'rest', 'node', 'production'],
    labels: [
      { id: 'l1', name: 'Production Ready', color: '#10b981' },
      { id: 'l2', name: 'Core', color: '#6366f1' },
    ],
    includedItems: ['Express/Fastify server', 'Auth middleware', 'Rate limiter', 'OpenAPI spec'],
    optionalAddons: ['GraphQL layer', 'WebSocket support', 'Queue consumer'],
    configFields: ['Service Name', 'Base Path', 'Auth Provider', 'Database URL'],
    modules: [
      { moduleId: 'm11', required: true, inherited: true },
      { moduleId: 'm6', required: true, inherited: true },
      { moduleId: 'm12', required: true, inherited: true },
      { moduleId: 'm9', required: false, inherited: false },
      { moduleId: 'm10', required: false, inherited: false },
    ],
    policies: [
      { name: 'Security Review', status: 'enforced' },
      { name: 'API Versioning', status: 'enforced' },
      { name: 'Load Testing', status: 'advisory' },
    ],
    references: [
      { type: 'link', appName: 'Order Service', usageContext: 'Primary API' },
      { type: 'link', appName: 'User Service', usageContext: 'Auth integration' },
      { type: 'content', appName: 'API Schema', filename: 'openapi.yaml', mimetype: 'application/yaml', content: 'openapi: 3.0.0\ninfo:\n  title: Order API\n  version: 1.0.0' },
    ],
    presetVariables: [
      { key: 'service_name', visibility: 'editable', label: 'Service Name', defaultValue: 'my-api', helpText: 'Lowercase kebab-case name for your service', sortOrder: 1 },
      { key: 'port', visibility: 'locked', lockedValue: '3000', helpText: 'Port is standardized for all internal services', sortOrder: 2 },
      { key: 'database_type', visibility: 'editable', defaultValue: 'postgres', helpText: 'Choose your primary database engine', sortOrder: 3 },
      { key: 'enable_auth', visibility: 'locked', lockedValue: 'true', helpText: 'Auth is required for all internal APIs', sortOrder: 4 },
      { key: 'log_level', visibility: 'hidden', defaultValue: 'info', sortOrder: 5 },
      { key: 'node_version', visibility: 'editable', defaultValue: '20', helpText: 'Select Node.js runtime version', sortOrder: 6 },
    ],
    versions: [
      { version: '2.4.0', date: '2026-03-20', author: 'Platform Team', changelog: 'Added rate limiter module as required', breaking: false, status: 'published' },
      { version: '2.3.0', date: '2026-02-15', author: 'Platform Team', changelog: 'Updated auth-middleware to v2.1.0', breaking: false, status: 'published' },
      { version: '2.0.0', date: '2026-01-10', author: 'Platform Team', changelog: 'Migrated to ESM-based node-service template v3.0.0', breaking: true, status: 'published' },
      { version: '1.0.0', date: '2025-10-01', author: 'Platform Team', changelog: 'Initial release', breaking: false, status: 'deprecated' },
    ],
  },
  {
    id: 'p2',
    slug: 'react-dashboard',
    name: 'React Dashboard',
    description: 'Full-featured dashboard with charting, data tables, filtering, and responsive layout. Built with Tailwind CSS and optimized for performance.',
    category: 'Frontend',
    version: '1.8.0',
    template: 'react-app',
    templateVersion: '2.0.0',
    owner: 'Frontend Team',
    uses: 523,
    successRate: 97.8,
    setupTime: '~8 min',
    status: 'published',
    featured: true,
    tags: ['react', 'dashboard', 'tailwind', 'charts'],
    labels: [
      { id: 'l3', name: 'Popular', color: '#f59e0b' },
    ],
    configFields: ['App Name', 'Theme', 'Chart Library'],
    modules: [
      { moduleId: 'm7', required: true, inherited: true },
      { moduleId: 'm8', required: true, inherited: true },
    ],
    policies: [
      { name: 'Accessibility', status: 'enforced' },
      { name: 'Performance Budget', status: 'advisory' },
    ],
  },
  {
    id: 'p3',
    slug: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'ETL pipeline with schema validation, retry logic, dead-letter queues, and monitoring dashboards. Supports batch and streaming modes.',
    category: 'Data',
    version: '1.2.0',
    template: 'python-pipeline',
    templateVersion: '1.5.0',
    uses: 234,
    successRate: 95.1,
    status: 'published',
    tags: ['etl', 'python', 'pipeline', 'batch'],
    configFields: ['Pipeline Name', 'Source Type', 'Destination'],
    policies: [
      { name: 'Data Governance', status: 'enforced' },
      { name: 'PII Scanning', status: 'enforced' },
    ],
  },
  {
    id: 'p4',
    slug: 'k8s-deployment',
    name: 'K8s Deployment Pack',
    description: 'Complete Kubernetes deployment configuration with Helm charts, HPA, PDB, and network policies. Includes staging and production variants.',
    category: 'Infrastructure',
    version: '3.0.0',
    template: 'k8s-manifest',
    templateVersion: '2.0.0',
    uses: 612,
    successRate: 98.5,
    status: 'published',
    tags: ['kubernetes', 'helm', 'devops', 'infrastructure'],
    configFields: ['Service Name', 'Replicas', 'CPU Limit', 'Memory Limit'],
    policies: [
      { name: 'Resource Limits', status: 'enforced' },
      { name: 'Network Isolation', status: 'enforced' },
      { name: 'Autoscaling', status: 'advisory' },
    ],
  },
  {
    id: 'p5',
    slug: 'graphql-gateway',
    name: 'GraphQL Gateway',
    description: 'Federated GraphQL gateway with schema stitching, caching, and subscription support.',
    category: 'Backend',
    version: '0.9.0',
    template: 'node-service',
    templateVersion: '3.1.0',
    uses: 89,
    status: 'draft',
    tags: ['graphql', 'federation', 'api'],
    configFields: ['Gateway Name', 'Subgraph URLs'],
    policies: [
      { name: 'Schema Review', status: 'enforced' },
    ],
  },
  {
    id: 'p6',
    slug: 'legacy-adapter',
    name: 'Legacy SOAP Adapter',
    description: 'Bridge adapter for connecting modern services to legacy SOAP endpoints with automatic WSDL parsing.',
    category: 'Backend',
    version: '1.0.0',
    template: 'node-service',
    templateVersion: '2.0.0',
    uses: 12,
    status: 'deprecated',
    tags: ['soap', 'legacy', 'adapter'],
    policies: [
      { name: 'Deprecation Notice', status: 'advisory' },
    ],
  },
];

const TEMPLATES: Template[] = [
  {
    id: 't1',
    slug: 'node-service',
    name: 'Node Service',
    description: 'Production-ready Node.js service template with Fastify, structured logging, health checks, graceful shutdown, and Docker support.',
    category: 'Backend',
    version: '3.1.0',
    type: 'dynamic',
    status: 'published',
    presetCount: 3,
    instanceCount: 142,
    owner: 'Platform Engineering',
    sourceRepo: 'https://github.com/acme-platform/node-service-template',
    tags: ['nodejs', 'fastify', 'microservice', 'docker'],
    tokens: [
      { name: 'service_name', type: 'text', required: true, description: 'Service name (kebab-case)', validation: '^[a-z][a-z0-9-]{2,40}$' },
      { name: 'port', type: 'number', required: true, description: 'Listening port', defaultValue: '3000', validation: '1024-65535' },
      { name: 'database_type', type: 'enum', required: true, description: 'Primary database engine', defaultValue: 'postgres', options: ['postgres', 'mysql', 'mongodb', 'none'] },
      { name: 'enable_auth', type: 'boolean', required: false, description: 'Include JWT auth plugin', defaultValue: 'true' },
      { name: 'log_level', type: 'enum', required: false, description: 'Default logging level', defaultValue: 'info', options: ['debug', 'info', 'warn', 'error'] },
      { name: 'node_version', type: 'enum', required: true, description: 'Node.js runtime version', defaultValue: '20', options: ['18', '20', '22'] },
    ],
    content: "const fastify = require('fastify')({ logger: true });\nconst { registerPlugins } = require('./plugins');\nconst { registerRoutes } = require('./routes');\n\nasync function start() {\n  // Service: {{{ service_name }}}\n  // Port: {{{ port }}}\n\n  await registerPlugins(fastify, {\n    database: '{{{ database_type }}}',\n    auth: {{{ enable_auth }}},\n    logLevel: '{{{ log_level }}}'\n  });\n\n  await registerRoutes(fastify);\n\n  try {\n    await fastify.listen({ port: {{{ port }}}, host: '0.0.0.0' });\n    console.log('{{{ service_name }}} on port {{{ port }}}');\n  } catch (err) {\n    fastify.log.error(err);\n    process.exit(1);\n  }\n}\n\nstart();",
    docs: '## Getting Started\n\nProduction-ready Fastify service with:\n\n- Structured JSON logging\n- Health check endpoint (/health)\n- Graceful shutdown handling\n- Docker multi-stage build\n- Optional JWT authentication\n- Optional database integration\n\n### Prerequisites\n\n- Node.js {{{ node_version }}}+\n- Docker\n\n### Quick Start\n\n  npm install\n  npm run dev\n\n### Configuration\n\nAll config via environment variables. See .env.example.',
    modules: [
      { moduleId: 'm1', required: false, enabled: true },
      { moduleId: 'm2', required: false, enabled: true },
      { moduleId: 'm3', required: true, enabled: true },
      { moduleId: 'm4', required: false, enabled: true },
      { moduleId: 'm5', required: true, enabled: true },
      { moduleId: 'm6', required: false, enabled: false },
    ],
    versions: [
      { version: '3.1.0', date: '2026-03-28', author: 'Sarah K.', changelog: 'Added OpenTelemetry auto-instrumentation', breaking: false, status: 'published' },
      { version: '3.0.0', date: '2026-02-10', author: 'Mike R.', changelog: 'Migrated to ESM modules, dropped CJS', breaking: true, status: 'published' },
      { version: '2.4.1', date: '2025-12-20', author: 'Sarah K.', changelog: 'Fixed health check timeout config', breaking: false, status: 'deprecated' },
      { version: '2.4.0', date: '2025-11-30', author: 'Platform Bot', changelog: 'Added graceful shutdown handler', breaking: false, status: 'deprecated' },
      { version: '2.3.0', date: '2025-10-15', author: 'Mike R.', changelog: 'Docker multi-stage build optimization', breaking: false, status: 'retired' },
    ],
  },
  {
    id: 't2',
    slug: 'react-app',
    name: 'React App',
    description: 'Modern React application template with Vite, Tailwind CSS, and TypeScript.',
    category: 'Frontend',
    version: '2.0.0',
    type: 'dynamic',
    status: 'published',
    presetCount: 1,
    owner: 'Frontend Team',
    tags: ['react', 'vite', 'tailwind', 'typescript'],
    tokens: [
      { name: 'app_name', type: 'text', required: true, description: 'Application name' },
      { name: 'theme', type: 'enum', defaultValue: 'default', options: ['default', 'dark', 'custom'] },
    ],
  },
  {
    id: 't3',
    slug: 'python-pipeline',
    name: 'Python Pipeline',
    description: 'ETL pipeline template with schema validation and retry logic.',
    category: 'Data',
    version: '1.5.0',
    type: 'dynamic',
    status: 'published',
    presetCount: 1,
    owner: 'Data Engineering',
    tags: ['python', 'etl', 'pipeline'],
    tokens: [
      { name: 'pipeline_name', type: 'text', required: true, description: 'Pipeline identifier' },
      { name: 'source_type', type: 'enum', required: true, description: 'Data source type', options: ['s3', 'kafka', 'database', 'api'] },
    ],
  },
  {
    id: 't4',
    slug: 'k8s-manifest',
    name: 'K8s Manifest',
    description: 'Kubernetes deployment configuration with Helm charts.',
    category: 'Infrastructure',
    version: '2.0.0',
    type: 'static',
    status: 'published',
    presetCount: 1,
    owner: 'Platform Engineering',
    tags: ['kubernetes', 'helm', 'devops'],
  },
  {
    id: 't5',
    slug: 'terraform-module',
    name: 'Terraform Module',
    description: 'Reusable Terraform module for cloud infrastructure provisioning.',
    category: 'Infrastructure',
    version: '0.5.0',
    type: 'static',
    status: 'draft',
    presetCount: 0,
    owner: 'Platform Engineering',
    tags: ['terraform', 'iac'],
  },
];

const INSTANCES: TemplateInstance[] = [
  {
    id: 'i1',
    name: 'order-service-v2',
    source: 'preset',
    sourceId: 'p1',
    sourceName: 'REST API Service',
    sourceVersion: '2.4.0',
    generatedBy: 'jdoe',
    generatedAt: '2026-04-05 14:30',
    status: 'success',
    modules: ['m11', 'm6', 'm12'],
    compiledContent: "const fastify = require('fastify')({ logger: true });\nconst { registerPlugins } = require('./plugins');\nconst { registerRoutes } = require('./routes');\n\nasync function start() {\n  // Service: order-service-v2\n  // Port: 3000\n\n  await registerPlugins(fastify, {\n    database: 'postgres',\n    auth: true,\n    logLevel: 'info'\n  });\n\n  await registerRoutes(fastify);\n\n  try {\n    await fastify.listen({ port: 3000, host: '0.0.0.0' });\n    console.log('order-service-v2 on port 3000');\n  } catch (err) {\n    fastify.log.error(err);\n    process.exit(1);\n  }\n}\n\nstart();",
  },
  { id: 'i2', name: 'analytics-dashboard', source: 'preset', sourceId: 'p2', sourceName: 'React Dashboard', sourceVersion: '1.8.0', generatedBy: 'asmith', generatedAt: '2026-04-04 09:15', status: 'success', modules: ['m7', 'm8'] },
  { id: 'i3', name: 'etl-customer-sync', source: 'preset', sourceId: 'p3', sourceName: 'Data Pipeline', sourceVersion: '1.2.0', generatedBy: 'mchen', generatedAt: '2026-04-03 16:45', status: 'success' },
  { id: 'i4', name: 'payment-api', source: 'preset', sourceId: 'p1', sourceName: 'REST API Service', sourceVersion: '2.4.0', generatedBy: 'jdoe', generatedAt: '2026-04-02 11:00', status: 'failed' },
  { id: 'i5', name: 'infra-staging', source: 'preset', sourceId: 'p4', sourceName: 'K8s Deployment Pack', sourceVersion: '3.0.0', generatedBy: 'klee', generatedAt: '2026-04-01 08:30', status: 'pending' },
];

const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', timestamp: '2026-04-05 14:30', action: 'Generated', entity: 'order-service-v2 from REST API Service', user: 'jdoe', details: 'Instance created successfully' },
  { id: 'a2', timestamp: '2026-04-05 10:15', action: 'Updated', entity: 'REST API Service preset v2.4.0', user: 'platform-bot', details: 'Rate limiter module updated' },
  { id: 'a3', timestamp: '2026-04-04 16:00', action: 'Approved', entity: 'React Dashboard v1.8.0', user: 'asmith' },
  { id: 'a4', timestamp: '2026-04-04 09:15', action: 'Generated', entity: 'analytics-dashboard from React Dashboard', user: 'asmith' },
  { id: 'a5', timestamp: '2026-04-03 16:45', action: 'Generated', entity: 'etl-customer-sync from Data Pipeline', user: 'mchen' },
  { id: 'a6', timestamp: '2026-04-03 11:00', action: 'Created', entity: 'GraphQL Gateway preset v0.9.0', user: 'jdoe' },
  { id: 'a7', timestamp: '2026-04-02 14:00', action: 'Deprecated', entity: 'Legacy SOAP Adapter v1.0.0', user: 'platform-bot' },
  { id: 'a8', timestamp: '2026-04-02 11:00', action: 'Generated', entity: 'payment-api from REST API Service (FAILED)', user: 'jdoe', details: 'Auth provider unreachable' },
  { id: 'a9', timestamp: '2026-04-01 08:30', action: 'Published', entity: 'K8s Deployment Pack v3.0.0', user: 'klee' },
];

const NAV_ITEMS: NavItem[] = [
  { id: 'catalog', label: 'Catalog', icon: GridIcon, section: 'discover' },
  { id: 'templates', label: 'Templates', icon: DocIcon, section: 'manage' },
  { id: 'presets', label: 'Presets', icon: CubeIcon, section: 'manage' },
  { id: 'modules', label: 'Modules', icon: PuzzleIcon, section: 'manage' },
  { id: 'instances', label: 'Instances', icon: LayersIcon, section: 'manage' },
  { id: 'audit', label: 'Audit Log', icon: ClockIcon, section: 'govern' },
];

const CATEGORY_COLORS: Record<string, string> = {
  backend: 'blue',
  frontend: 'purple',
  data: 'amber',
  infrastructure: 'green',
};

// ─── Example ───────────────────────────────────────────────

export default function ExampleDefault() {
  return (
    <TemplateManagePresents
      presets={PRESETS}
      templates={TEMPLATES}
      modules={MODULES}
      instances={INSTANCES}
      auditLog={AUDIT_LOG}
      categories={['Backend', 'Frontend', 'Data', 'Infrastructure']}
      navItems={NAV_ITEMS}
      categoryColors={CATEGORY_COLORS}
      basePath="/"
      title="Template Platform"
      brandIcon={BrandIcon}
      userAvatar="CM"
      onPresetSelect={(preset) => console.log('Selected preset:', preset.name)}
      onTemplateSave={(template) => console.log('Save template:', template.name, template)}
      onTemplateDelete={(template) => console.log('Delete template:', template.name)}
      onPresetSave={(preset) => console.log('Save preset:', preset.name, preset)}
      onPresetDelete={(preset) => console.log('Delete preset:', preset.name)}
      onPresetPublish={(preset, ver, log, brk) => console.log('Publish preset:', preset.name, ver, log, brk)}
      onInstanceDelete={(instance) => console.log('Delete instance:', instance.name)}
      onModuleSave={(module) => console.log('Save module:', module.name, module)}
      onModuleDelete={(module) => console.log('Delete module:', module.name)}
    />
  );
}
