import type { ReactNode } from 'react';

interface ShellNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
}

interface ShellGroup {
  id: string;
  label?: string;
  items: ShellNavItem[];
}

interface ShellTab {
  id: string;
  label: string;
  icon: ReactNode;
}

interface ShellSearchConfig {
  placeholder?: string;
  shortcutLabel?: string;
  shortcutModifier?: string;
}

interface ShellRailItem {
  key: string;
  icon: ReactNode;
}

interface ShellOrg {
  name: string;
  initial?: string;
  color?: string;
}

interface ShellUser {
  icon: ReactNode;
}

export declare const icons: Record<string, ReactNode>;
export declare const navIcons: Record<string, ReactNode>;
export declare const SHELL_GROUPS: ShellGroup[];
export declare const SHELL_TRAILING_TABS: ShellTab[];
export declare const SHELL_SEARCH: ShellSearchConfig;
export declare const SHELL_RAIL_BOTTOM: ShellRailItem[];
export declare const SHELL_ORG: ShellOrg;
export declare const SHELL_USER: ShellUser;
