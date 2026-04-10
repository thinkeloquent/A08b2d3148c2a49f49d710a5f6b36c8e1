import type { ReactNode } from 'react';

/** A single skill/tool entry */
export interface Skill {
  /** Unique identifier */
  id: string | number;
  /** Kebab-case skill name */
  name: string;
  /** Namespace/scope (e.g. "@dev-tools") */
  ns: string;
  /** Semver version string */
  version: string;
  /** Human-readable description */
  desc: string;
  /** Trigger phrases that activate the skill */
  triggers: string[];
  /** System dependency labels (e.g. "python>=3.9") */
  sys: string[];
  /** Agent tools required (e.g. "run_terminal_command") */
  tools: string[];
  /** Categorization tags */
  tags: string[];
  /** Download count */
  dl: number;
  /** Star/rating count */
  stars: number;
  /** Status indicator */
  status: 'stable' | 'beta' | string;
  /** Human-readable "last updated" label */
  updated: string;
}

/** Color mapping for a tag */
export interface TagColors {
  bg: string;
  color: string;
  border: string;
}

/** Navigation item for the sidebar */
export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

/** Sidebar branding configuration */
export interface BrandConfig {
  /** Short name/letter for the logo mark */
  logoMark: string;
  /** Application title */
  title: string;
  /** Subtitle below the title */
  subtitle: string;
}

/** User info displayed in sidebar footer */
export interface UserInfo {
  /** Display initials for the avatar */
  initials: string;
  /** Full display name */
  name: string;
  /** Plan/role label */
  plan: string;
}

/** Overview stat for sidebar */
export interface OverviewStat {
  label: string;
  val: string | number;
}

/** CLI command entry for docs view */
export interface CliCommand {
  cmd: string;
  desc: string;
}

/** Props for the root SkillSet component */
export interface SkillSetProps {
  /** Array of skill data to display */
  skills: Skill[];
  /** Tag-to-color mapping */
  tagColors?: Record<string, TagColors>;
  /** Sidebar navigation items (default: registry, toolbelt, docs) */
  navItems?: NavItem[];
  /** Branding configuration */
  brand?: BrandConfig;
  /** User info for sidebar footer */
  user?: UserInfo;
  /** Overview stats for sidebar */
  overviewStats?: OverviewStat[];
  /** Set of installed skill IDs */
  installedIds?: Set<string | number>;
  /** Called when a skill is installed/uninstalled */
  onInstallToggle?: (id: string | number) => void;
  /** Initial active tab ID */
  defaultTab?: string;
  /** CLI commands for docs view */
  cliCommands?: CliCommand[];
  /** Schema text for docs view */
  schemaText?: string;
  /** Install command prefix (default: "skillset install") */
  installCommandPrefix?: string;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the Sidebar sub-component */
export interface SidebarProps {
  brand?: BrandConfig;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  installedCount: number;
  overviewStats?: OverviewStat[];
  user?: UserInfo;
  className?: string;
}

/** Props for the SkillCard sub-component */
export interface SkillCardProps {
  skill: Skill;
  selected?: boolean;
  onSelect?: (skill: Skill) => void;
  tagColors?: Record<string, TagColors>;
  className?: string;
}

/** Props for the RightRail sub-component */
export interface RightRailProps {
  skill: Skill | null;
  installed?: boolean;
  onInstall?: (id: string | number) => void;
  tagColors?: Record<string, TagColors>;
  installCommandPrefix?: string;
  emptyIcon?: ReactNode;
  className?: string;
}

/** Props for the RegistryView sub-component */
export interface RegistryViewProps {
  skills: Skill[];
  tagColors?: Record<string, TagColors>;
  installedIds: Set<string | number>;
  onInstallToggle: (id: string | number) => void;
  installCommandPrefix?: string;
  className?: string;
}

/** Props for the ToolbeltView sub-component */
export interface ToolbeltViewProps {
  skills: Skill[];
  installedIds: Set<string | number>;
  onInstallToggle: (id: string | number) => void;
  tagColors?: Record<string, TagColors>;
  className?: string;
}

/** Props for the DocsView sub-component */
export interface DocsViewProps {
  cliCommands?: CliCommand[];
  schemaText?: string;
  className?: string;
}

/** Props for the Tag sub-component */
export interface TagProps {
  label: string;
  colors?: TagColors;
  sm?: boolean;
  className?: string;
}

/** Props for the StatusBadge sub-component */
export interface StatusBadgeProps {
  status: 'stable' | 'beta' | string;
  className?: string;
}
