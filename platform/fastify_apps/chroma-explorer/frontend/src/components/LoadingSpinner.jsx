/**
 * Inline loading spinner.
 */
export function LoadingSpinner({ size = 16, color = '#6366f1' }) {
  return (
    <div
      className="border-2 border-t-transparent rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        borderColor: `${color} transparent transparent transparent`,
      }}
    />
  );
}

/**
 * Full-area loading state.
 */
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <LoadingSpinner size={24} />
      <span className="text-xs" style={{ color: '#64748b' }}>
        {message}
      </span>
    </div>
  );
}
