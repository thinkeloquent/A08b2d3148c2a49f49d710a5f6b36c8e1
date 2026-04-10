import { createRoot } from 'react-dom/client';
import './styles.css';
import { AiopsUserPromptAuditor } from '../src';
import type { AuditLogEntry, MetricItem } from '../src';

/* ─── mock data generators ─── */
const USERS = [
  { id: 'u-001', name: 'Elena Voss', avatar: 'EV', role: 'Engineer' },
  { id: 'u-002', name: 'Marcus Chen', avatar: 'MC', role: 'Analyst' },
  { id: 'u-003', name: 'Priya Sharma', avatar: 'PS', role: 'PM' },
  { id: 'u-004', name: 'James Okafor', avatar: 'JO', role: 'Designer' },
  { id: 'u-005', name: 'Sofia Reyes', avatar: 'SR', role: 'DevOps' },
];

const MODELS = ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'gpt-4o', 'gemini-2.0-flash'];

const PROMPTS = [
  'Summarize the Q3 revenue report and highlight anomalies',
  'Generate a Python function to parse CSV files with error handling',
  'Draft a product requirements document for the new auth module',
  'Explain the trade-offs between REST and GraphQL for our use case',
  'Review this SQL query for performance bottlenecks',
  'Create unit tests for the payment processing service',
  'Analyze customer churn data and suggest retention strategies',
  'Write a migration script to move from MongoDB to PostgreSQL',
  'Generate API documentation for the /users endpoint',
  'Suggest improvements to our CI/CD pipeline configuration',
  'Compare serverless vs containerized deployment for our workload',
  'Draft an incident post-mortem template',
];

const STATUSES: AuditLogEntry['status'][] = ['success', 'warning', 'error', 'timeout'];
const STATUS_WEIGHTS = [0.72, 0.14, 0.08, 0.06];

function weightedRandom<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += weights[i];
    if (r < sum) return items[i];
  }
  return items[items.length - 1];
}

function randomDate(daysBack = 30) {
  return new Date(Date.now() - Math.random() * daysBack * 86400000);
}

function generateLogs(count = 80): AuditLogEntry[] {
  return Array.from({ length: count }, () => {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    const status = weightedRandom(STATUSES, STATUS_WEIGHTS);
    const tokens = Math.floor(Math.random() * 3800) + 200;
    const latency = status === 'timeout' ? 30000 + Math.random() * 10000 : Math.floor(Math.random() * 4500) + 120;
    const model = MODELS[Math.floor(Math.random() * MODELS.length)];
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    const created = randomDate();
    return {
      id: crypto.randomUUID(),
      session_id: `ses-${crypto.randomUUID().slice(0, 8)}`,
      user_id: user.id,
      user_name: user.name,
      user_avatar: user.avatar,
      user_role: user.role,
      prompt,
      response: status === 'error' ? null : `Response generated for: "${prompt.slice(0, 40)}..."`,
      model,
      status,
      tokens_used: status === 'error' ? 0 : tokens,
      latency_ms: Math.round(latency),
      raw_input_context: {
        model,
        temperature: +(Math.random() * 1.2).toFixed(2),
        max_tokens: [1024, 2048, 4096, 8192][Math.floor(Math.random() * 4)],
        system_prompt: 'You are a helpful enterprise assistant.',
        references:
          Math.random() > 0.5
            ? [`doc_${Math.floor(Math.random() * 999)}.pdf`, `sheet_${Math.floor(Math.random() * 99)}.xlsx`]
            : [],
        metadata: {
          source: ['web', 'api', 'slack-bot', 'vscode-ext'][Math.floor(Math.random() * 4)],
          region: ['us-east-1', 'eu-west-1', 'ap-south-1'][Math.floor(Math.random() * 3)],
          version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`,
        },
      },
      created_at: created.toISOString(),
      _ts: created.getTime(),
    };
  }).sort((a, b) => b._ts! - a._ts!);
}

const SAMPLE_LOGS = generateLogs(80);

function fmtMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

const total = SAMPLE_LOGS.length;
const success = SAMPLE_LOGS.filter((l) => l.status === 'success').length;
const avgTokens = Math.round(SAMPLE_LOGS.reduce((s, l) => s + l.tokens_used, 0) / total);
const avgLatency = Math.round(SAMPLE_LOGS.reduce((s, l) => s + l.latency_ms, 0) / total);
const errorRate = ((SAMPLE_LOGS.filter((l) => l.status === 'error' || l.status === 'timeout').length / total) * 100).toFixed(1);

const SAMPLE_METRICS: MetricItem[] = [
  { label: 'Total Logs', value: total.toLocaleString(), sub: 'last 30 days', icon: '\uD83D\uDCCB', trend: 12 },
  { label: 'Success Rate', value: `${((success / total) * 100).toFixed(1)}%`, sub: 'of requests', icon: '\u2705', trend: 3 },
  { label: 'Avg Tokens', value: avgTokens.toLocaleString(), sub: 'per request', icon: '\uD83D\uDD24', trend: -5 },
  { label: 'Avg Latency', value: fmtMs(avgLatency), sub: 'p50 response', icon: '\u26A1', trend: -8 },
  { label: 'Error Rate', value: `${errorRate}%`, sub: 'errors + timeouts', icon: '\u26A0\uFE0F', trend: 2 },
];

createRoot(document.getElementById('root')!).render(
  <AiopsUserPromptAuditor
    logs={SAMPLE_LOGS}
    metrics={SAMPLE_METRICS}
    syncStatus="Last sync 2 min ago"
    onLogSelect={(log) => console.log('Selected:', log?.id)}
  />,
);
