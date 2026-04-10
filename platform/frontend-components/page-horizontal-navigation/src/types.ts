import type { ReactNode } from 'react';
import type { ScopeSelectorProps } from '@internal/scope-selector';

/* ── Nav item data ── */

/** A single navigation item within a group. */
export interface NavItem {
  /** Unique identifier for this item. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional icon rendered before the label — accepts any ReactNode (SVG, icon component, etc.). */
  icon?: ReactNode;
  /** Optional badge — number for a count pill, string for a text badge (e.g. "New"). */
  badge?: number | string;
}

/** A group of navigation items. The first group is rendered as inline tabs; subsequent groups become dropdown menus. */
export interface NavGroup {
  /** Unique identifier for this group. */
  id: string;
  /** Group label shown on the dropdown trigger. Not used for the first (core) group. */
  label?: string;
  /** Navigation items in this group. */
  items: NavItem[];
}

/* ── Org slot ── */

/** An entry in the org switcher dropdown. */
export interface OrgEntry {
  /** Unique identifier for the organization. */
  id: string;
  /** Display name. */
  name: string;
  /** Single-character initial rendered in the colored circle. Defaults to first letter of name. */
  initial?: string;
  /** Background color class for the circle (e.g. "bg-purple-600"). */
  color?: string;
  /** Organization status (e.g. "active", "archived"). */
  status?: string;
}

/** Organization selector rendered at the far left of the header. */
export interface OrgSlot {
  /** Display name of the current org / workspace. */
  name: string;
  /** Single-character initial or icon rendered in the colored circle. */
  initial?: string;
  /** Optional icon rendered instead of the initial. */
  icon?: ReactNode;
  /** Background color class for the circle (e.g. "bg-purple-600"). Defaults to "bg-purple-600". */
  color?: string;
  /** Click handler — typically opens an org-switcher dropdown. */
  onClick?: () => void;
  /** List of available organizations for the dropdown. */
  orgs?: OrgEntry[];
  /** Called when the user selects a different organization. */
  onOrgChange?: (id: string) => void;
  /** URL for "Create organization" link. */
  createHref?: string;
  /** URL for "Manage organizations" link. */
  manageHref?: string;
  /** Refetch the organization list from the API. */
  onRefresh?: () => void;
}

/* ── Scope slot ── */

