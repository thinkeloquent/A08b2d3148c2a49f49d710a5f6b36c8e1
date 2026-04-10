import type { ReactNode } from 'react';

/** A single link item displayed in the switcher */
export interface DevEnvUrlSwitcherLink {
  /** The URL to navigate to */
  url: string;
  /** Display name for the link */
  name: string;
}

/** Props for the LinkCard sub-component */
export interface LinkCardProps {
  /** The link item to render */
  item: DevEnvUrlSwitcherLink;
  /** Index used for color cycling */
  index: number;
  /** Called when the user clicks the card */
  onNavigate: (url: string) => void;
  /** Optional CSS class */
  className?: string;
}

/** Props for the modal overlay */
export interface DevEnvUrlSwitcherModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Links to display */
  links: DevEnvUrlSwitcherLink[];
  /** Called when a link is selected */
  onNavigate: (url: string) => void;
  /** Current search query */
  search: string;
  /** Update the search query */
  setSearch: (value: string) => void;
  /** Modal title text */
  title?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Message when no results match */
  emptyMessage?: string;
  /** Color classes for link card avatars */
  colors?: string[];
  /** Optional CSS class for the modal container */
  className?: string;
}

/** Props for the main DevEnvUrlSwitcher component */
export interface DevEnvUrlSwitcherProps {
  /** Array of links to display in the switcher */
  links: DevEnvUrlSwitcherLink[];
  /** Called when a link is selected. Receives the URL string. */
  onNavigate?: (url: string) => void;
  /** Label for the floating trigger button */
  triggerLabel?: string;
  /** Optional icon rendered before the trigger label */
  triggerIcon?: ReactNode;
  /** Modal title */
  title?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Message shown when no links match the search */
  emptyMessage?: string;
  /** Tailwind background color classes for link card avatars */
  colors?: string[];
  /** Optional CSS class for the root element */
  className?: string;
}
