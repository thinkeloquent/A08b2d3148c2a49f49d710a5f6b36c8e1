import { ExternalLink } from "lucide-react";

export function AppCard({ app }) {
  return (
    <a
      href={app.path}
      className="group block bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">
          {app.name}
        </h3>
        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
      </div>

      <code className="text-xs text-slate-400 block truncate">
        {app.folder}
      </code>
    </a>
  );
}
