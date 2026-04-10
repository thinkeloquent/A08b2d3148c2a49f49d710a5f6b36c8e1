import type { ReactNode } from 'react';

/** Display configuration for a file type (keyed by filename pattern) */
export interface FileTypeConfig {
  /** Text color CSS value */
  color: string;
  /** Background color CSS value */
  bg: string;
  /** Human-readable label for the file type */
  label: string;
}

/** Container visibility level */
export type Visibility = 'public' | 'private' | 'team';

/** A file entry within the agent registry */
export interface AgentFile {
  /** Unique identifier */
  id: string;
  /** File name including extension */
  filename: string;
  /** File type key matching a FileTypeConfig entry */
  file_type: string;
  /** Categorization tags */
  tags: string[];
  /** Semantic version string */
  version: string;
  /** Structured metadata (YAML frontmatter-style) */
  frontmatter: Record<string, unknown>;
  /** Raw file content body */
  content: string;
}

/** A container node in the registry tree */
export interface Container {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Access visibility level */
  visibility: Visibility;
  /** Nested child containers */
  children: Container[];
  /** Files directly inside this container */
  files: AgentFile[];
}

/** Dashboard stat card data */
export interface StatItem {
  /** Stat label */
  label: string;
  /** Stat value (number or formatted string) */
  value: string | number;
  /** Secondary description line */
  sub: string;
  /** Accent color CSS value */
  accent: string;
}

/** Sidebar navigation entry */
export interface NavItem {
  /** Unique key for this nav item */
  id: string;
  /** Icon element rendered beside the label */
  icon: ReactNode;
  /** Display label */
  label: string;
}

/** File selected event payload */
export interface FileSelectPayload extends AgentFile {
  /** Breadcrumb path of container names */
  path: string[];
  /** ID of the immediate parent container */
  containerId: string;
}

/** Props for the RepoAgentScaffold component */
export interface RepoAgentScaffoldProps {
  /** Container tree data */
  containers: Container[];
  /** File type configuration map (filename pattern -> display config) */
  fileTypes: Record<string, FileTypeConfig>;
  /** Dashboard stat cards */
  stats?: StatItem[];
  /** Navigation items for the sidebar */
  navItems?: NavItem[];
  /** Brand name displayed in sidebar */
  brandName?: ReactNode;
  /** Brand subtitle */
  brandSubtitle?: string;
  /** Logo icon slot */
  logoIcon?: ReactNode;
  /** Status indicator label */
  statusLabel?: string;
  /** Whether status is connected */
  statusConnected?: boolean;
  /** Called when a file is selected */
  onFileSelect?: (file: FileSelectPayload) => void;
  /** Called when CLI command is copied */
  onCopyCommand?: (command: string) => void;
  /** CLI organization name default */
  defaultOrg?: string;
  /** CSS class escape hatch */
  className?: string;
  /** Dashboard title */
  title?: string;
  /** Dashboard subtitle */
  subtitle?: string;
}
