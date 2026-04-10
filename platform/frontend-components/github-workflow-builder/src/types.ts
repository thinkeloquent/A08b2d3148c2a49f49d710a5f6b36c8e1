import type { ReactNode } from 'react';

/** A workflow preset template */
export interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: Record<string, unknown>;
}

/** A utility script */
export interface WorkflowUtil {
  id: string;
  name: string;
  description: string;
  language: string;
  associatedWorkflows: string[];
  content: string;
}

/** A workflow instance */
export interface Workflow {
  id: string;
  name: string;
  presetId: string;
  template: string;
  variables: Record<string, unknown>;
  utils: string[];
}

/** Icon set for the component - all optional with inline SVG defaults */
export interface WorkflowBuilderIcons {
  workflow?: ReactNode;
  file?: ReactNode;
  plus?: ReactNode;
  trash?: ReactNode;
  edit?: ReactNode;
  copy?: ReactNode;
  download?: ReactNode;
  check?: ReactNode;
  x?: ReactNode;
  link?: ReactNode;
  play?: ReactNode;
  settings?: ReactNode;
  chevronRight?: ReactNode;
  chevronDown?: ReactNode;
  search?: ReactNode;
  layers?: ReactNode;
  export?: ReactNode;
  template?: ReactNode;
}

/** Props for the main GithubWorkflowBuilder component */
export interface GithubWorkflowBuilderProps {
  /** Preset templates available for creating workflows */
  presets?: WorkflowPreset[];
  /** Initial workflows to display */
  initialWorkflows?: Workflow[];
  /** Initial utility scripts */
  initialUtils?: WorkflowUtil[];
  /** Custom icon overrides */
  icons?: Partial<WorkflowBuilderIcons>;
  /** Called when a workflow is created */
  onWorkflowCreate?: (workflow: Workflow) => void;
  /** Called when a workflow is deleted */
  onWorkflowDelete?: (id: string) => void;
  /** Called when a utility is created */
  onUtilCreate?: (util: WorkflowUtil) => void;
  /** Called when a utility is deleted */
  onUtilDelete?: (id: string) => void;
  /** Called when the export bundle is generated */
  onExport?: (data: unknown) => void;
  /** Optional CSS class for the root element */
  className?: string;
  /** Optional children rendered in the main area when nothing is selected */
  children?: ReactNode;
}
