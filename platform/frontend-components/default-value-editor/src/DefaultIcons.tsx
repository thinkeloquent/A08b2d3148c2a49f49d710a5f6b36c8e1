/** Built-in SVG icons used as defaults when no icon slots are provided */

const Icon = ({ d, size = 18, className = '' }: { d: string; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

export const DefaultIcons = {
  trash: (size = 14) => <Icon size={size} d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />,
  plus: (size = 16) => <Icon size={size} d="M12 5v14M5 12h14" />,
  search: (size = 16, className = '') => <Icon size={size} className={className} d="M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35" />,
  grip: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <circle cx="5" cy="3" r="1.2" /><circle cx="11" cy="3" r="1.2" />
      <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="13" r="1.2" /><circle cx="11" cy="13" r="1.2" />
    </svg>
  ),
  check: (size = 15) => <Icon size={size} d="M20 6L9 17l-5-5" />,
  close: (size = 14) => <Icon size={size} d="M18 6L6 18M6 6l12 12" />,
  edit: (size = 14) => <Icon size={size} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />,
  copy: (size = 16) => <Icon size={size} d="M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />,
  download: (size = 16) => <Icon size={size} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  upload: (size = 16) => <Icon size={size} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  info: (size = 22, className = '') => <Icon size={size} className={className} d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4M12 8h.01" />,
};
