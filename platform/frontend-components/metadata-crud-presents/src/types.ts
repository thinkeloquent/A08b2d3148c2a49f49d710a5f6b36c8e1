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

export interface TemplateModule {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  required: boolean;
  enabled: boolean;
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
  status: 'published' | 'draft' | 'deprecated' | 'retired';
  description?: string;
  content?: string;
  tokens?: TemplateToken[];
  presetCount?: number;
  tags?: string[];
  sourceRepo?: string;
  owner?: string;
  modules?: TemplateModule[];
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
  requiredModules?: PresetModule[];
  optionalModules?: PresetModule[];
  policies?: PresetPolicy[];
  references?: TemplateReference[];
}

export interface PresetModule {
  id?: string;
  name: string;
  version: string;
  category: string;
  depends?: string;
}

export interface PresetPolicy {
  name: string;
  status: 'enforced' | 'advisory' | 'disabled';
}

export interface TemplateInstance {
  id: string;
  name: string;
  preset: string;
  presetVersion: string;
  generatedBy: string;
  generatedAt: string;
  status: 'success' | 'failed' | 'pending';
  tokenValues?: Record<string, string>;
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
  appName: string;
  appId?: string;
  usageContext?: string;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
}

export interface ApprovalRequest {
  id: string;
  preset: string;
  author: string;
  submitted: string;
  baseTemplate?: string;
  changes: string[];
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
  /** Generated instances */
  instances?: TemplateInstance[];
  /** Audit log entries */
  auditLog?: AuditEntry[];
  /** Approval requests */
  approvals?: ApprovalRequest[];
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
  /** Callback when an instance is generated */
  onInstanceGenerate?: (preset: TemplatePreset, config: Record<string, unknown>) => void;
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
  /** Callback when an instance is deleted */
  onInstanceDelete?: (instance: TemplateInstance) => void;
  /** Callback when an approval action occurs */
  onApprovalAction?: (id: string, action: 'approve' | 'reject', comment?: string) => void;
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
  onGenerate?: (preset: TemplatePreset) => void;
  className?: string;
}

export interface PresetCardProps {
  preset: TemplatePreset;
  featured?: boolean;
  categoryColors?: Record<string, string>;
  onSelect?: (preset: TemplatePreset) => void;
  onEdit?: (preset: TemplatePreset) => void;
  onGenerate?: (preset: TemplatePreset) => void;
  className?: string;
}

export interface PresetEditFormProps {
  preset: TemplatePreset;
  templates?: Template[];
  categoryColors?: Record<string, string>;
  onSave?: (preset: TemplatePreset) => void;
  onDelete?: (preset: TemplatePreset) => void;
  onBack?: () => void;
  className?: string;
}

export interface PresetDetailProps {
  preset: TemplatePreset;
  onBack?: () => void;
  onGenerate?: () => void;
  categoryColors?: Record<string, string>;
  className?: string;
}

export interface SetupWizardProps {
  preset: TemplatePreset;
  onBack?: () => void;
  onComplete?: (config: Record<string, unknown>) => void;
  steps?: string[];
  generationPipeline?: string[];
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
  categoryColors?: Record<string, string>;
  onSave?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onPublish?: (template: Template, version: string, changelog: string, breaking: boolean) => void;
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

export interface InstanceDetailProps {
  instance: TemplateInstance;
  onBack?: () => void;
  onDelete?: (instance: TemplateInstance) => void;
  className?: string;
}

export interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  onApprove?: (id: string, comment?: string) => void;
  onReject?: (id: string, comment?: string) => void;
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
