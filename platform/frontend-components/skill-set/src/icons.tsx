/** Internal SVG icon components — not exported from package index */

interface IconProps {
  size?: number;
  className?: string;
}

export function GridIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function BagIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M2 5h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 5V3.5A2.5 2.5 0 017.5 1h1A2.5 2.5 0 0111 3.5V5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function BookIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M2 2h4.5a1.5 1.5 0 011.5 1.5v10S7 12 4.5 12H2V2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M14 2H9.5A1.5 1.5 0 008 3.5v10s1-1.5 3.5-1.5H14V2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function SearchIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DlIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M7 1v8m0 0L4 6.5M7 9l3-2.5M2 11.5h10"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.3 3.3 12.3l.7-4.1-3-2.9 4.2-.7L7 1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className}>
      <path
        d="M2.5 6.5L5 9l4.5-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XIcon({ size = 10, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" className={className}>
      <path
        d="M2 2l6 6M8 2l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevIcon({ size = 10, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" className={className}>
      <path
        d="M3 1l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TermIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M3.5 5.5L5.5 7 3.5 8.5M7 8.5h3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CopyIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 2H3a1 1 0 00-1 1v7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function EmptyBoxIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <rect
        x="8"
        y="12"
        width="32"
        height="28"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
      <path
        d="M8 20h32"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
      <path
        d="M20 20v-8h8v8"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
    </svg>
  );
}
