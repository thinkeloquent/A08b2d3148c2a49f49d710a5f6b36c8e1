import { useState } from "react";
import { Icon } from "@/shared/icons";

const ConfluencePanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ title: string; space: string; updated: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const mock = [
    { title: "Frontend Architecture Guide", space: "Engineering", updated: "3d ago" },
    { title: "Code Review Standards", space: "Engineering", updated: "1w ago" },
    { title: "API Integration Patterns", space: "Platform", updated: "2w ago" },
  ];
  const doSearch = () => { setLoading(true); setTimeout(() => { setResults(mock); setLoading(false); }, 500); };
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
          <span className="text-slate-400">{Icon.search}</span>
          <input className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700" placeholder="Search documentation..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
        </div>
        <button onClick={doSearch} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
          {loading ? Icon.loader : Icon.doc} Search
        </button>
      </div>
      {results.map((d, i) => (
        <div key={i} className="flex items-start gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-sky-300 cursor-pointer transition-colors shadow-sm">
          <span className="text-sky-500 mt-0.5">{Icon.doc}</span>
          <div>
            <p className="text-xs font-medium text-slate-700">{d.title}</p>
            <p className="text-xs text-slate-400">{d.space} · {d.updated}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export { ConfluencePanel };
