import { useState, useRef, useEffect } from "react";
import { Icon } from "@/shared/icons";
import { GitHubIcon } from "@/shared/brand-icons";
import { Tag } from "@/shared/components";

const analysisCategories = [
"Security & Vulnerabilities",
"Code Quality",
"Dependency Health",
"Commit Activity",
"Contributor Patterns",
"Stale Files & Tech Debt",
"Language Breakdown",
"CI/CD Pipeline"];


const branchOptions = ["main", "develop", "release/v2", "feature/auth"];

const ConfigureRepoAnalysis = () => {
  const [branch, setBranch] = useState("main");
  const [branchOpen, setBranchOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
  "Security & Vulnerabilities",
  "Dependency Health",
  "Commit Activity"]
  );
  const [catOpen, setCatOpen] = useState(false);
  const [depth, setDepth] = useState<"shallow" | "deep">("shallow");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [timeRange, setTimeRange] = useState("90d");
  const [submitted, setSubmitted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setBranchOpen(false);
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm" ref={dropRef}>
      <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
        <GitHubIcon s={18} data-test-id="githubicon-72ec7de0" />
        GitHub Repo Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Branch selector */}
        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Target Branch</label>
          <button
            onClick={() => {setBranchOpen(!branchOpen);setCatOpen(false);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">
              {Icon.repo}
              {branch}
            </span>
            <span className={`text-slate-400 transition-transform ${branchOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {branchOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {branchOptions.map((b) =>
            <button
              key={b}
              onClick={() => {setBranch(b);setBranchOpen(false);}}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
              b === branch ? "bg-slate-100 text-slate-800 font-semibold" : "text-slate-600 hover:bg-slate-50"}`
              }>

                  {b}
                </button>
            )}
            </div>
          }
        </div>

        {/* Time range */}
        <div>
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Time Range</label>
          <div className="flex gap-1.5">
            {["30d", "90d", "6mo", "1y", "all"].map((t) =>
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeRange === t ?
              "bg-slate-800 text-white" :
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
            onClick={() => {setCatOpen(!catOpen);setBranchOpen(false);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="text-slate-500">{selectedCategories.length} categories selected</span>
            <span className={`text-slate-400 transition-transform ${catOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {catOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
              {analysisCategories.map((cat) =>
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left">

                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              selectedCategories.includes(cat) ?
              "border-indigo-500 bg-indigo-500" :
              "border-slate-300"}`
              }>
                    {selectedCategories.includes(cat) &&
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-6b8bda83">
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

        {/* Analysis depth */}
        <div>
          <label className="text-xs text-slate-500 font-semibold mb-2 block">Analysis Depth</label>
          <div className="flex flex-col gap-2">
            {([["shallow", "Shallow (fast overview)"], ["deep", "Deep (full scan)"]] as const).map(([val, label]) =>
            <label key={val} className="flex items-center gap-2 cursor-pointer group">
                <div
                onClick={() => setDepth(val)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                depth === val ? "border-indigo-500 bg-indigo-500" : "border-slate-300 group-hover:border-slate-400"}`
                }>

                  {depth === val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className={`text-xs ${depth === val ? "text-indigo-700 font-semibold" : "text-slate-500"}`}>{label}</span>
              </label>
            )}
          </div>
        </div>

        {/* Include archived */}
        <div>
          <label className="text-xs text-slate-500 font-semibold mb-2 block">Options</label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              onClick={() => setIncludeArchived(!includeArchived)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              includeArchived ? "border-indigo-500 bg-indigo-500" : "border-slate-300 group-hover:border-slate-400"}`
              }>

              {includeArchived &&
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-83a1b8a2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            </div>
            <span className={`text-xs ${includeArchived ? "text-indigo-700 font-semibold" : "text-slate-500"}`}>
              Include archived branches
            </span>
          </label>
        </div>
      </div>

      <button
        onClick={() => setSubmitted(!submitted)}
        className={`mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-all w-full ${
        submitted ?
        "bg-emerald-50 text-emerald-700 border border-emerald-300" :
        "bg-slate-800 hover:bg-slate-700 text-white shadow-md shadow-slate-300"}`
        }>

        {submitted ? "Analysis Complete" : "Run Repo Health Analysis"}
      </button>
    </div>);

};

export { ConfigureRepoAnalysis };