import { ReactNode } from 'react';

// ─── Core Domain Types ─────────────────────────────────────

export interface TemplateToken {
  name: string;
  type?: 'string' | 'number' | 'date' | 'email' | 'url' | 'enum' | 'boolean' | 'list' | 'secret' | 'text';
  required?: boolean;
  defaultValue?: string;
  description?: string;
  validation?: string;
  options?: string[];
}

/** Central module registry entity — the canonical definition of a module */
export interface Module {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: 'published' | 'draft' | 'deprecated';
  tags?: string[];
  dependencies?: string[];
  owner?: string;
}

/** Template references a registry module with required/enabled settings */
export interface TemplateModuleRef {
  moduleId: string;
  required: boolean;
  enabled: boolean;
}

/** Preset overrides/extends template modules — tracks inheritance origin */
export interface PresetModuleRef {
  moduleId: string;
  required: boolean;
  versionOverride?: string;
  inherited?: boolean;
}

export interface TemplateVersion {
  version: string;
  date: string;
  author: string;
  changelog: string;
  breaking: boolean;
  status: 'published' | 'draft' | 'deprecated' | 'retired';
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  category: string;
  version: string;
  type: 'static' | 'dynamic';
  status: 'published' | 'draft' | 'deprecated' | 'retired';
  description?: string;
  content?: string;
  tokens?: TemplateToken[];
  presetCount?: number;
  tags?: string[];
  sourceRepo?: string;
  owner?: string;
  modules?: TemplateModuleRef[];
  references?: TemplateReference[];
  docs?: string;
  versions?: TemplateVersion[];
  instanceCount?: number;
}

export interface TemplatePreset {
  id: string;
  slug: string;
  name: string;
  description: string;
  purpose?: string;
  audience?: string;
  category: string;
  version: string;
  template: string;
  templateVersion: string;
  owner?: string;
  uses?: number;
  successRate?: number;
  setupTime?: string;
  status: 'published' | 'draft' | 'deprecated';
  featured?: boolean;
  tags: string[];
  labels?: Label[];
  includedItems?: string[];
  optionalAddons?: string[];
  configFields?: string[];
  modules?: PresetModuleRef[];
  policies?: PresetPolicy[];
  references?: TemplateReference[];
  presetVariables?: PresetVariable[];
  versions?: TemplateVersion[];
  docs?: string;
}

export interface PresetPolicy {
  name: string;
  status: 'enforced' | 'advisory' | 'disabled';
}

export interface PresetVariable {
  key: string;
  label?: string;
  visibility: 'editable' | 'locked' | 'hidden' | 'derived';
  defaultValue?: string;
  lockedValue?: string;
  helpText?: string;
  validation?: string;
  sortOrder?: number;
}

export interface TemplateInstance {
  id: string;
  name: string;
  source: 'template' | 'preset';
  sourceId: string;
  sourceName: string;
  sourceVersion: string;
  generatedBy: string;
  generatedAt: string;
  status: 'success' | 'failed' | 'pending';
  tokenValues?: Record<string, string>;
  compiledContent?: string;
  modules?: string[];
}

export interface AuditEntry {
  id?: string;
  timestamp: string;
  action: string;
  entity: string;
  user: string;
  entityType?: string;
  details?: string;
}

export interface TemplateReference {
  type: 'link' | 'content';
  appName: string;
  appId?: string;
  usageContext?: string;
  /** Content reference fields */
  filename?: string;
  mimetype?: string;
  content?: string;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
}

// ─── Navigation ────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  section?: string;
  badge?: number;
}

// ─── Component Props ───────────────────────────────────────

export interface TemplateManagePresentsProps {
  /** Template presets for the catalog */
  presets?: TemplatePreset[];
  /** Raw templates */
  templates?: Template[];
  /** Central module registry */
  modules?: Module[];
  /** Generated instances */
  instances?: TemplateInstance[];
  /** Audit log entries */
  auditLog?: AuditEntry[];
  /** Available categories for filtering */
  categories?: string[];
  /** Navigation items */
  navItems?: NavItem[];
  /** Initial active page */
  defaultPage?: string;
  /** Category color mapping */
  categoryColors?: Record<string, string>;
  /** Callback when a preset is selected */
  onPresetSelect?: (preset: TemplatePreset) => void;
  /** Callback when a template is saved */
  onTemplateSave?: (template: Template) => void;
  /** Callback when a template is deleted */
  onTemplateDelete?: (template: Template) => void;
  /** Callback when a template version is published */
  onTemplatePublish?: (template: Template, version: string, changelog: string, breaking: boolean) => void;
  /** Callback when a preset is edited/saved */
  onPresetSave?: (preset: TemplatePreset) => void;
  /** Callback when a preset is deleted */
  onPresetDelete?: (preset: TemplatePreset) => void;
  /** Callback when a preset version is published */
  onPresetPublish?: (preset: TemplatePreset, version: string, changelog: string, breaking: boolean) => void;
  /** Callback when an instance is deleted */
  onInstanceDelete?: (instance: TemplateInstance) => void;
  /** Callback when a module is saved */
  onModuleSave?: (module: Module) => void;
  /** Callback when a module is deleted */
  onModuleDelete?: (module: Module) => void;
  /** Application title/brand */
  title?: string;
  /** Brand icon */
  brandIcon?: ReactNode;
  /** User avatar content */
  userAvatar?: ReactNode;
  /** CSS class escape hatch */
  className?: string;
  /** Sidebar collapsed by default */
  defaultCollapsed?: boolean;
  /** Header right slot */
  headerRight?: ReactNode;
  /** Base path for URL sync (e.g. '/' or '/apps/templates'). When set, clicking nav items updates the browser URL to basePath + '/' + itemId */
  basePath?: string;
}

