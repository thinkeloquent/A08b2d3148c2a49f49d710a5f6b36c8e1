import type { ReactNode } from 'react';

/** A single key-value column displayed in a timeline item card. */
export interface TimelineItemColumn {
  /** Column header label */
  label: string;
  /** Column value text */
  value: string;
}

/** A tag/note chip displayed at the bottom of a timeline item card. */
export interface TimelineItemTag {
  /** Icon rendered before the tag text */
  icon?: ReactNode;
  /** Tag display text */
  text: string;
}

/** A single entry in the vertical timeline. */
export interface TimelineItem {
  /** Unique identifier for this item */
  id: string | number;
  /** Short date label displayed above the day (e.g. month abbreviation) */
  dateLabel: string;
  /** Day or primary date value displayed large */
  dateValue: string;
  /** Key-value columns rendered in a grid */
  columns: TimelineItemColumn[];
  /** Status indicator for this item */
  status: {
    /** Status key — 'done' renders green, anything else renders amber */
    type: 'done' | 'pending' | (string & {});
    /** Display label for the badge */
    label: string;
    /** Custom icon for the status badge */
    icon?: ReactNode;
  };
  /** Optional warning/info banner below the card header */
  banner?: {
    /** Icon rendered before the banner message */
    icon?: ReactNode;
    /** Banner message text */
    message: string;
  };
  /** Optional tag chips rendered at the card footer */
  tags?: TimelineItemTag[];
}

/** Props for the timeline header card. */
export interface TimelineHeaderProps {
  /** Primary icon displayed in the colored badge */
  icon?: ReactNode;
  /** Secondary badge element (e.g. a number or short code) */
  badge?: ReactNode;
  /** Main title text */
  title: string;
  /** Subtitle/description text below the title */
  subtitle?: string;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the main ProjectLinearVerticalTimeline component. */
export interface ProjectLinearVerticalTimelineProps {
  /** Timeline entries to render */
  items: TimelineItem[];
  /** Optional header card configuration */
  header?: TimelineHeaderProps;
  /** Callback when the add button is clicked. If omitted, the add button is hidden. */
  onAddClick?: () => void;
  /** Label for the add button */
  addButtonLabel?: string;
  /** Custom icon for the add button */
  addButtonIcon?: ReactNode;
  /** Custom icon for the default "done" status badge */
  statusDoneIcon?: ReactNode;
  /** Custom icon for the default "pending" status badge */
  statusPendingIcon?: ReactNode;
  /** CSS class escape hatch for the outer container */
  className?: string;
  /** Content rendered below the timeline */
  children?: ReactNode;
}
