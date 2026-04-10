/**
 * Pagination controls component.
 */
export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const btnStyle = (active) => ({
    background: active ? '#eef2ff' : '#ffffff',
    border: `1px solid ${active ? '#a5b4fc' : '#e2e8f0'}`,
    color: active ? '#4f46e5' : '#64748b',
  });

  // Build page range
  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-1.5 justify-center mt-4">
      <button
        onClick={() => canPrev && onPage(page - 1)}
        disabled={!canPrev}
        className="px-3 py-1.5 rounded-lg text-xs transition-all"
        style={btnStyle(false)}
      >
        ‹ Prev
      </button>

      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPage(1)}
            className="w-8 h-8 rounded-lg text-xs transition-all"
            style={btnStyle(page === 1)}
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="text-xs" style={{ color: '#94a3b8' }}>
              …
            </span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className="w-8 h-8 rounded-lg text-xs transition-all"
          style={btnStyle(p === page)}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-xs" style={{ color: '#94a3b8' }}>
              …
            </span>
          )}
          <button
            onClick={() => onPage(totalPages)}
            className="w-8 h-8 rounded-lg text-xs transition-all"
            style={btnStyle(page === totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => canNext && onPage(page + 1)}
        disabled={!canNext}
        className="px-3 py-1.5 rounded-lg text-xs transition-all"
        style={btnStyle(false)}
      >
        Next ›
      </button>

      <span className="text-[10px] ml-2" style={{ color: '#94a3b8' }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
