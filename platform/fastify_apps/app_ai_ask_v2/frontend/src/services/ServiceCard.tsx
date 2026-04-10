import { useState } from "react";
import { Toggle } from "@/shared/components";
import { PANELS } from "./panels";
import type { ServiceDef } from "./types";

const ServiceCard = ({ svc }: {svc: ServiceDef;}) => {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const Panel = PANELS[svc.id];

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setOpen(next);
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${enabled ? "shadow-sm" : ""}`}
      style={{
        borderColor: enabled ? svc.borderAccent + "55" : "#e2e8f0",
        borderLeftWidth: enabled ? "3px" : "1px",
        borderLeftColor: enabled ? svc.borderAccent : "#e2e8f0"
      }}>

      <div className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors ${enabled ? "bg-white" : "bg-slate-50/60"}`}>
        <svc.Icon s={19} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold leading-tight ${enabled ? "text-slate-800" : "text-slate-500"}`}>{svc.label}</p>
          <p className="text-xs text-slate-400 truncate leading-tight mt-0.5">{svc.desc}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {enabled &&
          <button onClick={() => setOpen(!open)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} data-test-id="svg-36dd0c2f">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          }
          <Toggle on={enabled} onChange={handleToggle} />
        </div>
      </div>
      {enabled && open &&
      <div className={`border-t px-3 py-3 ${svc.bgClass}`} style={{ borderTopColor: svc.borderAccent + "30" }}>
          <Panel />
        </div>
      }
      {enabled && !open &&
      <div className={`border-t px-3 py-1.5 ${svc.bgClass} flex items-center justify-between`} style={{ borderTopColor: svc.borderAccent + "30" }}>
          <span className={`text-xs font-medium ${svc.textClass} opacity-80`}>Connected</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      }
    </div>);

};

export { ServiceCard };