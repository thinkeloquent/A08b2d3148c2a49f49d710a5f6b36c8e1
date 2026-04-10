// Role Entity (Section 4.1 from REQ.v002.md)
export interface Role {
  id: string; // Unique identifier (generated)
  name: string; // Display name (2-50 chars)
  description: string; // Role description (0-500 chars)
  icon: string; // Icon identifier
  labels: string[]; // Array of label names (max 10)
  groups: string[]; // Array of group IDs
  actions: string[]; // Array of action IDs
  restrictions: string[]; // Array of restriction IDs
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  createdBy?: string; // User identifier
  updatedBy?: string; // User identifier
  status?: 'active' | 'archived'; // Status
  archivedAt?: string; // Archive timestamp
  version?: number; // Version number for optimistic locking
  metadata?: {
    // Additional metadata
    templateId?: string;
    clonedFrom?: string;
    tags?: string[];
  };
}

// Group Entity (Section 4.2 from REQ.v002.md)
export interface Group {
  id: string; // Unique identifier (generated)
  name: string; // Display name (2-50 chars)
  description: string; // Group description (0-500 chars)
  actions?: string[]; // Array of action IDs
  restrictions?: string[]; // Array of restriction IDs
  createdAt?: string; // ISO date string
  createdBy?: string; // User identifier
  updatedAt?: string; // Last update timestamp
  updatedBy?: string; // Last updated by user
  status?: 'active' | 'archived'; // Status
  archivedAt?: string; // Archive timestamp
  roleCount?: number; // Number of roles using this group
  metadata?: {
    // Additional metadata
    externalId?: string;
    source?: string;
  };
}

// Label Entity (Section 4.3 from REQ.v002.md)
export interface Label {
  name: string; // Label text (2-30 chars)
  color: string; // Color identifier
  description?: string; // Optional label description
  category?: string; // Optional categorization
  isPredefined?: boolean; // System vs user label
  customCreated?: boolean; // True if custom, false/undefined if predefined
  usageCount?: number; // How many roles use this label
  createdAt?: string; // Creation timestamp
  createdBy?: string; // Creator user ID
}

// Action Entity
export interface Action {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  roleCount?: number;
  groupCount?: number;
}

// Restriction Entity
export interface Restriction {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  roleCount?: number;
  groupCount?: number;
}

// Audit Log Entity (Section 4.4 from REQ.v002.md)
export interface AuditLog {
  id: string; // Unique identifier
  timestamp: string; // ISO date string
  userId: string; // User who performed action
  action: 'create' | 'update' | 'delete' | 'restore' | 'export' | 'import';
  entityType: 'role' | 'group' | 'label';
  entityId: string; // ID of affected entity
  entityName?: string; // Name for easier reading
  changes?: {
    // What changed
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  metadata?: {
    // Additional context
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

// Role Template Entity (Section 4.5 from REQ.v002.md)
export interface RoleTemplate {
  id: string; // Unique identifier
  name: string; // Template name
  description: string; // Template description
  icon: string; // Default icon
  labels: string[]; // Default labels
  isSystem: boolean; // System vs user template
  usageCount?: number; // Times used
  createdAt: string; // Creation timestamp
  createdBy?: string; // Creator user ID
}

// User Preferences Entity (Section 4.6 from REQ.v002.md)
export interface UserPreferences {
  userId: string; // User identifier
  theme?: 'light' | 'dark' | 'auto';
  language?: string; // Locale code
  pageSize?: number; // Pagination preference
  sortPreference?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  recentSearches?: string[]; // Last 5 searches
  savedFilters?: {
    // Saved filter presets
    name: string;
    filters: unknown;
  }[];
  notifications?: {
    // Notification preferences
    enabled: boolean;
    duration: number;
  };
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: {
    field: string;
    message: string;
    value?: unknown;
  }[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Form Types
export interface RoleFormData {
  name: string;
  description: string;
  icon: string;
  labels: string[];
  groups: string[];
  actions: string[];
  restrictions: string[];
}

export interface GroupFormData {
  name: string;
  description: string;
  actions: string[];
  restrictions: string[];
}

export interface ActionFormData {
  name: string;
  description?: string;
}

export interface RestrictionFormData {
  name: string;
  description?: string;
}

// UI State Types
export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'createdAt' | 'updatedAt' | 'groupCount' | 'labelCount';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  labels?: string[];
  groups?: string[];
  status?: 'active' | 'archived';
  search?: string;
}

// Icon Types
export type RoleIconType =
  | 'shield'
  | 'lock'
  | 'eye'
  | 'settings'
  | 'file'
  | 'credit'
  | 'code'
  | 'chart'
  | 'palette'
  | 'database'
  | 'mail'
  | 'sparkles';

// Color Types for Labels
export type LabelColor =
  | 'red'
  | 'purple'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'indigo'
  | 'cyan'
  | 'orange'
  | 'gray'
  | 'pink';

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
