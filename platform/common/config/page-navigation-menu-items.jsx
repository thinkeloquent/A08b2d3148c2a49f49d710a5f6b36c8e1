/**
 * Shared shell JSX configuration for PageMenuOffcanvasTemplateLayout.
 * Icons, trailing tabs, rail items, and user avatar used by all apps.
 */

import { SHELL_GROUPS as SHELL_GROUPS_DATA } from './page-navigation-menu-items.mjs';

/* ─── Inline SVG icon helpers ─── */
const Svg = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {children}
  </svg>
);

const NavIcon = ({ children }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const icons = {
  bell: <Svg size={18}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></Svg>,
  panelRight: <Svg size={18}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="15" y1="3" x2="15" y2="21" /></Svg>,
  settings: <Svg size={18}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></Svg>,
  closeSm: <Svg size={16}><path d="M18 6L6 18M6 6l12 12" /></Svg>,
  panelLeftClose: <Svg size={20}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="m16 15-3-3 3-3" /></Svg>,
  panelRightClose: <Svg size={20}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m8 9 3 3-3 3" /></Svg>,
};

/* ─── Nav item icons (keyed by item id) ─── */
export const navIcons = {
  overview: <NavIcon><rect x="1.5" y="1.5" width="5" height="5" rx="1" /><rect x="9.5" y="1.5" width="5" height="5" rx="1" /><rect x="1.5" y="9.5" width="5" height="5" rx="1" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /></NavIcon>,
  workflows: <NavIcon><circle cx="3" cy="8" r="2" /><circle cx="13" cy="4" r="2" /><circle cx="13" cy="12" r="2" /><path d="M5 7.2L11 4.8M5 8.8L11 11.2" /></NavIcon>,
  activity: <NavIcon><polyline points="1,8 4,8 6,3 8,13 10,6 12,8 15,8" /></NavIcon>,
  insights: <NavIcon><path d="M2 14V7M6 14V4M10 14V9M14 14V2" /></NavIcon>,
  settings: <NavIcon><circle cx="8" cy="8" r="2.5" /><path d="M8 1V3M8 13V15M1 8H3M13 8H15M2.9 2.9L4.3 4.3M11.7 11.7L13.1 13.1M13.1 2.9L11.7 4.3M4.3 11.7L2.9 13.1" /></NavIcon>,
};

/**
 * SHELL_GROUPS enriched with icons from navIcons.
 * Use this instead of the plain SHELL_GROUPS from .mjs when rendering navigation.
 */
export const SHELL_GROUPS = SHELL_GROUPS_DATA.map((group) => ({
  ...group,
  items: group.items.map((item) => ({
    ...item,
    icon: navIcons[item.id] ?? item.icon,
  })),
}));

export const SHELL_TRAILING_TABS = [
  { id: 'settings', label: 'Settings', icon: navIcons.settings },
];

export const SHELL_SEARCH = { placeholder: 'Search pages...' };

export const SHELL_RAIL_BOTTOM = [];

export const SHELL_ORG = {
  name: 'ThinkEloquent',
  initial: 'R',
  color: 'bg-purple-600',
  createHref: '/apps/fqdp_management_system/organizations/new',
  manageHref: '/apps/fqdp_management_system/organizations/',
};

export const SHELL_USER = {
  icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5.5" r="3" />
      <path d="M2.5 14.5C2.5 11.5 5 9.5 8 9.5S13.5 11.5 13.5 14.5" />
    </svg>
  ),
};
