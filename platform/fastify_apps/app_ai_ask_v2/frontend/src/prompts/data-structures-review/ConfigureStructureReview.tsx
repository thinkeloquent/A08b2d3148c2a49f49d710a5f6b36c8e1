import { useState, useRef, useEffect } from "react";
import { Icon } from "@/shared/icons";
import { GitHubIcon } from "@/shared/brand-icons";
import { Tag } from "@/shared/components";

const reviewCategories = [
"Schema Inference & Typing",
"Type Anomaly Detection",
"Redundancy & Duplication",
"Naming Convention Audit",
"Flatten / Normalize Suggestions",
"OpenAPI / JSON Schema Compliance",
"Mock Data Generation",
"Version Diff & History"];


const transformOptions = [
"None",
"Flatten nested objects",
"snake_case → camelCase",
"camelCase → snake_case",
"Normalize arrays",
"Remove null fields",
"Sort keys alphabetically"];


const outputFormatOptions = ["JSON Schema", "OpenAPI 3.1", "TypeScript Interface", "Zod Schema", "Pydantic Model", "Proto3"];

const ConfigureStructureReview = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
  "Schema Inference & Typing",
  "Type Anomaly Detection",
  "Naming Convention Audit"]
  );
  const [catOpen, setCatOpen] = useState(false);
  const [transform, setTransform] = useState("None");
  const [tfOpen, setTfOpen] = useState(false);
  const [outputFormat, setOutputFormat] = useState("JSON Schema");
  const [ofOpen, setOfOpen] = useState(false);
  const [nlPrompt, setNlPrompt] = useState("");
  const [strictOutput, setStrictOutput] = useState(true);
  const [generateMocks, setGenerateMocks] = useState(false);
  const [trackVersions, setTrackVersions] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setCatOpen(false);
        setTfOpen(false);
        setOfOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const closeAll = () => {setCatOpen(false);setTfOpen(false);setOfOpen(false);};

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5" ref={dropRef}>
      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
        <GitHubIcon s={18} data-test-id="githubicon-fb72a039" />
        Data Structure Review
      </h3>

      {/* Section 1: Review & Comment */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Review & Comment</p>
        <div className="space-y-3">
          {/* Analysis categories */}
          <div className="relative">
            <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Review Categories</label>
            <button
              onClick={() => {closeAll();setCatOpen(!catOpen);}}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

              <span className="text-slate-500">{selectedCategories.length} categories selected</span>
              <span className={`text-slate-400 transition-transform ${catOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
            </button>
            {catOpen &&
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                {reviewCategories.map((cat) =>
              <button key={cat} onClick={() => toggleCategory(cat)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left">

                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                selectedCategories.includes(cat) ? "border-teal-500 bg-teal-500" : "border-slate-300"}`
                }>
                      {selectedCategories.includes(cat) &&
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-bd558d81">
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
        </div>
      </div>

      {/* Section 2: Restructure */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Restructure (LLM)</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Transform preset */}
          <div className="relative">
            <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Transform Preset</label>
            <button
              onClick={() => {closeAll();setTfOpen(!tfOpen);}}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

              <span className="truncate">{transform}</span>
              <span className={`text-slate-400 transition-transform ${tfOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
            </button>
            {tfOpen &&
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                {transformOptions.map((t) =>
              <button key={t} onClick={() => {setTransform(t);setTfOpen(false);}}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${t === transform ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
                {t}</button>
              )}
              </div>
            }
          </div>

          {/* Output format */}
          <div className="relative">
            <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Output Format</label>
            <button
              onClick={() => {closeAll();setOfOpen(!ofOpen);}}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

              <span>{outputFormat}</span>
              <span className={`text-slate-400 transition-transform ${ofOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
            </button>
            {ofOpen &&
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {outputFormatOptions.map((o) =>
              <button key={o} onClick={() => {setOutputFormat(o);setOfOpen(false);}}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${o === outputFormat ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
                {o}</button>
              )}
              </div>
            }
          </div>

          {/* Natural language prompt */}
          <div className="col-span-2">
            <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Natural Language Transform</label>
            <textarea
              value={nlPrompt}
              onChange={(e) => setNlPrompt(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none"
              placeholder='e.g. "Flatten all nested address fields into root" or "Convert dates to ISO 8601"' />

          </div>
        </div>
      </div>

      {/* Section 3: Optimize */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Optimize (QA)</p>
        <div className="flex flex-col gap-2">
          {([
          [strictOutput, setStrictOutput, "Enforce strict structured output (JSON Schema / OpenAPI)"],
          [generateMocks, setGenerateMocks, "Generate edge-case mock data from schema"],
          [trackVersions, setTrackVersions, "Track schema version history"]] as
          const).map(([val, setter, label]) =>
          <label key={label} className="flex items-center gap-2 cursor-pointer group">
              <div
              onClick={() => (setter as (v: boolean) => void)(!val)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              val ? "border-teal-500 bg-teal-500" : "border-slate-300 group-hover:border-slate-400"}`
              }>

                {val &&
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-647ed8d7">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
              }
              </div>
              <span className={`text-xs ${val ? "text-teal-700 font-semibold" : "text-slate-500"}`}>{label}</span>
            </label>
          )}
        </div>
      </div>

      <button
        onClick={() => setSubmitted(!submitted)}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all w-full ${
        submitted ?
        "bg-emerald-50 text-emerald-700 border border-emerald-300" :
        "bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-200"}`
        }>

        {submitted ? "Review Complete" : "Run Structure Review"}
      </button>
    </div>);

};

export { ConfigureStructureReview };