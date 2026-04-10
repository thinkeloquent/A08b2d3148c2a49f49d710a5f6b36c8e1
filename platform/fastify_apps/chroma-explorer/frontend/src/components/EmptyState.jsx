/**
 * Empty state placeholder.
 */
export function EmptyState({ message = 'No results', subMessage }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-xl gap-2"
      style={{
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
      }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <span className="text-xs" style={{ color: '#64748b' }}>
        {message}
      </span>
      {subMessage && (
        <span className="text-[10px]" style={{ color: '#94a3b8' }}>
          {subMessage}
        </span>
      )}
    </div>
  );
}
