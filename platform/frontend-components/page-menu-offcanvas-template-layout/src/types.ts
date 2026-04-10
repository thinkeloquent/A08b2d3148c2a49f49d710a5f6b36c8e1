import type { ReactNode, ComponentType } from 'react';
import type {
  HorizontalNavigationProps,
  NavGroup,
  NavItem as HNavItem,
  BrandSlot,
  SearchConfig,
  ActionItem,
  UserAvatar,
  TrailingTab,
  OrgSlot,
  OrgEntry,
  ScopeSlot,
  FqdpScopeSelectorSlot,
} from '@internal/page-horizontal-navigation';

/* ─────────────────── Component Registry ─────────────────── */

/** Base props every registry block component receives */
export interface BaseBlockProps {
  /** Block instance id (from configuration payload) */
  blockId: string;
  /** Any additional config-driven props */
  [key: string]: unknown;
}

/** A frozen object mapping type strings to React component references */
export type ComponentRegistryMap = Readonly<
  Record<string, ComponentType<BaseBlockProps>>
>;

/** A single block definition from a remote configuration payload */
export interface BlockConfig {
  /** Unique instance id (UUID) — used as the React key */
  id: string;
  /** Registry type key — resolved against the ComponentRegistryMap */
  type: string;
  /** Arbitrary props forwarded to the resolved component */
  props?: Record<string, unknown>;
}

/** Region-keyed configuration: each key maps to a layout slot */
export interface RegionConfig {
  /** Blocks rendered in the left nav panel */
  left?: BlockConfig[];
  /** Blocks rendered in the main content area (after prepended children) */
  main?: BlockConfig[];
  /** Blocks rendered inside the right drawer body */
  drawer?: BlockConfig[];
}

/**
 * Regions can be:
 * - a static `RegionConfig` (same panels for every activeId)
 * - a `Record<string, RegionConfig>` (keyed by activeId — panels swap per application)
 */
export type RegionsProp = RegionConfig | Record<string, RegionConfig>;

/* ─────────────────── Theme ─────────────────── */

/** Color tokens for the shell chrome (left sidebar) */
export interface ShellTheme {
  /** Icon rail background color */
  rail: string;
  /** Icon rail hover / active background */
  railHover: string;
  /** Icon rail icon color (inactive) */
  railIcon: string;
  /** Accent color (toggles, highlights) */
  accent: string;
  /** Primary brand color (active nav, buttons) */
  brand: string;
}

/* ─────────────────── Data items (icon rail) ─────────────────── */

/** An icon rail entry */
export interface RailItem {
  /** Unique key */
  key: string;
  /** Icon element */
  icon: ReactNode;
}

/* ─────────────────── Callbacks ─────────────────── */

export interface ShellCallbacks {
  /** Fired when a horizontal navigation item is selected */
  onActiveChange?: (id: string) => void;
  /** Fired when the user avatar is clicked */
  onUserClick?: () => void;
}

/* ─────────────────── Root component ─────────────────── */

export interface PageMenuOffcanvasTemplateLayoutProps {
  /* ── HorizontalNavigation (top header + nav) ── */
  /** Navigation groups passed to HorizontalNavigation */
  groups: HorizontalNavigationProps['groups'];
  /** Currently active horizontal navigation item id */
  activeId: HorizontalNavigationProps['activeId'];
  /** Callback fired when a horizontal navigation item is selected */
  onActiveChange: HorizontalNavigationProps['onActiveChange'];
  /** Organization / workspace selector on the far left of the header. */
  org?: HorizontalNavigationProps['org'];
  /** Scope / hierarchy selector rendered after the org selector. */
  scope?: HorizontalNavigationProps['scope'];
  /** FQDP scope selector — replaces org + scope when provided. */
  fqdpScopeSelector?: HorizontalNavigationProps['fqdpScopeSelector'];
  /**
   * Auto-load organizations from a REST endpoint.
   * When provided, the component fetches orgs and manages the dropdown internally.
   * Takes precedence over `org` for the orgs list and current selection.
   */
  orgConfig?: import('./useOrgLoader').OrgConfig;
  /** Brand / logo area */
  brand?: HorizontalNavigationProps['brand'];
  /** Search / command palette configuration. Pass `false` to disable. */
  search?: HorizontalNavigationProps['search'];
  /** Action buttons in the header (e.g. notifications) */
  actions?: HorizontalNavigationProps['actions'];
  /** User avatar in the header. Pass `false` to hide. */
  user?: HorizontalNavigationProps['user'];
  /** Extra tab(s) rendered after all horizontal nav groups */
  trailingTabs?: TrailingTab[];
  /** Maximum content width for the horizontal nav (default: "1440px") */
  maxWidth?: string;
  /** Additional CSS class for the header */
  headerClassName?: string;

  /* ── Left sidebar (icon rail chrome) ── */
  /** Color theme tokens for the left sidebar */
  theme?: ShellTheme;
  /** Bottom rail items (above avatar) */
  railBottomItems?: RailItem[];
  /** Menu icon element (shown when nav panel is collapsed) */
  menuIcon?: ReactNode;
  /** Close icon element (shown when nav panel is expanded) */
  closeIcon?: ReactNode;
  /** Initial state: left nav panel open */
  defaultLeftOpen?: boolean;

  /* ── Right drawer ── */
  /** Drawer title */
  drawerTitle?: string;
  /** Close icon for the right drawer */
  drawerCloseIcon?: ReactNode;
  /** Controlled drawer open state */
  drawerOpen?: boolean;
  /** Called when the drawer open state changes */
  onDrawerOpenChange?: (open: boolean) => void;
  /** Initial state: right drawer open (uncontrolled mode) */
  defaultRightOpen?: boolean;

  /* ── Content + registry ── */
  /** Component registry mapping type strings to React components */
  registry?: ComponentRegistryMap;
  /**
   * Region-based block configuration for left, main, and drawer panels.
   * - Static `RegionConfig`: same layout for every activeId.
   * - `Record<string, RegionConfig>`: keyed by activeId — panels swap when the active application changes.
   */
  regions?: RegionsProp;
  /** Fallback component rendered when a registry lookup fails */
  fallback?: ComponentType<{ type: string }>;
  /** Main content area — prepended to the main region's dynamic blocks */
  children?: ReactNode;
  /** Additional CSS classes on the root element */
  className?: string;
  /** Font family override */
  fontFamily?: string;
  /** All event callbacks */
  callbacks?: ShellCallbacks;
}

/* ─────────────────── Org loader config ─────────────────── */

export type { OrgConfig } from './useOrgLoader';

/* ─────────────────── Re-exports for consumer convenience ─────────────────── */

export type {
  NavGroup,
  HNavItem,
  BrandSlot,
  SearchConfig,
  ActionItem,
  UserAvatar,
  TrailingTab,
  OrgSlot,
  OrgEntry,
  ScopeSlot,
  FqdpScopeSelectorSlot,
};
