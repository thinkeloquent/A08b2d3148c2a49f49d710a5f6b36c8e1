import { useState } from "react";
import { StatsigIcon } from "@/shared/brand-icons";
import { Icon } from "@/shared/icons";

interface Experiment {
  name: string;
  status: "running" | "draft" | "completed" | "paused";
  layer?: string;
  allocation: string;
  started?: string;
}

interface ExperimentGroup {
  name: string;
  experiments: Experiment[];
}

const statusColor: Record<string, string> = {
  running: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-500",
  completed: "bg-blue-100 text-blue-700",
  paused: "bg-amber-100 text-amber-600"
};

const statusDot: Record<string, string> = {
  running: "bg-emerald-500 animate-pulse",
  draft: "bg-slate-400",
  completed: "bg-blue-500",
  paused: "bg-amber-500"
};

const mockGroups: ExperimentGroup[] = [
{
  name: "Growth",
  experiments: [
  { name: "Checkout Button Color", status: "running", layer: "checkout_flow", allocation: "50/50", started: "5d ago" },
  { name: "Onboarding Steps Reduction", status: "running", allocation: "70/30", started: "2w ago" },
  { name: "Free Trial Banner", status: "draft", allocation: "50/50" }]

},
{
  name: "Engagement",
  experiments: [
  { name: "Push Notification Cadence", status: "running", layer: "notifications", allocation: "33/33/34", started: "1w ago" },
  { name: "Feed Algorithm V2", status: "paused", allocation: "50/50", started: "3w ago" }]

},
{
  name: "Infrastructure",
  experiments: [
  { name: "CDN Provider Switch", status: "completed", allocation: "10/90", started: "1mo ago" },
  { name: "API Cache TTL", status: "completed", allocation: "50/50", started: "2mo ago" }]

}];


const StatsigExperimentExplorer = () => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Growth");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "running" | "draft" | "completed">("all");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <StatsigIcon s={18} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Experiments</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all mb-2">
          <span className="text-slate-400">{Icon.search}</span>
          <input
            className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700 bg-transparent"
            placeholder="Search experiments..." />

        </div>
        <div className="flex gap-1">
          {(["all", "running", "draft", "completed"] as const).map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-1.5 py-1 rounded-md text-xs font-medium transition-all ${
            filter === f ?
            "bg-slate-800 text-white" :
            "bg-slate-50 text-slate-500 hover:bg-slate-100"}`
            }>

              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {mockGroups.map((group) => {
          const filtered = filter === "all" ?
          group.experiments :
          group.experiments.filter((e) => e.status === filter);
          if (filtered.length === 0) return null;

          return (
            <div key={group.name} className="mb-1">
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.name ? null : group.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

                <span className={`text-slate-400 transition-transform ${expandedGroup === group.name ? "rotate-90" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-58d0af41">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </span>
                <span className="text-slate-400">{Icon.grid}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{group.name}</p>
                  <p className="text-xs text-slate-400">{filtered.length} experiments</p>
                </div>
              </button>

              {expandedGroup === group.name &&
              <div className="ml-4">
                  {filtered.map((exp) =>
                <button
                  key={exp.name}
                  onClick={() => setSelectedItem(selectedItem === exp.name ? null : exp.name)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${
                  selectedItem === exp.name ?
                  "bg-slate-100 border border-slate-300" :
                  "hover:bg-slate-50"}`
                  }>

                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[exp.status]}`} />
                      <div className="text-left flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${
                    selectedItem === exp.name ? "text-slate-800" : "text-slate-700"}`
                    }>
                          {exp.name}
                        </p>
                        <div className="flex items-center gap-2">
                          {exp.layer &&
                      <span className="text-xs text-slate-400">{exp.layer}</span>
                      }
                          <span className="text-xs text-slate-400">{exp.allocation}</span>
                          {exp.started &&
                      <span className="text-xs text-slate-400">{exp.started}</span>
                      }
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${statusColor[exp.status]}`}>
                        {exp.status}
                      </span>
                    </button>
                )}
                </div>
              }
            </div>);

        })}
      </div>

      {selectedItem &&
      <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <StatsigIcon s={16} />
            <span className="text-xs text-slate-700 font-medium flex-1 truncate">{selectedItem}</span>
            <span className="text-xs text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold">
              Selected
            </span>
          </div>
        </div>
      }
    </div>);

};

export { StatsigExperimentExplorer };