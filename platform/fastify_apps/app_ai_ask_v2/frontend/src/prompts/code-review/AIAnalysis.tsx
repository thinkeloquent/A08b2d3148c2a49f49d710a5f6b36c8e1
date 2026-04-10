import { Icon } from "@/shared/icons";

const AIAnalysis = () => (
  <div className="px-4 pt-4 pb-3 border-b border-slate-100">
    <h3 className="text-xs font-bold text-slate-700 mb-2">Initial AI Analysis</h3>
    <p className="text-xs text-slate-500 leading-relaxed">
      Summary: code review suggests improvements for better performance and readability. Data analysis report and environment for performance impact, improvements forecast and analysis.
    </p>
    <button className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">
      View Details {Icon.chevDown}
    </button>
  </div>
);

export { AIAnalysis };
