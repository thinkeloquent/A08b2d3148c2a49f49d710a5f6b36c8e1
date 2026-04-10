import { useState, useRef, useEffect } from "react";
import { Icon } from "@/shared/icons";
import { Tag } from "@/shared/components";

const analysisCategories = [
"Agent Success Rate",
"Human-in-the-Loop Efficiency",
"LLM Token Usage & Cost",
"Node Execution Latency",
"Error & Fallback Patterns",
"Flow Complexity Score",
"Citizen Developer Adoption",
"Deployment Frequency"];


const platformOptions = [
"All Platforms", "LangFlow", "Flowise", "Dify", "CrewAI Studio",
"n8n + AI", "Rivet", "BuildShip", "Stack AI"];


const nodeTypeOptions = [
"All Node Types", "LLM Nodes", "Tool / API Nodes",
"Human-in-the-Loop", "Router / Conditional", "Output Nodes"];


const ConfigureVisualBuilder = () => {
  const [platform, setPlatform] = useState("All Platforms");
  const [platOpen, setPlatOpen] = useState(false);
  const [nodeType, setNodeType] = useState("All Node Types");
  const [ntOpen, setNtOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
  "Agent Success Rate",
  "Human-in-the-Loop Efficiency",
  "LLM Token Usage & Cost"]
  );
  const [catOpen, setCatOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [includeTestRuns, setIncludeTestRuns] = useState(false);
  const [includeHITLMetrics, setIncludeHITLMetrics] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setPlatOpen(false);
        setNtOpen(false);
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const closeAll = () => {setPlatOpen(false);setNtOpen(false);setCatOpen(false);};

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm" ref={dropRef}>
      <h3 className="font-bold text-slate-800 text-sm mb-4">
        AI Visual Builder Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Platform selector */}
        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Platform</label>
          <button
            onClick={() => {closeAll();setPlatOpen(!platOpen);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">{Icon.grid} {platform}</span>
            <span className={`text-slate-400 transition-transform ${platOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {platOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
              {platformOptions.map((p) =>
            <button key={p} onClick={() => {setPlatform(p);setPlatOpen(false);}}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${p === platform ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
              {p}</button>
            )}
            </div>
          }
        </div>

        {/* Node type selector */}
        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Node Type</label>
          <button
            onClick={() => {closeAll();setNtOpen(!ntOpen);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">{Icon.settings} {nodeType}</span>
            <span className={`text-slate-400 transition-transform ${ntOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {ntOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {nodeTypeOptions.map((n) =>
            <button key={n} onClick={() => {setNodeType(n);setNtOpen(false);}}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${n === nodeType ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
              {n}</button>
            )}
            </div>
          }
        </div>

        {/* Time range */}
        <div className="col-span-2">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Time Range</label>
          <div className="flex gap-1.5">
            {["1h", "24h", "7d", "30d", "90d"].map((t) =>
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeRange === t ?
              "bg-violet-600 text-white" :
              "bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-300"}`
              }>

                {t}
              </button>
            )}
          </div>
        </div>

        {/* Analysis categories */}
        <div className="col-span-2 relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Analysis Categories</label>
          <button
            onClick={() => {closeAll();setCatOpen(!catOpen);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="text-slate-500">{selectedCategories.length} categories selected</span>
            <span className={`text-slate-400 transition-transform ${catOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {catOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
              {analysisCategories.map((cat) =>
            <button key={cat} onClick={() => toggleCategory(cat)}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left">

                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              selectedCategories.includes(cat) ? "border-violet-500 bg-violet-500" : "border-slate-300"}`
              }>
                    {selectedCategories.includes(cat) &&
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-aa1c96b1">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                }
                  </div>
                  <span className="text-xs text-slate-700">{cat}</span>
                </button>
            )}
            </div>
          }
          {selectedCategories.length > 0 &&
          <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedCategories.map((cat) =>
            <Tag key={cat} label={cat} onRemove={() => toggleCategory(cat)} />
            )}
            </div>
          }
        </div>

        {/* Options */}
        <div className="col-span-2">
          <label className="text-xs text-slate-500 font-semibold mb-2 block">Options</label>
          <div className="flex flex-col gap-2">
            {([
            [includeHITLMetrics, setIncludeHITLMetrics, "Include human-in-the-loop metrics"],
            [includeTestRuns, setIncludeTestRuns, "Include test / sandbox runs"]] as
            const).map(([val, setter, label]) =>
            <label key={label} className="flex items-center gap-2 cursor-pointer group">
                <div
                onClick={() => (setter as (v: boolean) => void)(!val)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                val ? "border-violet-500 bg-violet-500" : "border-slate-300 group-hover:border-slate-400"}`
                }>

                  {val &&
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-4abc5b96">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                }
                </div>
                <span className={`text-xs ${val ? "text-violet-700 font-semibold" : "text-slate-500"}`}>{label}</span>
              </label>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setSubmitted(!submitted)}
        className={`mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-all w-full ${
        submitted ?
        "bg-emerald-50 text-emerald-700 border border-emerald-300" :
        "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-200"}`
        }>

        {submitted ? "Analysis Complete" : "Run Builder Health Analysis"}
      </button>
    </div>);

};

export { ConfigureVisualBuilder };