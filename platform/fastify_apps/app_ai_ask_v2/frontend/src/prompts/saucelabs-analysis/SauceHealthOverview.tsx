import { SauceIcon } from "@/shared/brand-icons";
import { MiniChart } from "@/shared/components";

const passRateByBrowser = [
  { browser: "Chrome 121", rate: 97, color: "#4285f4" },
  { browser: "Firefox 122", rate: 94, color: "#ff7139" },
  { browser: "Safari 17", rate: 88, color: "#006cff" },
  { browser: "Edge 121", rate: 96, color: "#0078d7" },
];

const deviceCoverage = [
  { label: "Real Devices", count: 24, pct: 45, color: "#10b981" },
  { label: "Emulators", count: 18, pct: 34, color: "#3b82f6" },
  { label: "Simulators", count: 11, pct: 21, color: "#8b5cf6" },
];

const frameworkUsage = [
  { name: "Playwright", tests: 312, pct: 38, color: "#2ead33" },
  { name: "Cypress", tests: 198, pct: 24, color: "#69d3a7" },
  { name: "Appium", tests: 156, pct: 19, color: "#662d91" },
  { name: "Selenium", tests: 94, pct: 11, color: "#43b02a" },
  { name: "Espresso", tests: 66, pct: 8, color: "#3ddc84" },
];

const flakyTests = [
  { name: "Checkout payment flow", suite: "E2E Smoke", flakeRate: "34%", runs: 50 },
  { name: "Image upload modal", suite: "Cross-Browser", flakeRate: "28%", runs: 32 },
  { name: "Push notification tap", suite: "iOS Regression", flakeRate: "22%", runs: 18 },
];

const recentFailures = [
  { name: "Safari WebSocket timeout", browser: "Safari 17", age: "2h ago" },
  { name: "Android GPS mock failure", device: "Pixel 8", age: "4h ago" },
  { name: "CSS grid layout shift", browser: "Firefox 122", age: "1d ago" },
];

const SauceHealthOverview = () => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Test Health</h3>
    </div>

    {/* Overall health score */}
    <div className="px-4 py-3 border-b border-slate-100">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <SauceIcon s={16} />
            <h4 className="text-xs font-bold text-slate-800">Overall Pass Rate</h4>
          </div>
          <span className="text-lg font-black text-emerald-600">93%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "93%" }} />
        </div>
        <p className="text-xs text-slate-400">826 total runs &middot; 768 passed &middot; 58 failed</p>
      </div>
    </div>

    {/* Quick metrics */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Key Metrics (30d)</h4>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Avg Duration", value: "1m 24s", trend: "-6%" },
          { label: "Flaky Tests", value: "7", trend: "+2" },
          { label: "Unique Configs", value: "53", trend: "" },
        ].map((m) => (
          <div key={m.label} className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-slate-800">{m.value}</p>
            <p className="text-xs text-slate-400">{m.label}</p>
            {m.trend && (
              <p className={`text-xs font-semibold ${m.trend.startsWith("-") ? "text-emerald-600" : m.trend.startsWith("+") ? "text-amber-600" : "text-slate-400"}`}>
                {m.trend}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Pass rate by browser */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Browser Pass Rates</h4>
      <div className="space-y-1.5">
        {passRateByBrowser.map((b) => (
          <div key={b.browser} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }} />
            <span className="text-xs text-slate-600 flex-1">{b.browser}</span>
            <div className="w-16 bg-slate-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${b.rate}%`, background: b.color }} />
            </div>
            <span className="text-xs text-slate-400 font-medium w-8 text-right">{b.rate}%</span>
          </div>
        ))}
      </div>
    </div>

    {/* Device coverage */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Mobile Coverage</h4>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-2">
        {deviceCoverage.map((d) => (
          <div key={d.label} style={{ width: `${d.pct}%`, background: d.color }} />
        ))}
      </div>
      <div className="space-y-1">
        {deviceCoverage.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-xs text-slate-600 flex-1">{d.label}</span>
            <span className="text-xs text-slate-400 font-medium">{d.count} ({d.pct}%)</span>
          </div>
        ))}
      </div>
    </div>

    {/* Test trend chart */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-1">Test Run Trend (30d)</h4>
      <p className="text-xs text-slate-400 mb-2">826 runs across 53 configurations</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <MiniChart />
      </div>
    </div>

    {/* Framework usage */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Framework Usage</h4>
      <div className="space-y-1">
        {frameworkUsage.map((f) => (
          <div key={f.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color }} />
            <span className="text-xs text-slate-600 flex-1">{f.name}</span>
            <span className="text-xs text-slate-400 font-medium">{f.tests} ({f.pct}%)</span>
          </div>
        ))}
      </div>
    </div>

    {/* Flaky tests */}
    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Top Flaky Tests</h4>
      <div className="space-y-1.5">
        {flakyTests.map((t) => (
          <div key={t.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-amber-50">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 font-medium truncate">{t.name}</p>
              <p className="text-xs text-slate-400">{t.suite} &middot; {t.runs} runs</p>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex-shrink-0">
              {t.flakeRate}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Recent failures */}
    <div className="px-4 py-3">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Failures</h4>
      <div className="space-y-1.5">
        {recentFailures.map((f) => (
          <div key={f.name} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 font-medium truncate">{f.name}</p>
              <p className="text-xs text-slate-400">{f.browser || f.device}</p>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{f.age}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { SauceHealthOverview };
