import type { ReactNode } from 'react';

/** A single navigation item in the types dashboard */
export interface TypeNavItem {
  /** Unique key identifying this item */
  key: string;
  /** Display label for the navigation item */
  label: string;
  /** Icon rendered to the left of the label — accepts any ReactNode */
  icon?: ReactNode;
}

/** Props for the PanelLeftTypesDashboard component */
export interface PanelLeftTypesDashboardProps {
  /** Array of navigation items to display */
  items: TypeNavItem[];
  /** Key of the currently active/selected item */
  activeKey?: string;
  /** Callback fired when a navigation item is clicked */
  onItemSelect?: (item: TypeNavItem) => void;
  /** Title displayed in the panel header */
  title?: string;
  /** Content rendered in the footer area below the navigation */
  footer?: ReactNode;
  /** CSS class escape hatch for the root container */
  className?: string;
  /** Content rendered below the navigation items */
  children?: ReactNode;
  /** Element type for each navigation item — use for router-agnostic rendering */
  as?: React.ElementType;
}

/** Props for the PanelLeftTypesDashboard.Header sub-component */
export interface PanelLeftTypesDashboardHeaderProps {
  /** Title text displayed in the header */
  title: string;
  /** CSS class escape hatch */
  className?: string;
  /** Additional content rendered after the title */
  children?: ReactNode;
}

/** Props for the PanelLeftTypesDashboard.Nav sub-component */
export interface PanelLeftTypesDashboardNavProps {
  /** Navigation items to render */
  items: TypeNavItem[];
  /** Key of the currently active item */
  activeKey?: string;
  /** Callback fired when an item is clicked */
  onItemSelect?: (item: TypeNavItem) => void;
  /** Element type for each item — defaults to 'button' */
  as?: React.ElementType;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the PanelLeftTypesDashboard.Footer sub-component */
export interface PanelLeftTypesDashboardFooterProps {
  /** CSS class escape hatch */
  className?: string;
  /** Footer content */
  children?: ReactNode;
}
