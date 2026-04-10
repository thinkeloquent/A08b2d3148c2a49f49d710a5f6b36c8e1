import { ConfluenceIcon } from "@/shared/brand-icons";
import { MiniChart } from "@/shared/components";

const freshnessBreakdown = [
  { label: "Fresh (< 30d)", count: 48, pct: 40, color: "#10b981" },
  { label: "Aging (30-90d)", count: 36, pct: 30, color: "#f59e0b" },
  { label: "Stale (90d-1y)", count: 24, pct: 20, color: "#f97316" },
  { label: "Outdated (> 1y)", count: 12, pct: 10, color: "#ef4444" },
];

const spaceStats = [
  { label: "Total Spaces", value: "14" },
  { label: "Total Pages", value: "120" },
  { label: "Avg Depth", value: "3.2" },
];

const commentActivity = [
  { label: "Inline Comments", count: 67, color: "#8b5cf6" },
  { label: "Page Comments", count: 43, color: "#3b82f6" },
  { label: "Mentions", count: 28, color: "#06b6d4" },
];

const topContributors = [
  { initials: "AR", name: "Alex Rivera", edits: 84, color: "#6366f1" },
  { initials: "SK", name: "Sasha Kim", edits: 62, color: "#8b5cf6" },
  { initials: "JL", name: "Jordan Lee", edits: 41, color: "#06b6d4" },
];

const orphanedPages = [
  { title: "Old API Reference", space: "ENG", age: "1y 2mo" },
  { title: "Q3 2024 Retro", space: "PROD", age: "9mo" },
  { title: "Draft: Migration Plan", space: "~alex", age: "6mo" },
  { title: "Unused Template", space: "ENG", age: "4mo" },
];

const ConfluenceHealthOverview = () => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Content Health</h3>
    </div>

    {/* Overall health score */}
    <div className="px-4 py-3 border-b border-slate-100">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ConfluenceIcon s={16} />
            <h4 className="text-xs font-bold text-slate-800">Content Health</h4>
          </div>
          <span className="text-lg font-black text-amber-600">B</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
          <div className="bg-amber-500 h-2 rounded-full" style={{ width: "72%" }} />
        </div>
        <p className="text-xs text-slate-400">72/100 — 30% of pages aging or stale</p>
      </div>
    </div>

    {/* Space stats */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Overview</h4>
      <div className="grid grid-cols-3 gap-2">
        {spaceStats.map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Content freshness */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Content Freshness</h4>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-2">
        {freshnessBreakdown.map((f) => (
          <div key={f.label} style={{ width: `${f.pct}%`, background: f.color }} />
        ))}
      </div>
      <div className="space-y-1">
        {freshnessBreakdown.map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color }} />
            <span className="text-xs text-slate-600 flex-1">{f.label}</span>
            <span className="text-xs text-slate-400 font-medium">{f.count} ({f.pct}%)</span>
          </div>
        ))}
      </div>
    </div>

    {/* Comment & mention activity */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Engagement (90d)</h4>
      <div className="space-y-1.5">
        {commentActivity.map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
            <span className="text-xs text-slate-600 flex-1">{c.label}</span>
            <span className="text-xs text-slate-400 font-medium">{c.count}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Activity chart */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-1">Edit Activity (90d)</h4>
      <p className="text-xs text-slate-400 mb-2">187 edits across 8 contributors</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <MiniChart />
      </div>
    </div>

    {/* Top contributors */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Top Contributors</h4>
      <div className="space-y-1.5">
        {topContributors.map((c) => (
          <div key={c.initials} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: c.color }}
            >
              {c.initials}
            </div>
            <span className="text-xs text-slate-700 font-medium flex-1">{c.name}</span>
            <span className="text-xs text-slate-400">{c.edits} edits</span>
          </div>
        ))}
      </div>
    </div>

    {/* Orphaned pages */}
    <div className="px-4 py-3">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Orphaned / Unlinked Pages</h4>
      <div className="space-y-1.5">
        {orphanedPages.map((p) => (
          <div key={p.title} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 font-medium truncate">{p.title}</p>
              <p className="text-xs text-slate-400">{p.space}</p>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{p.age}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { ConfluenceHealthOverview };
