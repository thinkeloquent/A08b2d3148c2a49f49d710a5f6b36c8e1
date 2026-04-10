import { useState } from "react";
import { Icon } from "@/shared/icons";
import { StatusBadge } from "@/shared/components";

const SaucePanel = () => {
  const [browser, setBrowser] = useState("Chrome");
  const [platform, setPlatform] = useState("Windows 11");
  const [suite, setSuite] = useState("smoke");
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState<string[]>([]);
  const suites = [
    { id: "smoke", label: "Smoke Tests", count: 12 },
    { id: "regression", label: "Regression Suite", count: 87 },
    { id: "e2e", label: "Full E2E", count: 204 },
    { id: "component", label: "Component Tests", count: 55 },
  ];
  const run = () => {
    setStatus("running"); setLog([]);
    const lines = [`🚀 Starting ${suites.find((s) => s.id === suite)?.label}...`, `🖥  ${platform} / ${browser}`, "⚙️  Spinning up tunnel...", "✅ Tunnel established", "▶️  Executing test cases..."];
    lines.forEach((l, i) => setTimeout(() => setLog((p) => [...p, l]), i * 650));
    setTimeout(() => setStatus(Math.random() > 0.25 ? "passed" : "failed"), lines.length * 650 + 500);
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {([["Browser", browser, setBrowser, ["Chrome", "Firefox", "Safari", "Edge"]], ["Platform", platform, setPlatform, ["Windows 11", "macOS Ventura", "macOS Monterey", "Linux"]]] as const).map(([label, val, set, opts]) => (
          <div key={label}>
            <label className="text-xs text-slate-500 font-medium mb-1 block">{label}</label>
            <select value={val} onChange={(e) => (set as (v: string) => void)(e.target.value)} className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all">
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium mb-2 block">Test Suite</label>
        <div className="grid grid-cols-2 gap-1.5">
          {suites.map((s) => (
            <button key={s.id} onClick={() => setSuite(s.id)} className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${suite === s.id ? "bg-red-50 border-red-300 text-red-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-red-200"}`}>
              <p className="font-semibold">{s.label}</p>
              <p className={`text-xs ${suite === s.id ? "text-red-400" : "text-slate-400"}`}>{s.count} tests</p>
            </button>
          ))}
        </div>
      </div>
      <button onClick={run} disabled={status === "running"} className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${status === "running" ? "bg-slate-100 text-slate-400 cursor-wait" : "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200"}`}>
        {status === "running" ? <>{Icon.loader} Running Tests...</> : <>{Icon.play} Run Tests</>}
      </button>
      {log.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-3 space-y-1 max-h-28 overflow-y-auto">
          {log.map((l, i) => <p key={i} className="text-xs text-emerald-400 font-mono leading-relaxed">{l}</p>)}
          {status !== "running" && (
            <p className={`text-xs font-mono font-bold mt-1 ${status === "passed" ? "text-emerald-300" : "text-red-400"}`}>
              {status === "passed" ? "✅ All tests passed!" : "❌ Some tests failed."}
            </p>
          )}
        </div>
      )}
      {status !== "idle" && status !== "running" && (
        <div className="flex items-center justify-between">
          <StatusBadge status={status} />
          <button onClick={() => { setStatus("idle"); setLog([]); }} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Clear</button>
        </div>
      )}
    </div>
  );
};

export { SaucePanel };
