import { useState } from "react";
import { Icon } from "@/shared/icons";
import { Tag } from "@/shared/components";

const JiraPanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ key: string; title: string; status: string; priority: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [pinned, setPinned] = useState<string[]>([]);
  const mock = [
    { key: "PROJ-1042", title: "Refactor ReviewList component", status: "In Progress", priority: "High" },
    { key: "PROJ-1038", title: "Fix pagination bug in data table", status: "Open", priority: "Medium" },
    { key: "PROJ-997", title: "Add performance monitoring hooks", status: "Done", priority: "High" },
    { key: "PROJ-1051", title: "Update API response caching", status: "Open", priority: "Low" },
  ];
  const pColor: Record<string, string> = { High: "text-red-500", Medium: "text-amber-500", Low: "text-slate-400" };
  const sBg: Record<string, string> = { "In Progress": "bg-blue-100 text-blue-700", Open: "bg-slate-100 text-slate-600", Done: "bg-emerald-100 text-emerald-700" };
  const doSearch = () => {
    setLoading(true);
    setTimeout(() => { setResults(query.trim() ? mock.filter((t) => t.key.includes(query.toUpperCase()) || t.title.toLowerCase().includes(query.toLowerCase())) : mock); setLoading(false); }, 500);
  };
  const toggle = (k: string) => setPinned((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]);
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <span className="text-slate-400">{Icon.search}</span>
          <input className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700" placeholder="PROJ-1234 or keyword..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
        </div>
        <button onClick={doSearch} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
          {loading ? Icon.loader : Icon.ticket} Lookup
        </button>
      </div>
      {results.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {results.map((t, i) => (
            <div key={i} className={`flex items-start gap-2 px-3 py-2 border-b border-slate-100 last:border-0 ${pinned.includes(t.key) ? "bg-blue-50/60" : "bg-white"}`}>
              <span className="text-slate-400 mt-0.5">{Icon.ticket}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-blue-600 font-mono">{t.key}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${sBg[t.status]}`}>{t.status}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 truncate">{t.title}</p>
                <p className={`text-xs font-medium mt-0.5 ${pColor[t.priority]}`}>↑ {t.priority}</p>
              </div>
              <button onClick={() => toggle(t.key)} className={`text-xs px-2 py-0.5 rounded font-semibold mt-0.5 flex-shrink-0 transition-colors ${pinned.includes(t.key) ? "bg-blue-100 text-blue-700" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                {pinned.includes(t.key) ? "Pinned" : "Pin"}
              </button>
            </div>
          ))}
        </div>
      )}
      {pinned.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pinned.map((k) => <Tag key={k} label={k} onRemove={() => setPinned((p) => p.filter((x) => x !== k))} />)}
        </div>
      )}
    </div>
  );
};

export { JiraPanel };