// ─── Sub-component Props ───────────────────────────────────

export interface CatalogViewProps {
  presets: TemplatePreset[];
  categories?: string[];
  categoryColors?: Record<string, string>;
  onSelect?: (preset: TemplatePreset) => void;
  onEdit?: (preset: TemplatePreset) => void;
  className?: string;
}

export interface PresetCardProps {
  preset: TemplatePreset;
  featured?: boolean;
  categoryColors?: Record<string, string>;
  onSelect?: (preset: TemplatePreset) => void;
  onEdit?: (preset: TemplatePreset) => void;
  className?: string;
}

export interface PresetEditFormProps {
  preset: TemplatePreset;
  templates?: Template[];
  registryModules?: Module[];
  categoryColors?: Record<string, string>;
  onSave?: (preset: TemplatePreset) => void;
  onDelete?: (preset: TemplatePreset) => void;
  onPublish?: (preset: TemplatePreset, version: string, changelog: string, breaking: boolean) => void;
  onBack?: () => void;
  className?: string;
}

export interface PresetDetailProps {
  preset: TemplatePreset;
  registryModules?: Module[];
  onBack?: () => void;
  categoryColors?: Record<string, string>;
  className?: string;
}

export interface InstancesViewProps {
  instances: TemplateInstance[];
  onView?: (instance: TemplateInstance) => void;
  onDelete?: (instance: TemplateInstance) => void;
  className?: string;
}

export interface TemplatesAdminProps {
  templates: Template[];
  categoryColors?: Record<string, string>;
  onNew?: () => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  className?: string;
}

export interface TemplateEditFormProps {
  template: Template;
  registryModules?: Module[];
  categoryColors?: Record<string, string>;
  onSave?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onPublish?: (template: Template, version: string, changelog: string, breaking: boolean) => void;
  onPreview?: (template: Template) => void;
  onBack?: () => void;
  className?: string;
}

export interface PresetsAdminProps {
  presets: TemplatePreset[];
  categoryColors?: Record<string, string>;
  onNew?: () => void;
  onEdit?: (preset: TemplatePreset) => void;
  onDelete?: (preset: TemplatePreset) => void;
  className?: string;
}

export interface ModulesAdminProps {
  modules: Module[];
  categoryColors?: Record<string, string>;
  onNew?: () => void;
  onEdit?: (module: Module) => void;
  onDelete?: (module: Module) => void;
  className?: string;
}

export interface ModuleEditFormProps {
  module: Module;
  registryModules?: Module[];
  categoryColors?: Record<string, string>;
  onSave?: (module: Module) => void;
  onDelete?: (module: Module) => void;
  onBack?: () => void;
  className?: string;
}

export interface InstanceDetailProps {
  instance: TemplateInstance;
  registryModules?: Module[];
  onBack?: () => void;
  onDelete?: (instance: TemplateInstance) => void;
  className?: string;
}

export interface AuditViewProps {
  entries: AuditEntry[];
  actionColors?: Record<string, string>;
  className?: string;
}

export interface SidebarProps {
  items: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  title?: string;
  brandIcon?: ReactNode;
  className?: string;
}

export interface TopNavProps {
  items: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  title?: string;
  brandIcon?: ReactNode;
  className?: string;
}

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'ghost';
  className?: string;
}

export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  as?: React.ElementType;
  className?: string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}

export interface ProgressBarProps {
  value: number;
  className?: string;
}

export interface FieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  className?: string;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
}

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export interface ReviewSectionProps {
  title: string;
  items: Array<{ k: string; v: string; locked?: boolean; check?: boolean }>;
  className?: string;
}
