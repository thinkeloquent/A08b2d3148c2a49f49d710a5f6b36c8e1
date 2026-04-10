import { JiraIcon } from "@/shared/brand-icons";
import { MiniChart } from "@/shared/components";

const workflowStages = [
  { status: "To Do", count: 12, color: "#94a3b8" },
  { status: "In Progress", count: 8, color: "#3b82f6" },
  { status: "In Review", count: 5, color: "#8b5cf6" },
  { status: "Done", count: 34, color: "#10b981" },
];

const issueTypeBreakdown = [
  { type: "Story", count: 24, pct: 41, color: "#10b981" },
  { type: "Bug", count: 15, pct: 25, color: "#ef4444" },
  { type: "Task", count: 12, pct: 20, color: "#3b82f6" },
  { type: "Sub-task", count: 6, pct: 10, color: "#f59e0b" },
  { type: "Epic", count: 2, pct: 4, color: "#8b5cf6" },
];

const blockedIssues = [
  { key: "PLAT-142", summary: "Auth service migration", days: 5, assignee: "AR" },
  { key: "PLAT-156", summary: "DB schema update blocked by review", days: 3, assignee: "SK" },
  { key: "MOBILE-89", summary: "iOS build pipeline timeout", days: 2, assignee: "JL" },
];

const sprintMetrics = [
  { label: "Velocity", value: "34 pts", trend: "+12%" },
  { label: "Cycle Time", value: "3.2d", trend: "-8%" },
  { label: "Scope Change", value: "+3", trend: "neutral" },
];

const trendColor: Record<string, string> = {
  "+12%": "text-emerald-600",
  "-8%": "text-emerald-600",
  "neutral": "text-slate-400",
};

const JiraHealthOverview = () => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Project Health</h3>
    </div>

    {/* Sprint health score */}
    <div className="px-4 py-3 border-b border-slate-100">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <JiraIcon s={16} />
            <h4 className="text-xs font-bold text-slate-800">Sprint Health</h4>
          </div>
          <span className="text-lg font-black text-blue-600">A-</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }} />
        </div>
        <p className="text-xs text-slate-400">85/100 — On track for sprint goal</p>
      </div>
    </div>

    {/* Sprint metrics */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Sprint Metrics</h4>
      <div className="grid grid-cols-3 gap-2">
        {sprintMetrics.map((m) => (
          <div key={m.label} className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-slate-800">{m.value}</p>
            <p className="text-xs text-slate-400">{m.label}</p>
            <p className={`text-xs font-semibold ${trendColor[m.trend] || "text-slate-400"}`}>{m.trend}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Workflow distribution */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Workflow Distribution</h4>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-2">
        {workflowStages.map((s) => (
          <div key={s.status} style={{ width: `${(s.count / 59) * 100}%`, background: s.color }} />
        ))}
      </div>
      <div className="space-y-1">
        {workflowStages.map((s) => (
          <div key={s.status} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-slate-600 flex-1">{s.status}</span>
            <span className="text-xs text-slate-400 font-medium">{s.count}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Issue type breakdown */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Issue Types</h4>
      <div className="space-y-1">
        {issueTypeBreakdown.map((t) => (
          <div key={t.type} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
            <span className="text-xs text-slate-600 flex-1">{t.type}</span>
            <span className="text-xs text-slate-400 font-medium">{t.count} ({t.pct}%)</span>
          </div>
        ))}
      </div>
    </div>

    {/* Velocity chart */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-1">Velocity (last 6 sprints)</h4>
      <p className="text-xs text-slate-400 mb-2">Avg 31 pts/sprint</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <MiniChart />
      </div>
    </div>

    {/* Blocked issues */}
    <div className="px-4 py-3">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Blocked Issues</h4>
      <div className="space-y-1.5">
        {blockedIssues.map((issue) => (
          <div key={issue.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-red-50">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-red-400"
            >
              {issue.assignee}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 font-medium truncate">
                <span className="text-red-600 font-semibold">{issue.key}</span> {issue.summary}
              </p>
            </div>
            <span className="text-xs text-red-500 font-medium flex-shrink-0">{issue.days}d</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { JiraHealthOverview };
