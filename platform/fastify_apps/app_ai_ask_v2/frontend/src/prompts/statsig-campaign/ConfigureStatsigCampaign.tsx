import { useState, useRef, useEffect } from "react";
import { Icon } from "@/shared/icons";
import { StatsigIcon } from "@/shared/brand-icons";
import { Tag } from "@/shared/components";

const layerOptions = ["None", "checkout_flow", "notifications", "onboarding", "pricing"];
const idTypeOptions = ["userID", "companyID", "sessionID", "deviceID"];
const targetingOptions = ["Everyone", "Country", "Device Type", "OS", "App Version", "Custom Gate"];
const primaryMetricOptions = [
"checkout_conversion_rate",
"daily_active_users",
"revenue_per_user",
"signup_completion",
"session_duration",
"feature_adoption"];

const secondaryMetricOptions = [
"app_crashes",
"page_load_time",
"error_rate",
"bounce_rate",
"api_latency_p99",
"customer_support_tickets"];


interface GroupConfig {
  name: string;
  allocation: number;
  params: string;
}

const ConfigureStatsigCampaign = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [layer, setLayer] = useState("None");
  const [layerOpen, setLayerOpen] = useState(false);
  const [idType, setIdType] = useState("userID");
  const [idTypeOpen, setIdTypeOpen] = useState(false);
  const [targeting, setTargeting] = useState("Everyone");
  const [targetingOpen, setTargetingOpen] = useState(false);
  const [primaryMetrics, setPrimaryMetrics] = useState<string[]>(["checkout_conversion_rate"]);
  const [pmOpen, setPmOpen] = useState(false);
  const [secondaryMetrics, setSecondaryMetrics] = useState<string[]>(["app_crashes"]);
  const [smOpen, setSmOpen] = useState(false);
  const [groups, setGroups] = useState<GroupConfig[]>([
  { name: "Control", allocation: 50, params: '{"show_banner": false}' },
  { name: "Test", allocation: 50, params: '{"show_banner": true}' }]
  );
  const [submitted, setSubmitted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setLayerOpen(false);
        setIdTypeOpen(false);
        setTargetingOpen(false);
        setPmOpen(false);
        setSmOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const closeAll = () => {
    setLayerOpen(false);
    setIdTypeOpen(false);
    setTargetingOpen(false);
    setPmOpen(false);
    setSmOpen(false);
  };

  const toggleMetric = (list: string[], setter: (v: string[]) => void, val: string) => {
    setter(list.includes(val) ? list.filter((m) => m !== val) : [...list, val]);
  };

  const updateGroup = (idx: number, field: keyof GroupConfig, value: string | number) => {
    setGroups((prev) => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  const addGroup = () => {
    const num = groups.length + 1;
    setGroups((prev) => [...prev, { name: `Variant ${num - 1}`, allocation: 0, params: "{}" }]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5" ref={dropRef}>
      {/* Header */}
      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
        <StatsigIcon s={18} data-test-id="statsigicon-f7100388" />
        Create Experiment
      </h3>

      {/* Section 1: Basic Setup */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Basic Setup</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-slate-500 font-semibold mb-1 block">Experiment Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="e.g. Checkout Button Color Test" />

          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500 font-semibold mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              placeholder="Summarize the purpose of this experiment..." />

          </div>
          {/* Layer */}
          <div className="relative">
            <label className="text-xs text-slate-500 font-semibold mb-1 block">Layer (optional)</label>
            <button
              onClick={() => {closeAll();setLayerOpen(!layerOpen);}}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

              <span>{layer}</span>
              <span className={`text-slate-400 transition-transform ${layerOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
            </button>
            {layerOpen &&
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {layerOptions.map((l) =>
              <button key={l} onClick={() => {setLayer(l);setLayerOpen(false);}}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${l === layer ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
                {l}</button>
              )}
              </div>
            }
          </div>
          {/* ID Type */}
          <div className="relative">
            <label className="text-xs text-slate-500 font-semibold mb-1 block">ID Type</label>
            <button
              onClick={() => {closeAll();setIdTypeOpen(!idTypeOpen);}}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

              <span className="font-mono">{idType}</span>
              <span className={`text-slate-400 transition-transform ${idTypeOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
            </button>
            {idTypeOpen &&
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {idTypeOptions.map((t) =>
              <button key={t} onClick={() => {setIdType(t);setIdTypeOpen(false);}}
              className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${t === idType ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
                {t}</button>
              )}
              </div>
            }
          </div>
        </div>
      </div>

      {/* Section 2: Scorecard */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Scorecard</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 font-semibold mb-1 block">Hypothesis</label>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              placeholder='e.g. "Changing the checkout button color to green will increase conversion rates by 5%"' />

          </div>
          {/* Primary metrics */}
          <div className="relative">
            <label className="text-xs text-slate-500 font-semibold mb-1 block">Primary Metrics</label>
            <button
              onClick={() => {closeAll();setPmOpen(!pmOpen);}}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

              <span className="text-slate-500">{primaryMetrics.length} selected</span>
              <span className={`text-slate-400 transition-transform ${pmOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
            </button>
            {pmOpen &&
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-40 overflow-y-auto">
                {primaryMetricOptions.map((m) =>
              <button key={m} onClick={() => toggleMetric(primaryMetrics, setPrimaryMetrics, m)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left">

                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${primaryMetrics.includes(m) ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}>
                      {primaryMetrics.includes(m) &&
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-8c75e8df"><polyline points="20 6 9 17 4 12" /></svg>
                  }
                    </div>
                    <span className="text-xs text-slate-700 font-mono">{m}</span>
                  </button>
              )}
              </div>
            }
            {primaryMetrics.length > 0 &&
            <div className="flex flex-wrap gap-1.5 mt-2">
                {primaryMetrics.map((m) =>
              <Tag key={m} label={m} onRemove={() => toggleMetric(primaryMetrics, setPrimaryMetrics, m)} />
              )}
              </div>
            }
          </div>
          {/* Secondary metrics */}
          <div className="relative">
            <label className="text-xs text-slate-500 font-semibold mb-1 block">Secondary / Guardrail Metrics</label>
            <button
              onClick={() => {closeAll();setSmOpen(!smOpen);}}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

              <span className="text-slate-500">{secondaryMetrics.length} selected</span>
              <span className={`text-slate-400 transition-transform ${smOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
            </button>
            {smOpen &&
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-40 overflow-y-auto">
                {secondaryMetricOptions.map((m) =>
              <button key={m} onClick={() => toggleMetric(secondaryMetrics, setSecondaryMetrics, m)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left">

                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${secondaryMetrics.includes(m) ? "border-amber-500 bg-amber-500" : "border-slate-300"}`}>
                      {secondaryMetrics.includes(m) &&
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-872111dc"><polyline points="20 6 9 17 4 12" /></svg>
                  }
                    </div>
                    <span className="text-xs text-slate-700 font-mono">{m}</span>
                  </button>
              )}
              </div>
            }
            {secondaryMetrics.length > 0 &&
            <div className="flex flex-wrap gap-1.5 mt-2">
                {secondaryMetrics.map((m) =>
              <Tag key={m} label={m} onRemove={() => toggleMetric(secondaryMetrics, setSecondaryMetrics, m)} />
              )}
              </div>
            }
          </div>
        </div>
      </div>

      {/* Section 3: Targeting */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Targeting</p>
        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1 block">Targeting Rule</label>
          <button
            onClick={() => {closeAll();setTargetingOpen(!targetingOpen);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">{Icon.users} {targeting}</span>
            <span className={`text-slate-400 transition-transform ${targetingOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {targetingOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {targetingOptions.map((t) =>
            <button key={t} onClick={() => {setTargeting(t);setTargetingOpen(false);}}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${t === targeting ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
              {t}</button>
            )}
            </div>
          }
        </div>
      </div>

      {/* Section 4: Groups & Parameters */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">4. Groups & Parameters</p>
        <div className="space-y-2">
          {groups.map((g, idx) =>
          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                value={g.name}
                onChange={(e) => updateGroup(idx, "name", e.target.value)}
                className="flex-1 text-xs font-semibold text-slate-700 bg-transparent outline-none" />

                <div className="flex items-center gap-1">
                  <input
                  type="number"
                  min={0}
                  max={100}
                  value={g.allocation}
                  onChange={(e) => updateGroup(idx, "allocation", parseInt(e.target.value) || 0)}
                  className="w-12 text-xs text-center bg-white border border-slate-200 rounded-lg py-1 outline-none focus:border-indigo-400" />

                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-0.5 block">Parameters (JSON)</label>
                <input
                value={g.params}
                onChange={(e) => updateGroup(idx, "params", e.target.value)}
                className="w-full text-xs font-mono text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400" />

              </div>
            </div>
          )}
          <button
            onClick={addGroup}
            className="w-full text-xs text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl py-2 transition-colors font-medium">

            + Add Variant
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={() => setSubmitted(!submitted)}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all w-full ${
        submitted ?
        "bg-emerald-50 text-emerald-700 border border-emerald-300" :
        "bg-slate-800 hover:bg-slate-700 text-white shadow-md shadow-slate-300"}`
        }>

        {submitted ? "Experiment Created" : "Create Experiment"}
      </button>
    </div>);

};

export { ConfigureStatsigCampaign };