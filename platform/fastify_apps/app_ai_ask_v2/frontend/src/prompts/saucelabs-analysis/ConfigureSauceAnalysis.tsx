import { useState, useRef, useEffect } from "react";
import { Icon } from "@/shared/icons";
import { SauceIcon } from "@/shared/brand-icons";
import { Tag } from "@/shared/components";

const analysisCategories = [
"Pass/Fail Rate Trends",
"Flaky Test Detection",
"Cross-Browser Compatibility",
"Mobile Device Coverage",
"Test Duration & Performance",
"Framework Utilization",
"Error Classification",
"Real Device vs Emulator"];


const platformOptions = ["All Platforms", "Web Browsers", "Real Devices", "Emulators/Simulators"];
const frameworkOptions = ["All Frameworks", "Selenium", "Cypress", "Playwright", "Puppeteer", "Appium", "Espresso", "XCUITest"];

const ConfigureSauceAnalysis = () => {
  const [platform, setPlatform] = useState("All Platforms");
  const [platOpen, setPlatOpen] = useState(false);
  const [framework, setFramework] = useState("All Frameworks");
  const [fwOpen, setFwOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
  "Pass/Fail Rate Trends",
  "Flaky Test Detection",
  "Cross-Browser Compatibility"]
  );
  const [catOpen, setCatOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");
  const [includeManual, setIncludeManual] = useState(false);
  const [includeSkipped, setIncludeSkipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setPlatOpen(false);
        setFwOpen(false);
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

  const closeOthers = (...setters: Array<(v: boolean) => void>) => setters.forEach((s) => s(false));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm" ref={dropRef}>
      <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
        <SauceIcon s={18} data-test-id="sauceicon-61809062" />
        Sauce Labs Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Platform selector */}
        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Platform</label>
          <button
            onClick={() => {setPlatOpen(!platOpen);closeOthers(setFwOpen, setCatOpen);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">
              {Icon.grid}
              {platform}
            </span>
            <span className={`text-slate-400 transition-transform ${platOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {platOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {platformOptions.map((p) =>
            <button
              key={p}
              onClick={() => {setPlatform(p);setPlatOpen(false);}}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
              p === platform ? "bg-slate-100 text-slate-800 font-semibold" : "text-slate-600 hover:bg-slate-50"}`
              }>

                  {p}
                </button>
            )}
            </div>
          }
        </div>

        {/* Framework selector */}
        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Framework</label>
          <button
            onClick={() => {setFwOpen(!fwOpen);closeOthers(setPlatOpen, setCatOpen);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">
              {Icon.settings}
              {framework}
            </span>
            <span className={`text-slate-400 transition-transform ${fwOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {fwOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
              {frameworkOptions.map((f) =>
            <button
              key={f}
              onClick={() => {setFramework(f);setFwOpen(false);}}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
              f === framework ? "bg-slate-100 text-slate-800 font-semibold" : "text-slate-600 hover:bg-slate-50"}`
              }>

                  {f}
                </button>
            )}
            </div>
          }
        </div>

        {/* Time range */}
        <div className="col-span-2">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Time Range</label>
          <div className="flex gap-1.5">
            {["24h", "7d", "30d", "90d", "all"].map((t) =>
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeRange === t ?
              "bg-red-600 text-white" :
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
            onClick={() => {setCatOpen(!catOpen);closeOthers(setPlatOpen, setFwOpen);}}
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
              "border-red-500 bg-red-500" :
              "border-slate-300"}`
              }>
                    {selectedCategories.includes(cat) &&
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-b3ec6852">
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
            [includeManual, setIncludeManual, "Include manual test sessions"],
            [includeSkipped, setIncludeSkipped, "Include skipped / quarantined tests"]] as
            const).map(([val, setter, label]) =>
            <label key={label} className="flex items-center gap-2 cursor-pointer group">
                <div
                onClick={() => (setter as (v: boolean) => void)(!val)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                val ? "border-red-500 bg-red-500" : "border-slate-300 group-hover:border-slate-400"}`
                }>

                  {val &&
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-064502f1">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                }
                </div>
                <span className={`text-xs ${val ? "text-red-700 font-semibold" : "text-slate-500"}`}>{label}</span>
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
        "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-200"}`
        }>

        {submitted ? "Analysis Complete" : "Run Test Health Analysis"}
      </button>
    </div>);

};

export { ConfigureSauceAnalysis };