import { GitHubIcon } from "@/shared/brand-icons";
import { MiniChart } from "@/shared/components";

const schemaStats = [
  { label: "Files Scanned", value: "12" },
  { label: "Total Fields", value: "247" },
  { label: "Avg Depth", value: "3.8" },
];

const issuesByType = [
  { type: "Type Anomaly", count: 8, pct: 32, color: "#ef4444" },
  { type: "Naming Inconsistency", count: 6, pct: 24, color: "#f59e0b" },
  { type: "Redundant Fields", count: 5, pct: 20, color: "#f97316" },
  { type: "Missing Required", count: 3, pct: 12, color: "#8b5cf6" },
  { type: "Stale / Unused", count: 3, pct: 12, color: "#94a3b8" },
];

const typeAnomalies = [
  { field: "user.is_active", expected: "boolean", actual: "string", file: "user.json" },
  { field: "order.total", expected: "number", actual: "string", file: "order.json" },
  { field: "event.timestamp", expected: "ISO 8601", actual: "Unix (int)", file: "event-payload.json" },
  { field: "product.tags", expected: "string[]", actual: "string (csv)", file: "product.json" },
];

const namingIssues = [
  { field: "user_metadata.createdAt", convention: "mixed case", suggestion: "created_at or createdAt" },
  { field: "order.OrderID", convention: "PascalCase key", suggestion: "order_id" },
  { field: "response.err_msg", convention: "abbreviation", suggestion: "error_message" },
];

const redundancies = [
  { fieldA: "user.email", fieldB: "user.contact_email", similarity: "98%", file: "user.json" },
  { fieldA: "order.created", fieldB: "order.created_at", similarity: "100%", file: "order.json" },
  { fieldA: "event.user_id", fieldB: "event.metadata.uid", similarity: "95%", file: "event-payload.json" },
];

const versionHistory = [
  { version: "v3 (current)", changes: "+2 fields, 1 type fix", date: "2d ago" },
  { version: "v2", changes: "Flattened addresses", date: "1w ago" },
  { version: "v1 (original)", changes: "Initial schema", date: "3w ago" },
];

const StructureHealthOverview = () => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Schema Health</h3>
    </div>

    {/* Overall health score */}
    <div className="px-4 py-3 border-b border-slate-100">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GitHubIcon s={16} />
            <h4 className="text-xs font-bold text-slate-800">Schema Quality</h4>
          </div>
          <span className="text-lg font-black text-amber-600">B-</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
          <div className="bg-amber-500 h-2 rounded-full" style={{ width: "68%" }} />
        </div>
        <p className="text-xs text-slate-400">68/100 &middot; 25 issues across 12 files</p>
      </div>
    </div>

    {/* Quick stats */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Overview</h4>
      <div className="grid grid-cols-3 gap-2">
        {schemaStats.map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Issue breakdown */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Issues by Type</h4>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-2">
        {issuesByType.map((i) => (
          <div key={i.type} style={{ width: `${i.pct}%`, background: i.color }} />
        ))}
      </div>
      <div className="space-y-1">
        {issuesByType.map((i) => (
          <div key={i.type} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i.color }} />
            <span className="text-xs text-slate-600 flex-1">{i.type}</span>
            <span className="text-xs text-slate-400 font-medium">{i.count} ({i.pct}%)</span>
          </div>
        ))}
      </div>
    </div>

    {/* Type anomalies */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Type Anomalies</h4>
      <div className="space-y-1.5">
        {typeAnomalies.map((a) => (
          <div key={a.field} className="bg-red-50 rounded-lg px-2.5 py-2">
            <p className="text-xs text-slate-700 font-mono font-medium truncate">{a.field}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-red-600 font-semibold">{a.actual}</span>
              <span className="text-xs text-slate-400">→</span>
              <span className="text-xs text-emerald-600 font-semibold">{a.expected}</span>
              <span className="text-xs text-slate-400 ml-auto">{a.file}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Schema change trend */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-1">Schema Changes (90d)</h4>
      <p className="text-xs text-slate-400 mb-2">42 field changes across 3 versions</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <MiniChart />
      </div>
    </div>

    {/* Naming issues */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Naming Issues</h4>
      <div className="space-y-1.5">
        {namingIssues.map((n) => (
          <div key={n.field} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-amber-50">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 font-mono font-medium truncate">{n.field}</p>
              <p className="text-xs text-slate-400">{n.convention} → {n.suggestion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Redundancies */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Redundant Fields</h4>
      <div className="space-y-1.5">
        {redundancies.map((r) => (
          <div key={r.fieldA} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-orange-50">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 font-mono truncate">{r.fieldA}</p>
              <p className="text-xs text-slate-400 font-mono truncate">≈ {r.fieldB}</p>
            </div>
            <span className="text-xs font-semibold text-orange-600 flex-shrink-0">{r.similarity}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Version history */}
    <div className="px-4 py-3">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Version History</h4>
      <div className="space-y-1.5">
        {versionHistory.map((v, i) => (
          <div key={v.version} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? "bg-teal-500" : "bg-slate-300"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 font-medium">{v.version}</p>
              <p className="text-xs text-slate-400">{v.changes}</p>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{v.date}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { StructureHealthOverview };
