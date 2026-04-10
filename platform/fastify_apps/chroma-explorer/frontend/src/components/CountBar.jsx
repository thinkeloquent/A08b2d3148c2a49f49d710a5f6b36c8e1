/**
 * Horizontal count bar — for displaying distributions.
 */
export function CountBar({ label, count, maxCount, color = '#6366f1' }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs w-40 truncate shrink-0"
        style={{ color: '#334155' }}
        title={label}
      >
        {label}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full"
        style={{ background: '#f1f5f9' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="text-xs tabular-nums w-14 text-right shrink-0"
        style={{ color: '#64748b' }}
      >
        {count.toLocaleString()}
      </span>
    </div>
  );
}
