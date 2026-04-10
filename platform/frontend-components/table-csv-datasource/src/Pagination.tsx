import type { PaginationProps } from './types';

export function Pagination({ offset, limit, total, onOffsetChange, className }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) return null;

  return (
    <div className={['flex items-center justify-between pt-1', className].filter(Boolean).join(' ')}>
      <p className="text-xs text-slate-400">
        Page {currentPage} of {totalPages} &middot; {total.toLocaleString()} total rows
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onOffsetChange(offset + limit)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
