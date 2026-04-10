import { useState } from "react";
import { Icon } from "@/shared/icons";
import { Tag } from "@/shared/components";

const GitHubPanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ name: string; branch: string; stars: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState<string[]>([]);
  const mock = [
    { name: "org/frontend-app", branch: "main", stars: 48 },
    { name: "org/api-gateway", branch: "develop", stars: 32 },
    { name: "org/design-system", branch: "main", stars: 91 },
    { name: "org/ml-pipeline", branch: "feature/v2", stars: 17 },
  ];
  const doSearch = () => {
    setLoading(true);
    setTimeout(() => { setResults(query.trim() ? mock.filter((r) => r.name.includes(query.toLowerCase())) : mock); setLoading(false); }, 500);
  };
  const toggle = (r: { name: string }) => setLinked((l) => l.includes(r.name) ? l.filter((x) => x !== r.name) : [...l, r.name]);
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
          <span className="text-slate-400">{Icon.search}</span>
          <input className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700" placeholder="Search repositories..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
        </div>
        <button onClick={doSearch} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
          {loading ? Icon.loader : Icon.repo} Lookup
        </button>
      </div>
      {results.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-2.5 px-3 py-2 border-b border-slate-100 last:border-0 ${linked.includes(r.name) ? "bg-slate-50" : "bg-white"}`}>
              <span className="text-slate-400">{Icon.repo}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-semibold text-slate-700">{r.name}</p>
                <p className="text-xs text-slate-400">branch: {r.branch} · ★ {r.stars}</p>
              </div>
              <button onClick={() => toggle(r)} className={`text-xs px-2 py-0.5 rounded-md font-semibold transition-colors flex-shrink-0 ${linked.includes(r.name) ? "bg-slate-200 text-slate-600" : "bg-slate-800 text-white hover:bg-slate-700"}`}>
                {linked.includes(r.name) ? "Linked" : "Link"}
              </button>
            </div>
          ))}
        </div>
      )}
      {linked.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {linked.map((l) => <Tag key={l} label={l} onRemove={() => setLinked((p) => p.filter((x) => x !== l))} />)}
        </div>
      )}
    </div>
  );
};

export { GitHubPanel };
