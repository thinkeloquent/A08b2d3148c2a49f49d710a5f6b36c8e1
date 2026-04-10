import { GitHubIcon } from "@/shared/brand-icons";
import { MiniChart } from "@/shared/components";

const langBreakdown = [
  { lang: "TypeScript", pct: 62, color: "#3178c6" },
  { lang: "Python", pct: 18, color: "#3572a5" },
  { lang: "Go", pct: 12, color: "#00add8" },
  { lang: "Shell", pct: 5, color: "#89e051" },
  { lang: "Other", pct: 3, color: "#94a3b8" },
];

const vulnerabilities = [
  { name: "lodash < 4.17.21", severity: "critical", pkg: "npm" },
  { name: "axios < 1.6.0", severity: "high", pkg: "npm" },
  { name: "certifi < 2023.7.22", severity: "medium", pkg: "pip" },
];

const topContributors = [
  { initials: "AR", name: "Alex Rivera", commits: 342, color: "#6366f1" },
  { initials: "SK", name: "Sasha Kim", commits: 218, color: "#8b5cf6" },
  { initials: "JL", name: "Jordan Lee", commits: 156, color: "#06b6d4" },
];

const sevColor: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-600",
};

const RepoHealthOverview = () => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Repo Health</h3>
    </div>

    {/* Health score */}
    <div className="px-4 py-3 border-b border-slate-100">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GitHubIcon s={16} />
            <h4 className="text-xs font-bold text-slate-800">Overall Health Score</h4>
          </div>
          <span className="text-lg font-black text-emerald-600">B+</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "78%" }} />
        </div>
        <p className="text-xs text-slate-400">78/100 — 3 issues need attention</p>
      </div>
    </div>

    {/* Security & Vulnerabilities */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Security Alerts</h4>
      <div className="space-y-1.5">
        {vulnerabilities.map((v) => (
          <div key={v.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${sevColor[v.severity]}`}>
              {v.severity}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 font-medium truncate">{v.name}</p>
            </div>
            <span className="text-xs text-slate-400">{v.pkg}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Language breakdown */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Language Breakdown</h4>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-2">
        {langBreakdown.map((l) => (
          <div key={l.lang} style={{ width: `${l.pct}%`, background: l.color }} />
        ))}
      </div>
      <div className="space-y-1">
        {langBreakdown.map((l) => (
          <div key={l.lang} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
            <span className="text-xs text-slate-600 flex-1">{l.lang}</span>
            <span className="text-xs text-slate-400 font-medium">{l.pct}%</span>
          </div>
        ))}
      </div>
    </div>

    {/* Commit activity */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-1">Commit Activity (90d)</h4>
      <p className="text-xs text-slate-400 mb-2">487 commits across 12 contributors</p>
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
            <span className="text-xs text-slate-400">{c.commits} commits</span>
          </div>
        ))}
      </div>
    </div>

    {/* Stale files */}
    <div className="px-4 py-3">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Oldest Untouched Files</h4>
      <div className="space-y-1.5">
        {[
          { path: "src/legacy/auth.js", age: "2y 4mo" },
          { path: "scripts/migrate-v1.sh", age: "1y 11mo" },
          { path: "config/deprecated.json", age: "1y 8mo" },
          { path: "src/utils/compat.ts", age: "1y 2mo" },
        ].map((f) => (
          <div key={f.path} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-xs text-slate-600 font-mono truncate flex-1">{f.path}</span>
            <span className="text-xs text-slate-400 flex-shrink-0">{f.age}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { RepoHealthOverview };
