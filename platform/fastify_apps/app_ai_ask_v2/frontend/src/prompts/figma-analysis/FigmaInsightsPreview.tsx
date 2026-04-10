import { FigmaIcon } from "@/shared/brand-icons";

const FigmaInsightsPreview = () => (
  <div className="flex flex-col h-full">
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Insights & Context</h3>
    </div>

    <div className="px-4 py-3 border-b border-slate-100">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <h4 className="text-xs font-bold text-slate-800 mb-3">Figma Analysis Preview</h4>

        <p className="text-xs text-slate-500 font-semibold mb-2">Verified Data Sources</p>
        <div className="flex items-center gap-2 mb-3">
          <FigmaIcon s={18} />
          <div>
            <p className="text-xs font-medium text-slate-700">Main App UI v2.3</p>
            <p className="text-xs text-slate-400">Design System</p>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-slate-200 mb-3 bg-slate-100">
          <div className="h-32 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className="w-8 h-10 rounded bg-indigo-200/60 border border-indigo-300/40" />
                <div className="w-12 h-10 rounded bg-purple-200/60 border border-purple-300/40" />
                <div className="w-8 h-10 rounded bg-blue-200/60 border border-blue-300/40" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Design preview</p>
            </div>
          </div>
        </div>

        <div className="border-l-2 border-indigo-400 pl-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-700">Initial Design Review:</span>{" "}
            Potential component detachments found on the Dashboard frame.
            Text style inconsistencies detected in the Settings frame.
          </p>
        </div>
      </div>
    </div>

    <div className="px-4 py-3 border-b border-slate-100">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Analysis Summary</h4>
      <div className="space-y-2">
        {[
          { label: "Components Scanned", value: "142", color: "text-indigo-600" },
          { label: "Detached Instances", value: "8", color: "text-amber-600" },
          { label: "Style Violations", value: "3", color: "text-red-500" },
          { label: "Consistency Score", value: "87%", color: "text-emerald-600" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{item.label}</span>
            <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="px-4 py-3">
      <h4 className="text-xs font-bold text-slate-700 mb-2">Flagged Frames</h4>
      <div className="space-y-1.5">
        {[
          { name: "Dashboard", issues: 4, severity: "warning" },
          { name: "Settings", issues: 2, severity: "info" },
          { name: "User Profile", issues: 1, severity: "info" },
        ].map((frame) => (
          <div key={frame.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <span className={`w-2 h-2 rounded-full ${
              frame.severity === "warning" ? "bg-amber-400" : "bg-blue-400"
            }`} />
            <span className="text-xs text-slate-700 font-medium flex-1">{frame.name}</span>
            <span className="text-xs text-slate-400">{frame.issues} issues</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { FigmaInsightsPreview };
