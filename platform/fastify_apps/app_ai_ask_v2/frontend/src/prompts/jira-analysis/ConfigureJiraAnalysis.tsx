import { useState, useRef, useEffect } from "react";
import { Icon } from "@/shared/icons";
import { JiraIcon } from "@/shared/brand-icons";
import { Tag } from "@/shared/components";

const analysisCategories = [
"Sprint Health & Burndown",
"Issue Flow & Cycle Time",
"Backlog Grooming",
"Bug Trends & Regression",
"Epic Progress",
"Assignee Workload",
"Blocked Issues",
"Velocity Tracking"];


const issueTypeOptions = ["All Types", "Stories", "Bugs", "Tasks", "Sub-tasks", "Epics"];

const ConfigureJiraAnalysis = () => {
  const [issueType, setIssueType] = useState("All Types");
  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
  "Sprint Health & Burndown",
  "Issue Flow & Cycle Time",
  "Velocity Tracking"]
  );
  const [catOpen, setCatOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("90d");
  const [jql, setJql] = useState("");
  const [includeSubtasks, setIncludeSubtasks] = useState(true);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
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
        <JiraIcon s={18} data-test-id="jiraicon-7066b601" />
        Jira Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Issue type selector */}
        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Issue Type</label>
          <button
            onClick={() => {setTypeOpen(!typeOpen);setCatOpen(false);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">
              {Icon.ticket}
              {issueType}
            </span>
            <span className={`text-slate-400 transition-transform ${typeOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {typeOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {issueTypeOptions.map((t) =>
            <button
              key={t}
              onClick={() => {setIssueType(t);setTypeOpen(false);}}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
              t === issueType ? "bg-slate-100 text-slate-800 font-semibold" : "text-slate-600 hover:bg-slate-50"}`
              }>

                  {t}
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
              "bg-blue-600 text-white" :
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
            onClick={() => {setCatOpen(!catOpen);setTypeOpen(false);}}
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
              "border-blue-500 bg-blue-500" :
              "border-slate-300"}`
              }>
                    {selectedCategories.includes(cat) &&
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-3c48faf8">
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

        {/* JQL filter */}
        <div className="col-span-2">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">JQL Filter (optional)</label>
          <input
            value={jql}
            onChange={(e) => setJql(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
            placeholder='e.g. project = PLAT AND status != Done' />

        </div>

        {/* Options */}
        <div className="col-span-2">
          <label className="text-xs text-slate-500 font-semibold mb-2 block">Options</label>
          <div className="flex flex-col gap-2">
            {([
            [includeSubtasks, setIncludeSubtasks, "Include sub-tasks in analysis"],
            [includeResolved, setIncludeResolved, "Include resolved / done issues"]] as
            const).map(([val, setter, label]) =>
            <label key={label} className="flex items-center gap-2 cursor-pointer group">
                <div
                onClick={() => (setter as (v: boolean) => void)(!val)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                val ? "border-blue-500 bg-blue-500" : "border-slate-300 group-hover:border-slate-400"}`
                }>

                  {val &&
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3" data-test-id="svg-b8b02fb8">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                }
                </div>
                <span className={`text-xs ${val ? "text-blue-700 font-semibold" : "text-slate-500"}`}>{label}</span>
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
        "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-200"}`
        }>

        {submitted ? "Analysis Complete" : "Run Jira Health Analysis"}
      </button>
    </div>);

};

export { ConfigureJiraAnalysis };