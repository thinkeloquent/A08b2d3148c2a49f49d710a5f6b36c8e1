import type { ReactNode } from 'react';

/** A single navigation link item */
export interface DevEnvUrlSwitcherNavLink {
  /** The URL/path to navigate to */
  url: string;
  /** Display name for the link */
  name: string;
}

/** Props for a single nav item rendered inside the bar */
export interface NavItemProps {
  /** The link item to render */
  item: DevEnvUrlSwitcherNavLink;
  /** Whether this item is currently active */
  active?: boolean;
  /** Called when the item is clicked */
  onNavigate: (url: string) => void;
  /** Element type to render as (e.g. 'a', Link) */
  as?: React.ElementType;
  /** Optional CSS class */
  className?: string;
}

/** Props for the DevEnvUrlSwitcherNav component */
export interface DevEnvUrlSwitcherNavProps {
  /** Array of [url, name] tuples or link objects */
  links: DevEnvUrlSwitcherNavLink[] | [string, string][];
  /** URL/path of the currently active item */
  activeUrl?: string;
  /** Called when a link is clicked. Receives the URL string. */
  onNavigate?: (url: string) => void;
  /** Label text displayed before the nav items */
  label?: string;
  /** Icon rendered before the label */
  labelIcon?: ReactNode;
  /** Element type for each nav item (e.g. 'a', RouterLink) */
  itemAs?: React.ElementType;
  /** Optional CSS class for the root element */
  className?: string;
  /** Optional CSS class for individual nav items */
  itemClassName?: string;
  /** Content rendered after the nav items */
  children?: ReactNode;
}
