import {
  Type, Table2, Grid3X3, Zap, Rows3, Layers,
  Box,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Map icon name strings (from the API) to Lucide icon components. */
const iconMap: Record<string, LucideIcon> = {
  Type,
  Table2,
  Grid3X3,
  Zap,
  Rows3,
  Layers,
  Box,
};

/** Default icon when the API icon name doesn't match any known icon. */
const DEFAULT_ICON: LucideIcon = Box;

export function resolveIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return DEFAULT_ICON;
  return iconMap[iconName] ?? DEFAULT_ICON;
}

export const statusOptions: readonly string[] = ['stable', 'beta', 'alpha', 'deprecated'];
