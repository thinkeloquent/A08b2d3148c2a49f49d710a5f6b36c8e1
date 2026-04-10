/**
 * Small badge for displaying metadata key-value pairs.
 */
export function MetadataBadge({ label, color = 'cyan' }) {
  const colors = {
    cyan: { bg: '#ecfeff', text: '#0e7490' },
    violet: { bg: '#ede9fe', text: '#6d28d9' },
    emerald: { bg: '#ecfdf5', text: '#047857' },
    amber: { bg: '#fffbeb', text: '#b45309' },
    slate: { bg: '#f1f5f9', text: '#475569' },
  };
  const c = colors[color] || colors.slate;
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}
