import { useState } from "react";
import { Icon } from "@/shared/icons";

interface MockFile { name: string; type: string; updated: string }

const FigmaPanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MockFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MockFile | null>(null);
  const mock: MockFile[] = [
    { name: "Design System v3", type: "File", updated: "2h ago" },
    { name: "Onboarding Flow", type: "Frame", updated: "Yesterday" },
    { name: "Dashboard Components", type: "File", updated: "3d ago" },
    { name: "Mobile Prototype", type: "Prototype", updated: "1w ago" },
  ];
  const doSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => { setResults(mock.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))); setLoading(false); }, 600);
  };
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <span className="text-slate-400">{Icon.search}</span>
          <input className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700" placeholder="Search Figma files..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
        </div>
        <button onClick={doSearch} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
          {loading ? Icon.loader : Icon.search} Lookup
        </button>
      </div>
      {results.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {results.map((f, i) => (
            <button key={i} onClick={() => setSelected(selected?.name === f.name ? null : f)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-orange-50/60 transition-colors border-b border-slate-100 last:border-0 ${selected?.name === f.name ? "bg-orange-50" : "bg-white"}`}>
              <span className="text-slate-400">{Icon.file}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-700">{f.name}</p>
                <p className="text-xs text-slate-400">{f.type} · {f.updated}</p>
              </div>
              {selected?.name === f.name && <span className="text-orange-500 font-bold">{Icon.check}</span>}
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-orange-500">{Icon.file}</span>
          <span className="text-xs text-orange-700 font-medium flex-1">{selected.name}</span>
          <span className="text-xs text-orange-600 bg-white border border-orange-200 px-2 py-0.5 rounded-md font-semibold">Linked</span>
        </div>
      )}
    </div>
  );
};

export { FigmaPanel };
