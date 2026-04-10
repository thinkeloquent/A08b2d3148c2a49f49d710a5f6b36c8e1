import { MiniChart } from "@/shared/components";

const executionBreakdown = [
  { status: "Completed", count: 16200, pct: 88, color: "#10b981" },
  { status: "HITL Pending", count: 1100, pct: 6, color: "#f59e0b" },
  { status: "Failed", count: 740, pct: 4, color: "#ef4444" },
  { status: "Timeout", count: 370, pct: 2, color: "#f97316" },
];

const platformUsage = [
  { name: "LangFlow", flows: 8, pct: 30, color: "#8b5cf6" },
  { name: "Flowise", flows: 6, pct: 23, color: "#06b6d4" },
  { name: "Dify", flows: 5, pct: 19, color: "#3b82f6" },
  { name: "CrewAI Studio", flows: 4, pct: 15, color: "#10b981" },
  { name: "n8n + AI", flows: 3, pct: 13, color: "#f59e0b" },
];

const llmUsage = [
  { model: "Claude 3.5 Sonnet", tokens: "2.4M", cost: "$18.20", pct: 42 },
  { model: "GPT-4o", tokens: "1.8M", cost: "$14.40", pct: 32 },
  { model: "GPT-4o-mini", tokens: "1.2M", cost: "$2.10", pct: 21 },
  { model: "Llama 3.1 70B", tokens: "320K", cost: "$0.00", pct: 5 },
];

const hitlMetrics = [
  { label: "Avg Response Time", value: "4.2m" },
  { label: "Approval Rate", value: "91%" },
  { label: "Escalation Rate", value: "9%" },
];

const citizenDevs = [
  { initials: "MJ", name: "Maria J.", flows: 6, role: "Product Ops", color: "#8b5cf6" },
  { initials: "TC", name: "Tyler C.", flows: 4, role: "Marketing", color: "#06b6d4" },
  { initials: "NP", name: "Nina P.", flows: 3, role: "Support Lead", color: "#f59e0b" },
];

const recentIssues = [
  { flow: "Anomaly Alert Pipeline", issue: "LLM hallucination in severity classification", age: "2h ago" },
  { flow: "Document Summarizer", issue: "Human review queue backlog (18 pending)", age: "4h ago" },
  { flow: "Meeting Action Items", issue: "Jira API rate limit during bulk create", age: "6h ago" },
  { flow: "Ticket Triage Agent", issue: "Router node fallback loop detected", age: "1d ago" },
];

const BuilderHealthOverview = () => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Builder Health</h3>
    </div>

    {/* Overall health score */}
    <div className="px-4 py-3 border-b border-slate-100">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-800">Agent Success Rate</h4>
          <span className="text-lg font-black text-emerald-600">88%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "88%" }} />
        </div>
        <p className="text-xs text-slate-400">18,410 executions &middot; 26 active flows (7d)</p>
      </div>
    </div>

    {/* Key metrics */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Key Metrics</h4>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Flows", value: "26" },
          { label: "Avg Nodes", value: "4.8" },
          { label: "Builders", value: "13" },
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
      <h4 className="text-xs font-bold text-slate-700 mb-1">Execution Trend (7d)</h4>
      <p className="text-xs text-slate-400 mb-2">18,410 total across all platforms</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <MiniChart />
      </div>
    </div>

    {/* Human-in-the-loop */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Human-in-the-Loop</h4>
      <div className="grid grid-cols-3 gap-2">
        {hitlMetrics.map((m) => (
          <div key={m.label} className="bg-amber-50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-amber-800">{m.value}</p>
            <p className="text-xs text-amber-600">{m.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* LLM token usage */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">LLM Usage & Cost</h4>
      <div className="space-y-1.5">
        {llmUsage.map((l) => (
          <div key={l.model} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50">
            <span className="text-xs text-slate-700 font-medium flex-1 truncate">{l.model}</span>
            <span className="text-xs text-slate-400">{l.tokens}</span>
            <span className="text-xs font-semibold text-slate-600">{l.cost}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Platform usage */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Platform Usage</h4>
      <div className="space-y-1">
        {platformUsage.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-xs text-slate-600 flex-1">{p.name}</span>
            <span className="text-xs text-slate-400 font-medium">{p.flows} flows ({p.pct}%)</span>
          </div>
        ))}
      </div>
    </div>

    {/* Citizen developers */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Top Builders</h4>
      <div className="space-y-1.5">
        {citizenDevs.map((c) => (
          <div key={c.initials} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: c.color }}
            >
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-slate-700 font-medium">{c.name}</span>
              <span className="text-xs text-slate-400 ml-1">{c.role}</span>
            </div>
            <span className="text-xs text-slate-400">{c.flows} flows</span>
          </div>
        ))}
      </div>
    </div>

    {/* Recent issues */}
    <div className="px-4 py-3">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Issues</h4>
      <div className="space-y-1.5">
        {recentIssues.map((e) => (
          <div key={e.issue} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 font-medium truncate">{e.issue}</p>
              <p className="text-xs text-slate-400">{e.flow}</p>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{e.age}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { BuilderHealthOverview };
