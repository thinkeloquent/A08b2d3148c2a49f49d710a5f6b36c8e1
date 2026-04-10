/**
 * Light card container with subtle border and shadow.
 */
export function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
