import { StatsigIcon } from "@/shared/brand-icons";
import { MiniChart } from "@/shared/components";

const metricImpact = [
  { metric: "checkout_conversion_rate", control: "3.2%", test: "4.1%", lift: "+28%", sig: true },
  { metric: "revenue_per_user", control: "$12.40", test: "$14.80", lift: "+19%", sig: true },
  { metric: "daily_active_users", control: "24.1k", test: "24.3k", lift: "+0.8%", sig: false },
];

const guardrailMetrics = [
  { metric: "app_crashes", status: "safe", value: "0.02%", delta: "-0.01%" },
  { metric: "page_load_time", status: "safe", value: "1.2s", delta: "+0.05s" },
  { metric: "error_rate", status: "warn", value: "0.8%", delta: "+0.3%" },
];

const guardrailColor: Record<string, string> = {
  safe: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

const allocationPreview = [
  { group: "Control", pct: 50, color: "#94a3b8" },
  { group: "Test", pct: 50, color: "#4ade80" },
];

const sdkSnippet = `const exp = statsig.getExperiment(
  user,
  "checkout_button_color"
);
const showBanner = exp.get(
  "show_banner",
  false
);`;

const StatsigCampaignPreview = () => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Campaign Preview</h3>
    </div>

    {/* Experiment status */}
    <div className="px-4 py-3 border-b border-slate-100">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatsigIcon s={16} />
            <h4 className="text-xs font-bold text-slate-800">Experiment Status</h4>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Draft</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { label: "Layer", value: "checkout_flow" },
            { label: "ID Type", value: "userID" },
            { label: "Targeting", value: "Everyone" },
            { label: "Groups", value: "2 variants" },
          ].map((item) => (
            <div key={item.label} className="text-left">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-xs text-slate-700 font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Traffic allocation */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Traffic Allocation</h4>
      <div className="flex w-full h-3 rounded-full overflow-hidden mb-2">
        {allocationPreview.map((g) => (
          <div key={g.group} style={{ width: `${g.pct}%`, background: g.color }} />
        ))}
      </div>
      <div className="space-y-1">
        {allocationPreview.map((g) => (
          <div key={g.group} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
            <span className="text-xs text-slate-600 flex-1">{g.group}</span>
            <span className="text-xs text-slate-400 font-medium">{g.pct}%</span>
          </div>
        ))}
      </div>
    </div>

    {/* Projected metric impact (Pulse preview) */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-1">Pulse Preview</h4>
      <p className="text-xs text-slate-400 mb-2">Projected metric impact based on similar tests</p>
      <div className="space-y-2">
        {metricImpact.map((m) => (
          <div key={m.metric} className="bg-slate-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-700 font-mono font-medium">{m.metric}</span>
              <span className={`text-xs font-bold ${m.sig ? "text-emerald-600" : "text-slate-400"}`}>
                {m.lift}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Control: {m.control}</span>
                  <span>Test: {m.test}</span>
                </div>
              </div>
              {m.sig ? (
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">sig</span>
              ) : (
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">n/s</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Guardrail metrics */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Guardrail Checks</h4>
      <div className="space-y-1.5">
        {guardrailMetrics.map((g) => (
          <div key={g.metric} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${guardrailColor[g.status]}`}>
              {g.status}
            </span>
            <span className="text-xs text-slate-700 font-mono flex-1 truncate">{g.metric}</span>
            <span className="text-xs text-slate-400">{g.delta}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Sample size chart */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-1">Sample Accumulation</h4>
      <p className="text-xs text-slate-400 mb-2">Est. 14d to reach statistical significance</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <MiniChart />
      </div>
    </div>

    {/* SDK snippet */}
    <div className="px-4 py-3">
      <h4 className="text-xs font-bold text-slate-700 mb-2">SDK Integration</h4>
      <div className="bg-slate-900 rounded-xl p-3 overflow-x-auto">
        <pre className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre">{sdkSnippet}</pre>
      </div>
    </div>
  </div>
);

export { StatsigCampaignPreview };
