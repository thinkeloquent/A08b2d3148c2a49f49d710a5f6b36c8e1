/**
 * Error state display component.
 */
export function ErrorState({ error, onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl"
      style={{
        background: '#fef2f2',
        border: '1px dashed #fca5a5',
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <span className="text-xs" style={{ color: '#dc2626' }}>
        {error?.message || 'An error occurred'}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[10px] px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: '#ffffff',
            color: '#dc2626',
            border: '1px solid #fca5a5',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
