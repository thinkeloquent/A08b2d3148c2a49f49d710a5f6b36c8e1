import { useState } from "react";
import { Icon } from "@/shared/icons";
import { Toggle } from "@/shared/components";

const StatsigPanel = () => {
  const [flags, setFlags] = useState([
    { key: "new_review_ui", enabled: true, variant: "treatment" },
    { key: "ai_suggestions_v2", enabled: true, variant: "treatment" },
    { key: "inline_comments", enabled: false, variant: "control" },
    { key: "dark_mode_beta", enabled: false, variant: "control" },
  ]);
  return (
    <div className="space-y-2">
      {flags.map((f, i) => (
        <div key={f.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${f.enabled ? "bg-emerald-50/60 border-emerald-200" : "bg-white border-slate-200"}`}>
          <span className={f.enabled ? "text-emerald-500" : "text-slate-300"}>{Icon.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-semibold text-slate-700 truncate">{f.key}</p>
            <p className={`text-xs font-medium ${f.enabled ? "text-emerald-600" : "text-slate-400"}`}>{f.variant}</p>
          </div>
          <Toggle on={f.enabled} onChange={() => setFlags((p) => p.map((x, j) => j === i ? { ...x, enabled: !x.enabled, variant: !x.enabled ? "treatment" : "control" } : x))} />
        </div>
      ))}
    </div>
  );
};

export { StatsigPanel };
