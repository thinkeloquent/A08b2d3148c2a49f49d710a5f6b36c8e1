/**
 * Rule Tree Types - Core domain types shared across frontend and admin
 */

// Condition in a rule tree
export interface RuleCondition {
  id: string;
  type: 'condition';
  field: string;
  operator: string;
  valueType: 'value' | 'field' | 'function' | 'regex';
  value: string;
  dataType?: 'string' | 'number' | 'boolean' | 'date';
  description?: string;
  enabled: boolean;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
  parentScope?: string | null;
  validation?: {
    isValid: boolean;
    message?: string;
  };
}

// Group in a rule tree (can contain conditions and sub-groups)
export interface RuleGroup {
  id: string;
  type: 'group';
  name: string;
  logic: 'AND' | 'OR' | 'NOT' | 'XOR' | null;
  conditions: RuleItem[];
  expanded: boolean;
  enabled: boolean;
  color?: string;
  description?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
  parentScope?: string | null;
}

// Folder in a rule tree (organizational container, no logic)
export interface RuleFolder {
  id: string;
  type: 'folder';
  name: string;
  conditions: RuleItem[];
  expanded: boolean;
  enabled: boolean;
  color?: string;
  description?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
  parentScope?: string | null;
}

// Structural node — captures AST context (where in the code a condition lives)
export interface RuleStructural {
  id: string;
  type: 'structural';
  name: string;
  parentScope: string | null;   // enclosing function/class/method (e.g., "createEmotionCache")
  nodeType: string;             // AST node type (e.g., "IfStatement", "SwitchCase")
  evaluatedVariables: string[]; // variables in the condition (e.g., ["isBrowser"])
  conditions: RuleItem[];
  expanded: boolean;
  enabled: boolean;
  color?: string;
  description?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

// Union type for any item in the rule tree
export type RuleItem = RuleCondition | RuleGroup | RuleFolder | RuleStructural;

// Logic operator type
export type LogicOperator = 'AND' | 'OR' | 'NOT' | 'XOR' | null;

// Value type for conditions
export type ValueType = 'value' | 'field' | 'function' | 'regex';

// Data type for fields
export type DataType = 'string' | 'number' | 'boolean' | 'date';

// Graph type for categorizing rule trees
export type GraphType =
  | 'conditional_logic'
  | 'import_dependency'
  | 'variable_definitions'
  | 'bdd_cucumber'
  | 'react_state_mgmt'
  | 'function_call_trace'
  | 'ts_type_definitions'
  | 'graphql_types'
  | 'playwright_page_object';

export const GRAPH_TYPE_LABELS: Record<GraphType, string> = {
  conditional_logic: 'Conditional Logic',
  import_dependency: 'Import Dependency',
  variable_definitions: 'Variable Definitions',
  bdd_cucumber: 'BDD Cucumber',
  react_state_mgmt: 'React State Mgmt',
  function_call_trace: 'Function Call Trace',
  ts_type_definitions: 'TS Type Definitions',
  graphql_types: 'GraphQL Types',
  playwright_page_object: 'Playwright Page Object',
};

// Language type for categorizing what language a rule tree targets
export type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'go'
  | 'ruby'
  | 'rust'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'scala'
  | 'shell'
  | 'sql'
  | 'graphql'
  | 'gherkin'
  | 'mixed';

export const LANGUAGE_LABELS: Record<Language, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  go: 'Go',
  ruby: 'Ruby',
  rust: 'Rust',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  shell: 'Shell',
  sql: 'SQL',
  graphql: 'GraphQL',
  gherkin: 'Gherkin',
  mixed: 'Mixed',
};

// Statistics for rule tree
export interface ApiStats {
  total: number;
  groups: number;
  conditions: number;
  folders: number;
  enabled: number;
}

// Alias for backward compatibility with admin
export type RuleTreeStats = ApiStats;

// Git source metadata for immutability tracking
export interface GitMetadata {
  repo_url?: string;
  branch?: string;
  commit_sha?: string;
  git_tag?: string;
}

// Rule tree metadata (top-level)
export interface RuleTreeMeta {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  repo_url?: string;
  branch?: string;
  commit_sha?: string;
  git_tag?: string;
  graphType?: GraphType;
  language?: Language;
  createdAt?: string;
  updatedAt?: string;
}

// Full rule tree (metadata + rules)
export interface RuleTree extends RuleTreeMeta {
  rules: RuleGroup;
  stats?: RuleTreeStats;
}

// Field definition for the rule editor
export interface FieldDefinition {
  value: string;
  label: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Simpler field definition without icon (used by frontend)
export interface AvailableField {
  value: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

// Operator definition
export interface OperatorDefinition {
  value: string;
  label: string;
}

// Frontend API response type
export interface RuleTreeResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  graphType?: GraphType;
  items: RuleItem[];
  stats: ApiStats;
  createdAt: string;
  updatedAt: string;
}

// Admin-specific: audit info
export interface AuditInfo {
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

// Admin-specific: rule tree with audit
export interface RuleTreeWithAudit extends RuleTree {
  audit?: AuditInfo;
}
