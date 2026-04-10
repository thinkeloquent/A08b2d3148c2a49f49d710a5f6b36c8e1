import type { ReactNode } from 'react';

/** A single stat card displayed in the dashboard grid */
export interface StatCardItem {
  /** Unique key for this card */
  key: string;
  /** Display label (e.g. "Organizations") */
  label: string;
  /** Numeric value to display prominently */
  value: number | string;
  /** Icon rendered inside the colored badge — accepts any ReactNode */
  icon?: ReactNode;
  /** Tailwind background class for the icon badge (e.g. "bg-blue-100") */
  iconBgClass?: string;
  /** Tailwind text color class for the icon (e.g. "text-blue-600") */
  iconColorClass?: string;
}

/** A quick action button displayed in the actions section */
export interface QuickActionItem {
  /** Unique key for this action */
  key: string;
  /** Primary label (e.g. "Manage Organizations") */
  title: string;
  /** Secondary description text */
  description?: string;
  /** Icon rendered to the left — accepts any ReactNode */
  icon?: ReactNode;
}

/** Props for the DashboardLandingCard001 root component */
export interface DashboardLandingCard001Props {
  /** Page title displayed at the top */
  title: string;
  /** Subtitle/description below the title */
  subtitle?: string;
  /** Array of stat cards to render in the grid */
  stats: StatCardItem[];
  /** Callback when a stat card is clicked */
  onStatClick?: (item: StatCardItem) => void;
  /** Element type for stat card wrapper — defaults to 'button' */
  statAs?: React.ElementType;
  /** Array of quick action items */
  actions?: QuickActionItem[];
  /** Callback when a quick action is clicked */
  onActionClick?: (item: QuickActionItem) => void;
  /** Element type for action item wrapper — defaults to 'button' */
  actionAs?: React.ElementType;
  /** Title for the quick actions section */
  actionsTitle?: string;
  /** CSS class escape hatch for the root container */
  className?: string;
  /** Additional content rendered after the stat grid and before quick actions */
  children?: ReactNode;
}

/** Props for the StatCard sub-component */
export interface StatCardProps {
  /** Display label */
  label: string;
  /** Numeric value */
  value: number | string;
  /** Icon ReactNode */
  icon?: ReactNode;
  /** Tailwind background class for the icon badge */
  iconBgClass?: string;
  /** Tailwind text color class for the icon */
  iconColorClass?: string;
  /** Click handler */
  onClick?: () => void;
  /** Element type — defaults to 'button' */
  as?: React.ElementType;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the QuickAction sub-component */
export interface QuickActionProps {
  /** Primary label */
  title: string;
  /** Description text */
  description?: string;
  /** Icon ReactNode */
  icon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Element type — defaults to 'button' */
  as?: React.ElementType;
  /** CSS class escape hatch */
  className?: string;
}
