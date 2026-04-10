import { useMemo, useState } from 'react';
import type { PaginationCalculatorProps, PaginationInfo } from './types';

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function usePagination(total: number, offset: number, pageSize: number, selectedPage: number): PaginationInfo {
  return useMemo(() => {
    const effectiveRecords = Math.max(0, total - offset);
    const totalPages = pageSize > 0 ? Math.ceil(effectiveRecords / pageSize) : 0;
    const currentPage = clamp(selectedPage, 1, Math.max(totalPages, 1));
    const currentOffset = offset + (currentPage - 1) * pageSize;
    const currentEnd = Math.min(currentOffset + pageSize - 1, total - 1);
    const currentCount = Math.max(0, currentEnd - currentOffset + 1);
    const lastPageSize = effectiveRecords > 0 ? effectiveRecords - (totalPages - 1) * pageSize : 0;
    return { totalPages, currentPage, effectiveRecords, currentOffset, currentEnd, currentCount, lastPageSize };
  }, [total, offset, pageSize, selectedPage]);
}

export function PaginationCalculator({
  total,
  offset = 0,
  pageSize = 25,
  icon,
  title = 'Pagination',
  onOffsetChange,
  onPageSizeChange,
  className,
}: PaginationCalculatorProps) {
  const [selectedPage, setSelectedPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [sizeInput, setSizeInput] = useState(String(pageSize));
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const info = usePagination(total, offset, currentPageSize, selectedPage);

  const goTo = (page: number) => {
    const p = clamp(page, 1, info.totalPages || 1);
    setSelectedPage(p);
    setPageInput(String(p));
    onOffsetChange?.(offset + (p - 1) * currentPageSize);
  };

  const commitPageInput = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed)) {
      goTo(parsed);
    } else {
      setPageInput(String(info.currentPage));
    }
  };

  const commitSizeInput = () => {
    const parsed = parseInt(sizeInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setCurrentPageSize(parsed);
      setSizeInput(String(parsed));
      setSelectedPage(1);
      setPageInput('1');
      onOffsetChange?.(offset);
      onPageSizeChange?.(parsed);
    } else {
      setSizeInput(String(currentPageSize));
    }
  };

  const baseClass = 'rounded-xl border border-slate-200 bg-white shadow-sm';

  return (
    <div className={[baseClass, className].filter(Boolean).join(' ')}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100">
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{title}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 text-center py-2.5">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</div>
          <div className="text-sm font-bold tabular-nums text-slate-800">{total.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pages</div>
          <div className="text-sm font-bold tabular-nums text-indigo-600">{info.totalPages.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Size</div>
          <input
            type="text"
            inputMode="numeric"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onBlur={commitSizeInput}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="w-14 mx-auto text-center text-sm font-bold tabular-nums text-slate-800 bg-slate-50 border border-slate-200
              rounded px-1 py-0.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 block"
          />
        </div>
      </div>

      {/* Current page nav */}
      {info.totalPages > 0 && (
        <div className="px-3.5 py-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              Page
              <input
                type="text"
                inputMode="numeric"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={commitPageInput}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                className="w-10 text-center font-semibold text-slate-600 bg-slate-50 border border-slate-200
                  rounded px-1 py-0.5 text-[11px] focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200
                  tabular-nums"
              />
              of {info.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goTo(info.currentPage - 1)}
                disabled={info.currentPage <= 1}
                className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center
                  hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-30 transition-all text-xs"
              >
                ‹
              </button>
              <button
                onClick={() => goTo(info.currentPage + 1)}
                disabled={info.currentPage >= info.totalPages}
                className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center
                  hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-30 transition-all text-xs"
              >
                ›
              </button>
            </div>
          </div>

          {/* Offset / range detail */}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="tabular-nums">
              offset <span className="font-medium text-slate-600">{info.currentOffset}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="tabular-nums">
              rows <span className="font-medium text-slate-600">{info.currentOffset}–{info.currentEnd}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="tabular-nums">
              count <span className="font-medium text-indigo-600">{info.currentCount}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
