import { useState, useRef, useEffect } from "react";
import { Icon } from "@/shared/icons";
import { FigmaIcon } from "@/shared/brand-icons";

const projectFiles = [
{ name: "Main App UI v2.3", icon: "figma" as const },
{ name: "Design System v1.5", icon: "file" as const },
{ name: "Onboarding Flow", icon: "file" as const }];


const analysisGoals = [
"Component Detachment",
"Style Consistency",
"Color Usage Audit",
"Typography Check",
"Layout Structure",
"Accessibility Review"];


const ConfigureFigmaAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(projectFiles[0].name);
  const [fileOpen, setFileOpen] = useState(false);
  const [goal, setGoal] = useState("Component Detachment");
  const [goalOpen, setGoalOpen] = useState(false);
  const [scope, setScope] = useState<"all" | "last">("all");
  const [priorities, setPriorities] = useState({
    componentReuse: true,
    textConsistency: false,
    colorUsage: true
  });
  const [submitted, setSubmitted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setFileOpen(false);
        setGoalOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const togglePriority = (key: keyof typeof priorities) =>
  setPriorities((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm" ref={dropRef}>
      <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
        <FigmaIcon s={18} data-test-id="figmaicon-4e4727ff" />
        Figma Analysis: Specific Insight Extraction
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Select Project File */}
        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Select Project File</label>
          <button
            onClick={() => {setFileOpen(!fileOpen);setGoalOpen(false);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">
              {selectedFile === projectFiles[0].name ? <FigmaIcon s={14} /> : <span className="text-slate-400">{Icon.file}</span>}
              {selectedFile}
            </span>
            <span className={`text-slate-400 transition-transform ${fileOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {fileOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {projectFiles.map((f) =>
            <button
              key={f.name}
              onClick={() => {setSelectedFile(f.name);setFileOpen(false);}}
              className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-purple-50 transition-colors ${
              f.name === selectedFile ? "bg-purple-50 text-purple-700 font-semibold" : "text-slate-600"}`
              }>

                  {f.icon === "figma" ? <FigmaIcon s={14} /> : <span className="text-slate-400">{Icon.file}</span>}
                  <span className="text-xs">{f.name}</span>
                </button>
            )}
            </div>
          }
        </div>

        {/* Analysis Goal */}
        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Analysis Goal</label>
          <button
            onClick={() => {setGoalOpen(!goalOpen);setFileOpen(false);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">
              <button
                onClick={(e) => {e.stopPropagation();setGoal("");}}
                className="text-slate-400 hover:text-slate-600 transition-colors">

                {Icon.x}
              </button>
              {goal || <span className="text-slate-400">Select goal...</span>}
            </span>
            <span className={`text-slate-400 transition-transform ${goalOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {goalOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {analysisGoals.map((g) =>
            <button
              key={g}
              onClick={() => {setGoal(g);setGoalOpen(false);}}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
              g === goal ? "bg-purple-50 text-purple-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`
              }>

                  {g}
                </button>
            )}
            </div>
          }
        </div>

        {/* Frame Scope */}
        <div>
          <label className="text-xs text-slate-500 font-semibold mb-2 block">Frame Scope</label>
          <div className="flex flex-col gap-2">
            {([["all", "All Frames"], ["last", "Last Edited Page"]] as const).map(([val, label]) =>
            <label key={val} className="flex items-center gap-2 cursor-pointer group">
                <div
                onClick={() => setScope(val)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                scope === val ? "border-indigo-500 bg-indigo-500" : "border-slate-300 group-hover:border-slate-400"}`
                }>

                  {scope === val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className={`text-xs ${scope === val ? "text-indigo-700 font-semibold" : "text-slate-500"}`}>{label}</span>
              </label>
            )}
          </div>
        </div>

        {/* Priorities */}
        <div>
          <label className="text-xs text-slate-500 font-semibold mb-2 block">Priorities</label>
          <div className="flex flex-col gap-2">
            {([
            ["componentReuse", "Prioritize Component Reuse"],
            ["textConsistency", "Prioritize Text Consistency"],
            ["colorUsage", "Prioritize Color Usage"]] as
            const).map(([key, label]) =>
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
                <div
                onClick={() => togglePriority(key)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                priorities[key] ?
                "border-indigo-500 bg-indigo-500" :
                "border-slate-300 group-hover:border-slate-400"}`
                }>

                  {priorities[key] &&
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-fc4e7d8a">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                }
                </div>
                <span className={`text-xs ${priorities[key] ? "text-indigo-700 font-semibold" : "text-slate-500"}`}>
                  {label}
                </span>
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
        "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-200"}`
        }>

        {submitted ? "Insights Extracted" : "Confirm & Extract Figma Insights"}
      </button>
    </div>);

};

export { ConfigureFigmaAnalysis };