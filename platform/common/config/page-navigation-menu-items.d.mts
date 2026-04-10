interface ShellNavItem {
  id: string;
  label: string;
  badge?: number | string;
}

interface ShellGroup {
  id: string;
  label: string;
  items: ShellNavItem[];
}

interface ShellTheme {
  rail: string;
  railHover: string;
  railIcon: string;
  accent: string;
  brand: string;
}

export declare const SHELL_GROUPS: ShellGroup[];
export declare const APP_SLUG_MAP: Record<string, string>;
export declare const SHELL_THEME: ShellTheme;
