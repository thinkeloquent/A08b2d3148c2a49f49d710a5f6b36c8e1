import { useState } from "react";
import { GitHubIcon } from "@/shared/brand-icons";
import { Icon } from "@/shared/icons";

interface Repo {
  name: string;
  owner: string;
  language: string;
  stars: number;
  visibility: "public" | "private";
}

const mockRepos: Repo[] = [
  { name: "platform-core", owner: "acme-corp", language: "TypeScript", stars: 142, visibility: "private" },
  { name: "design-system", owner: "acme-corp", language: "TypeScript", stars: 89, visibility: "public" },
  { name: "api-gateway", owner: "acme-corp", language: "Go", stars: 67, visibility: "private" },
  { name: "data-pipeline", owner: "acme-corp", language: "Python", stars: 34, visibility: "private" },
  { name: "mobile-app", owner: "acme-corp", language: "Swift", stars: 21, visibility: "private" },
  { name: "docs-site", owner: "acme-corp", language: "MDX", stars: 12, visibility: "public" },
];

const langColor: Record<string, string> = {
  TypeScript: "#3178c6",
  Go: "#00add8",
  Python: "#3572a5",
  Swift: "#f05138",
  MDX: "#fcb32c",
};

const RepoExplorer = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = query.trim()
    ? mockRepos.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
    : mockRepos;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <GitHubIcon s={18} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Repositories</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
          <span className="text-slate-400">{Icon.search}</span>
          <input
            className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700 bg-transparent"
            placeholder="Search repositories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.map((repo) => (
          <button
            key={repo.name}
            onClick={() => setSelected(selected === repo.name ? null : repo.name)}
            className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors mb-0.5 text-left ${
              selected === repo.name
                ? "bg-slate-100 border border-slate-300"
                : "hover:bg-slate-50"
            }`}
          >
            <span className="text-slate-400 mt-0.5">{Icon.repo}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className={`text-xs font-semibold truncate ${
                  selected === repo.name ? "text-slate-800" : "text-slate-700"
                }`}>
                  {repo.owner}/{repo.name}
                </p>
                {repo.visibility === "public" && (
                  <span className="text-xs text-slate-400 border border-slate-200 rounded-full px-1.5 py-0 leading-4 flex-shrink-0">
                    public
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: langColor[repo.language] || "#94a3b8" }} />
                  {repo.language}
                </span>
                <span className="text-xs text-slate-400">
                  {repo.stars} stars
                </span>
              </div>
            </div>
            {selected === repo.name && <span className="text-slate-600 mt-0.5">{Icon.check}</span>}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">No repositories match your search</p>
        )}
      </div>

      {selected && (
        <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">{Icon.repo}</span>
            <span className="text-xs text-slate-700 font-medium flex-1 truncate">{selected}</span>
            <span className="text-xs text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold">
              Selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export { RepoExplorer };
