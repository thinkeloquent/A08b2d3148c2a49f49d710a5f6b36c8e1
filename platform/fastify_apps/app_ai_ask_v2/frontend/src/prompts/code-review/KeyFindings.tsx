const KeyFindings = () => (
  <div className="px-4 py-3 border-b border-slate-100">
    <h3 className="text-xs font-bold text-slate-700 mb-2">Key Findings</h3>
    <ol className="space-y-1.5">
      {[
        "Potential structure issues in commenting.",
        "Improve security with debug and logging options.",
        "Estimate suggestions for performance agreement.",
      ].map((f, i) => (
        <li key={i} className="flex gap-2 text-xs text-slate-500 leading-relaxed">
          <span className="text-indigo-500 font-bold flex-shrink-0">{i + 1}.</span>
          {f}
        </li>
      ))}
    </ol>
  </div>
);

export { KeyFindings };
