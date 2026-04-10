interface BreadcrumbProps {
  repoKey: string;
  path: string[];
  onNavigate: (index: number) => void;
}

export function Breadcrumb({ repoKey, path, onNavigate }: BreadcrumbProps) {
  return (
    <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-1 bg-white flex-wrap">
      <button
        onClick={() => onNavigate(0)}
        className="text-indigo-600 text-[13px] font-medium hover:underline"
      >
        {repoKey}
      </button>
      {path.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="text-slate-300">/</span>
          <button
            onClick={() => onNavigate(i + 1)}
            className={`text-[13px] hover:underline ${
              i === path.length - 1 ? 'text-slate-800 font-semibold' : 'text-indigo-600 font-medium'
            }`}
          >
            {seg}
          </button>
        </span>
      ))}
    </div>
  );
}
