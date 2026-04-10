import type { ReactNode } from 'react';

/** A single key-value entry managed by the editor */
export interface KeyValueEntry {
  /** Unique identifier for the entry */
  id: string;
  /** The key name */
  key: string;
  /** The value associated with the key */
  value: string;
}

/** Toast notification descriptor */
export interface ToastDescriptor {
  /** Message to display */
  message: string;
  /** Optional action button label */
  action?: string;
  /** Callback when the action button is clicked */
  onAction?: () => void;
}

/** Icon slot props — accept ReactNode for zero-dependency icon rendering */
export interface IconSlots {
  /** Icon for the delete/trash action */
  trashIcon?: ReactNode;
  /** Icon for the add/plus action */
  plusIcon?: ReactNode;
  /** Icon for search */
  searchIcon?: ReactNode;
  /** Icon for the drag grip handle */
  gripIcon?: ReactNode;
  /** Icon for confirming/check */
  checkIcon?: ReactNode;
  /** Icon for close/dismiss */
  closeIcon?: ReactNode;
  /** Icon for edit */
  editIcon?: ReactNode;
  /** Icon for copy to clipboard */
  copyIcon?: ReactNode;
  /** Icon for download/export */
  downloadIcon?: ReactNode;
  /** Icon for upload/import */
  uploadIcon?: ReactNode;
  /** Icon for empty state info */
  infoIcon?: ReactNode;
}

/** Props for the DefaultValueEditor component */
export interface DefaultValueEditorProps {
  /** CSS class escape hatch */
  className?: string;
  /** Current entries (controlled) */
  entries: KeyValueEntry[];
  /** Called when entries change (add, update, delete, reorder, clear, import) */
  onEntriesChange: (entries: KeyValueEntry[]) => void;
  /** Called when an entry is deleted, providing the deleted entry for undo support */
  onEntryDeleted?: (deleted: KeyValueEntry) => void;
  /** Called when entries are cleared, providing the snapshot for undo support */
  onEntriesCleared?: (snapshot: KeyValueEntry[]) => void;
  /** Called when entries are imported from JSON */
  onEntriesImported?: (count: number) => void;
  /** Called when entries are exported */
  onExport?: () => void;
  /** Called when entries are copied to clipboard */
  onCopy?: () => void;
  /** Title displayed in the header */
  title?: string;
  /** Subtitle/description displayed below the title */
  subtitle?: string;
  /** Filename used when exporting JSON */
  exportFilename?: string;
  /** Placeholder for the key input */
  keyPlaceholder?: string;
  /** Placeholder for the value input */
  valuePlaceholder?: string;
  /** Search filter placeholder */
  searchPlaceholder?: string;
  /** Empty state title when no entries exist */
  emptyTitle?: string;
  /** Empty state description when no entries exist */
  emptyDescription?: string;
  /** Override icons used by the editor */
  icons?: Partial<IconSlots>;
  /** Toast duration in milliseconds (default 4000) */
  toastDuration?: number;
  /** Whether to show the search toggle in the toolbar (default true) */
  showSearch?: boolean;
  /** Whether to show the copy button in the toolbar (default true) */
  showCopy?: boolean;
  /** Whether to show the export button in the toolbar (default true) */
  showExport?: boolean;
  /** Whether to show the import button in the toolbar (default true) */
  showImport?: boolean;
  /** Whether to show the clear all button (default true) */
  showClearAll?: boolean;
  /** Whether drag-to-reorder is enabled (default true) */
  draggable?: boolean;
  /** Whether to show the bulk insert button for pasting comma/JSON/YAML lists of keys (default false) */
  showBulkInsert?: boolean;
}

/** Props for the EntryRow sub-component */
export interface EntryRowProps {
  /** CSS class escape hatch */
  className?: string;
  /** The entry to render */
  entry: KeyValueEntry;
  /** Index in the full (unfiltered) entries array */
  index: number;
  /** Called when the entry is updated */
  onUpdate: (id: string, key: string, value: string) => void;
  /** Called when the entry is deleted */
  onDelete: (id: string) => void;
  /** Drag start handler */
  onDragStart: (e: React.DragEvent, index: number) => void;
  /** Drag over handler */
  onDragOver: (e: React.DragEvent, index: number) => void;
  /** Drop handler */
  onDrop: (e: React.DragEvent, index: number) => void;
  /** Whether this row is currently being dragged */
  isDragging: boolean;
  /** Whether a dragged row is currently over this row */
  isOver: boolean;
  /** Whether this entry's key is duplicated elsewhere */
  duplicateKey: boolean;
  /** Whether drag handles are visible */
  draggable?: boolean;
  /** Override icons */
  icons?: Partial<IconSlots>;
}

/** Props for the Toast sub-component */
export interface ToastProps {
  /** CSS class escape hatch */
  className?: string;
  /** Message to display */
  message: string;
  /** Optional action button label */
  action?: string;
  /** Callback when the action button is clicked */
  onAction?: () => void;
  /** Callback when the toast is dismissed (timeout or manual close) */
  onDismiss: () => void;
  /** Duration in milliseconds before auto-dismiss (default 4000) */
  duration?: number;
  /** Icon for the close button */
  closeIcon?: ReactNode;
}
