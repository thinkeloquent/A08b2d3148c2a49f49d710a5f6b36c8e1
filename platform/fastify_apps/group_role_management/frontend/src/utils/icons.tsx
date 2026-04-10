/**
 * Role Icon Mapping
 * Based on REQ.v002.md Section 4.1 (12+ icons minimum)
 */

import {
  Shield,
  Lock,
  Eye,
  Settings,
  FileText,
  CreditCard,
  Code,
  BarChart3,
  Palette,
  Database,
  Mail,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { RoleIconType } from '@/types';

// Icon mapping for roles
export const roleIconMap: Record<RoleIconType, LucideIcon> = {
  shield: Shield,
  lock: Lock,
  eye: Eye,
  settings: Settings,
  file: FileText,
  credit: CreditCard,
  code: Code,
  chart: BarChart3,
  palette: Palette,
  database: Database,
  mail: Mail,
  sparkles: Sparkles,
};

/**
 * Get icon component by icon type
 */
export function getRoleIcon(iconType: RoleIconType | string): LucideIcon {
  return roleIconMap[iconType as RoleIconType] || Shield;
}

/**
 * RoleIcon component - renders the correct icon for a role
 */
export interface RoleIconProps {
  icon: RoleIconType | string;
  className?: string;
}

export function RoleIcon({ icon, className = 'w-4 h-4' }: RoleIconProps) {
  const Icon = getRoleIcon(icon);
  return <Icon className={className} />;
}

/**
 * Get all available role icons for icon picker
 */
export function getAllRoleIcons(): Array<{ key: RoleIconType; Icon: LucideIcon }> {
  return Object.entries(roleIconMap).map(([key, Icon]) => ({
    key: key as RoleIconType,
    Icon,
  }));
}
