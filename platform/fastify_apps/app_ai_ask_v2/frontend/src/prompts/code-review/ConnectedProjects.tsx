const ConnectedProjects = () =>
<div className="px-4 pt-5 pb-3 border-b border-slate-100">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Connected Projects</p>
    {[
  { name: "repo name", sub: "repo-name-name" },
  { name: "repo name", sub: "repo-name-nampreos" }].
  map((r, i) =>
  <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors mb-0.5">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" data-test-id="svg-d0249c1b">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <div>
          <p className="text-xs font-medium text-slate-700">{r.name}</p>
          <p className="text-xs text-slate-400">{r.sub}</p>
        </div>
      </div>
  )}
  </div>;


export { ConnectedProjects };