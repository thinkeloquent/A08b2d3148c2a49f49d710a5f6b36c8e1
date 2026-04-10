import { useState } from "react";
import { GitHubIcon } from "@/shared/brand-icons";
import { Icon } from "@/shared/icons";

interface SchemaFile {
  path: string;
  format: "json" | "xml" | "csv" | "yaml" | "proto";
  size: string;
  lastCommit: string;
  issues: number;
}

interface RepoSource {
  repo: string;
  owner: string;
  branch: string;
  files: SchemaFile[];
}

const formatColor: Record<string, string> = {
  json: "bg-amber-100 text-amber-700",
  xml: "bg-blue-100 text-blue-700",
  csv: "bg-emerald-100 text-emerald-700",
  yaml: "bg-purple-100 text-purple-700",
  proto: "bg-slate-100 text-slate-600"
};

const mockRepos: RepoSource[] = [
{
  repo: "platform-core",
  owner: "acme-corp",
  branch: "main",
  files: [
  { path: "api/schemas/user.json", format: "json", size: "4.2 KB", lastCommit: "2d ago", issues: 3 },
  { path: "api/schemas/order.json", format: "json", size: "8.7 KB", lastCommit: "5d ago", issues: 1 },
  { path: "api/schemas/product.json", format: "json", size: "3.1 KB", lastCommit: "1w ago", issues: 0 },
  { path: "config/endpoints.yaml", format: "yaml", size: "1.8 KB", lastCommit: "3d ago", issues: 2 },
  { path: "data/seed/users.csv", format: "csv", size: "12.4 KB", lastCommit: "2w ago", issues: 0 }]

},
{
  repo: "api-gateway",
  owner: "acme-corp",
  branch: "main",
  files: [
  { path: "proto/service.proto", format: "proto", size: "2.6 KB", lastCommit: "1d ago", issues: 0 },
  { path: "schemas/response.json", format: "json", size: "5.9 KB", lastCommit: "4d ago", issues: 4 },
  { path: "schemas/error-codes.json", format: "json", size: "1.2 KB", lastCommit: "1w ago", issues: 0 },
  { path: "config/routes.xml", format: "xml", size: "6.3 KB", lastCommit: "6d ago", issues: 1 }]

},
{
  repo: "data-pipeline",
  owner: "acme-corp",
  branch: "develop",
  files: [
  { path: "schemas/event-payload.json", format: "json", size: "15.2 KB", lastCommit: "1d ago", issues: 6 },
  { path: "schemas/transform-map.json", format: "json", size: "9.4 KB", lastCommit: "3d ago", issues: 2 },
  { path: "config/sources.yaml", format: "yaml", size: "2.1 KB", lastCommit: "1w ago", issues: 0 }]

}];


const RepoSchemaExplorer = () => {
  const [expandedRepo, setExpandedRepo] = useState<string | null>("platform-core");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<"all" | "json" | "yaml" | "xml" | "csv" | "proto">("all");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <GitHubIcon s={18} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Repo Schemas</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all mb-2">
          <span className="text-slate-400">{Icon.search}</span>
          <input
            className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700 bg-transparent"
            placeholder="Search files..." />

        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "json", "yaml", "xml", "csv", "proto"] as const).map((f) =>
          <button
            key={f}
            onClick={() => setFormatFilter(f)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            formatFilter === f ?
            "bg-teal-600 text-white" :
            "bg-slate-50 text-slate-500 hover:bg-slate-100"}`
            }>

              {f.toUpperCase()}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {mockRepos.map((repo) => {
          const filtered = formatFilter === "all" ?
          repo.files :
          repo.files.filter((f) => f.format === formatFilter);
          if (filtered.length === 0) return null;

          return (
            <div key={repo.repo} className="mb-1">
              <button
                onClick={() => setExpandedRepo(expandedRepo === repo.repo ? null : repo.repo)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

                <span className={`text-slate-400 transition-transform ${expandedRepo === repo.repo ? "rotate-90" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-3c1734d8">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </span>
                <span className="text-slate-400">{Icon.repo}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{repo.owner}/{repo.repo}</p>
                  <p className="text-xs text-slate-400">{repo.branch} &middot; {filtered.length} files</p>
                </div>
              </button>

              {expandedRepo === repo.repo &&
              <div className="ml-4">
                  {filtered.map((file) =>
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(selectedFile === file.path ? null : file.path)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${
                  selectedFile === file.path ?
                  "bg-teal-50 border border-teal-200" :
                  "hover:bg-slate-50"}`
                  }>

                      <span className="text-slate-400">{Icon.file}</span>
                      <div className="text-left flex-1 min-w-0">
                        <p className={`text-xs font-medium font-mono truncate ${
                    selectedFile === file.path ? "text-teal-700" : "text-slate-700"}`
                    }>
                          {file.path.split("/").pop()}
                        </p>
                        <p className="text-xs text-slate-400">{file.size} &middot; {file.lastCommit}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {file.issues > 0 &&
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            {file.issues}
                          </span>
                    }
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${formatColor[file.format]}`}>
                          {file.format}
                        </span>
                      </div>
                    </button>
                )}
                </div>
              }
            </div>);

        })}
      </div>

      {selectedFile &&
      <div className="px-3 py-2.5 border-t border-slate-100 bg-teal-50/50">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{Icon.file}</span>
            <span className="text-xs text-teal-700 font-medium font-mono flex-1 truncate">{selectedFile}</span>
            <span className="text-xs text-teal-600 bg-white border border-teal-200 px-2 py-0.5 rounded-md font-semibold">
              Selected
            </span>
          </div>
        </div>
      }
    </div>);

};

export { RepoSchemaExplorer };