const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full min-h-[120px]">
    <div className="text-center">
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      <p className="text-xs text-slate-300 mt-1">Coming soon</p>
    </div>
  </div>
);

export { Placeholder };
