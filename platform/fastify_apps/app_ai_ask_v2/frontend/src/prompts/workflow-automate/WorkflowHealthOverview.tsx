import { MiniChart } from "@/shared/components";

const executionBreakdown = [
  { status: "Success", count: 8420, pct: 92, color: "#10b981" },
  { status: "Retried", count: 410, pct: 4, color: "#f59e0b" },
  { status: "Failed", count: 245, pct: 3, color: "#ef4444" },
  { status: "Timeout", count: 92, pct: 1, color: "#f97316" },
];

const connectorHealth = [
  { name: "Jira", status: "healthy", latency: "120ms", uptime: "99.9%" },
  { name: "Slack", status: "healthy", latency: "85ms", uptime: "99.9%" },
  { name: "Salesforce", status: "degraded", latency: "890ms", uptime: "98.2%" },
  { name: "Zendesk", status: "healthy", latency: "210ms", uptime: "99.7%" },
  { name: "BigQuery", status: "healthy", latency: "340ms", uptime: "99.8%" },
];

const connectorStatusColor: Record<string, string> = {
  healthy: "bg-emerald-100 text-emerald-700",
  degraded: "bg-amber-100 text-amber-700",
  down: "bg-red-100 text-red-700",
};

const connectorDot: Record<string, string> = {
  healthy: "bg-emerald-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
};

const agentMetrics = [
  { name: "Support Auto-Reply", accuracy: "94%", avgTime: "1.8s", resolved: 2940 },
  { name: "AI Triage Agent", accuracy: "89%", avgTime: "2.4s", resolved: 238 },
  { name: "AI Scoring Agent", accuracy: "91%", avgTime: "0.9s", resolved: 4887 },
];

const recentErrors = [
  { workflow: "Campaign Sync", error: "BigQuery auth token expired", age: "15m ago" },
  { workflow: "Data Quality Monitor", error: "Anomaly agent timeout (30s limit)", age: "22m ago" },
  { workflow: "Lead Enrichment", error: "Clearbit rate limit (429)", age: "1h ago" },
  { workflow: "Incident Escalation", error: "Slack webhook 503", age: "3h ago" },
];

const WorkflowHealthOverview = () => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Workflow Health</h3>
    </div>

    {/* Overall health score */}
    <div className="px-4 py-3 border-b border-slate-100">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800">Execution Health</h4>
          </div>
          <span className="text-lg font-black text-emerald-600">92%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "92%" }} />
        </div>
        <p className="text-xs text-slate-400">9,167 executions &middot; 245 failures (7d)</p>
      </div>
    </div>

    {/* Quick metrics */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Key Metrics</h4>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Active Flows", value: "18" },
          { label: "Avg Latency", value: "1.4s" },
          { label: "Connectors", value: "12" },
        ].map((m) => (
          <div key={m.label} className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-slate-800">{m.value}</p>
            <p className="text-xs text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Execution breakdown */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Execution Results</h4>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-2">
        {executionBreakdown.map((e) => (
          <div key={e.status} style={{ width: `${e.pct}%`, background: e.color }} />
        ))}
      </div>
      <div className="space-y-1">
        {executionBreakdown.map((e) => (
          <div key={e.status} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
            <span className="text-xs text-slate-600 flex-1">{e.status}</span>
            <span className="text-xs text-slate-400 font-medium">{e.count.toLocaleString()} ({e.pct}%)</span>
          </div>
        ))}
      </div>
    </div>

    {/* Throughput chart */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-1">Throughput (7d)</h4>
      <p className="text-xs text-slate-400 mb-2">9,167 executions across 18 workflows</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <MiniChart />
      </div>
    </div>

    {/* Connector health */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Connector Health</h4>
      <div className="space-y-1.5">
        {connectorHealth.map((c) => (
          <div key={c.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${connectorDot[c.status]}`} />
            <span className="text-xs text-slate-700 font-medium flex-1">{c.name}</span>
            <span className="text-xs text-slate-400">{c.latency}</span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${connectorStatusColor[c.status]}`}>
              {c.uptime}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* AI Agent performance */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">AI Agent Performance</h4>
      <div className="space-y-1.5">
        {agentMetrics.map((a) => (
          <div key={a.name} className="bg-purple-50 rounded-lg px-2.5 py-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-slate-700 font-medium truncate">{a.name}</span>
              <span className="text-xs font-bold text-purple-700">{a.accuracy}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{a.avgTime} avg</span>
              <span className="text-xs text-slate-400">{a.resolved.toLocaleString()} resolved</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recent errors */}
    <div className="px-4 py-3">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Errors</h4>
      <div className="space-y-1.5">
        {recentErrors.map((e) => (
          <div key={e.error} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 font-medium truncate">{e.error}</p>
              <p className="text-xs text-slate-400">{e.workflow}</p>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{e.age}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { WorkflowHealthOverview };