/** A single item in the scope/hierarchy selector (e.g. Organizations, Workspaces, Teams). */
export interface ScopeItem {
  /** Unique identifier for this scope level. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
}

/** Configuration for the scope/hierarchy dropdown rendered after the org selector. */
export interface ScopeSlot {
  /** Scope items to display in the dropdown. When omitted the built-in 6-level hierarchy is used. */
  items?: ScopeItem[];
  /** Currently selected scope id. */
  activeId?: string;
  /** Called when the user selects a scope. */
  onScopeChange?: (id: string) => void;
}

/* ── FQDP Scope Selector slot ── */

/** Configuration for the FQDP scope selector rendered at the far left of the header.
 *  When provided, replaces both the `org` and `scope` slots with a single ScopeSelector
 *  populated from the FQDP Management System API. */
export type FqdpScopeSelectorSlot = Omit<ScopeSelectorProps, 'className'>;

/* ── Brand slot ── */

/** Brand / logo area rendered at the far left of the top bar. */
export interface BrandSlot {
  /** Brand icon — typically a small SVG or image. */
  icon?: ReactNode;
  /** Application name. */
  name: string;
  /** Optional version or environment badge text. */
  badge?: string;
}

/* ── Search slot ── */

/** Configuration for the built-in command palette / search overlay. */
export interface SearchConfig {
  /** Placeholder text in the search trigger button and input. */
  placeholder?: string;
  /** Keyboard shortcut label shown in the trigger (e.g. "K"). */
  shortcutLabel?: string;
  /** Keyboard shortcut modifier symbol (e.g. "⌘"). */
  shortcutModifier?: string;
}

/* ── Trailing action item ── */

/** An action button rendered in the top-right area (e.g. notifications, settings). */
export interface ActionItem {
  /** Unique key for React rendering. */
  id: string;
  /** Icon ReactNode for the button. */
  icon: ReactNode;
  /** Accessible label for the button. */
  ariaLabel: string;
  /** Click handler. */
  onClick?: () => void;
  /** Optional notification dot. */
  showDot?: boolean;
}

/* ── User avatar ── */

/** User avatar rendered at the far right of the top bar. */
export interface UserAvatar {
  /** Display initials (e.g. "JD"). */
  initials?: string;
  /** Optional icon rendered instead of initials. */
  icon?: ReactNode;
  /** Optional gradient start color class (e.g. "from-amber-400"). */
  gradientFrom?: string;
  /** Optional gradient end color class (e.g. "to-orange-500"). */
  gradientTo?: string;
}

/* ── Trailing tab ── */

/** An extra tab rendered after all groups, separated by a divider (e.g. Settings). */
export interface TrailingTab {
  /** Unique id — used as the activeId value when selected. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional icon. */
  icon?: ReactNode;
}

/* ── Nav sub-component props (just the tab row) ── */

/** Props for `HorizontalNavigation.Nav`. Renders only the tab navigation row.
 *  When used inside `<HorizontalNavigation>`, groups/activeId/onActiveChange are read from context. */
export interface NavProps {
  /** Navigation groups — required standalone, optional inside compound parent. */
  groups?: NavGroup[];
  /** Currently active item id — required standalone, optional inside compound parent. */
  activeId?: string;
  /** Callback fired when a navigation item is selected — required standalone, optional inside compound parent. */
  onActiveChange?: (id: string) => void;
  /** Extra tab(s) rendered after all groups, separated by a divider. */
  trailingTabs?: TrailingTab[];
  /** Additional CSS class for the nav element. */
  className?: string;
  /** Maximum content width (default: "1440px"). Overrides parent value when inside compound. */
  maxWidth?: string;
}

/* ── Main compound component props ── */

/** Props for the HorizontalNavigation compound parent. Renders the top bar (brand, search, actions, user),
 *  places `<HorizontalNavigation.Nav>` inside the header, and renders remaining children as page content. */
export interface HorizontalNavigationProps {
  /** Navigation groups. */
  groups: NavGroup[];
  /** Currently active item id. */
  activeId: string;
  /** Callback fired when a navigation item is selected. */
  onActiveChange: (id: string) => void;
  /** Organization / workspace selector on the far left. */
  org?: OrgSlot;
  /** Scope / hierarchy selector rendered after the org selector. */
  scope?: ScopeSlot;
  /** FQDP scope selector — replaces org + scope when provided. */
  fqdpScopeSelector?: FqdpScopeSelectorSlot;
  /** Brand / logo area configuration. */
  brand?: BrandSlot;
  /** Search / command palette configuration. Pass `false` to disable. */
  search?: SearchConfig | false;
  /** Action buttons rendered in the top-right area. */
  actions?: ActionItem[];
  /** User avatar configuration. Pass `false` to hide. */
  user?: UserAvatar | false;
  /** Content — typically `<HorizontalNavigation.Nav />` followed by page content. */
  children?: ReactNode;
  /** Additional CSS class for the outermost wrapper. */
  className?: string;
  /** Additional CSS class for the header element. */
  headerClassName?: string;
  /** Maximum content width (default: "1440px"). */
  maxWidth?: string;
}

/* ── Dropdown sub-component props ── */

export interface NavDropdownProps {
  label: string;
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/* ── Command palette sub-component props ── */

export interface CommandPaletteProps {
  /** Whether the palette is open. */
  open: boolean;
  /** Called to close the palette. */
  onClose: () => void;
  /** Called when an item is selected. */
  onSelect: (id: string) => void;
  /** All searchable items — flattened from groups. */
  items: CommandPaletteItem[];
  /** Search input placeholder. */
  placeholder?: string;
  /** Additional CSS class on the modal container. */
  className?: string;
}

export interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: ReactNode;
  group: string;
}
