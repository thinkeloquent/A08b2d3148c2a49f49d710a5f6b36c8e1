import type { LucideIcon } from 'lucide-react';

export type ComponentStatus = 'stable' | 'beta' | 'alpha' | 'deprecated';

export type SortField = 'name' | 'downloads' | 'stars' | 'version';

export type SortOrder = 'asc' | 'desc';

export interface ComponentTag {
  id: string;
  name: string;
}

export interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  count: number;
}

export interface Component {
  id: string;
  name: string;
  category: string;
  version: string;
  branch?: string;
  release?: string;
  repoLink?: string;
  shaCommit?: string;
  author: string;
  downloads: number;
  stars: number;
  status: ComponentStatus;
  tags: ComponentTag[];
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: LucideIcon;
  count: number;
}

export interface FilterOptions {
  status: ComponentStatus | null;
  author: string | null;
}

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

export interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  variant?: 'default' | 'highlight' | 'accent';
}

export interface RegisterFormData {
  name: string;
  category: string;
  description: string;
  version: string;
  branch: string;
  release: string;
  repoLink: string;
  shaCommit: string;
  tags: string;
}

export interface DashboardStats {
  totalComponents: number;
  totalDownloads: number;
  activePublishers: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: { code: string; message: string };
}
