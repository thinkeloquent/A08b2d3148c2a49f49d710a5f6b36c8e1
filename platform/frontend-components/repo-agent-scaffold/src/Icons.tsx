import type { SVGProps } from 'react';

type IconName =
  | 'folder'
  | 'folderOpen'
  | 'file'
  | 'search'
  | 'terminal'
  | 'download'
  | 'copy'
  | 'grid'
  | 'layers'
  | 'lock'
  | 'globe'
  | 'users'
  | 'tag'
  | 'chevronRight'
  | 'chevronDown'
  | 'x'
  | 'check'
  | 'zap'
  | 'box'
  | 'cpu'
  | 'sparkles';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, JSX.Element> = {
  folder: (
    <path
      d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  folderOpen: (
    <>
      <path
        d="M5 19l2.757-7.351A1 1 0 018.693 11H21a1 1 0 01.986 1.164l-.996 5.211A1 1 0 0120.014 18H6a1 1 0 01-.986-.836z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  file: (
    <path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  terminal: (
    <>
      <polyline points="4 17 10 11 4 5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="19" x2="20" y2="19" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 17 12 22 22 17" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 12 12 17 22 12" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  tag: (
    <path
      d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  chevronRight: (
    <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  chevronDown: (
    <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  check: (
    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
  ),
  zap: (
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  box: (
    <>
      <path
        d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="22.08" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  cpu: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="9" width="6" height="6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="1" x2="9" y2="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15" y1="1" x2="15" y2="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="20" x2="9" y2="23" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15" y1="20" x2="15" y2="23" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="20" y1="9" x2="23" y2="9" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="20" y1="14" x2="23" y2="14" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="9" x2="4" y2="9" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="14" x2="4" y2="14" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  sparkles: (
    <>
      <path
        d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
};

function Icon({ name, size = 16, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export { Icon };
export type { IconName, IconProps };
