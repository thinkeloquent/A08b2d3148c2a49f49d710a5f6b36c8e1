import { useState, useCallback, useEffect, ReactNode } from 'react';
import type {
  TemplateManagePresentsProps,
  CatalogViewProps,
  PresetCardProps,
  PresetEditFormProps,
  PresetDetailProps,
  SetupWizardProps,
  InstancesViewProps,
  InstanceDetailProps,
  TemplatesAdminProps,
  TemplateEditFormProps,
  PresetsAdminProps,
  ApprovalsViewProps,
  AuditViewProps,
  SidebarProps,
  BadgeProps,
  ButtonProps,
  StatCardProps,
  ProgressBarProps,
  FieldProps,
  SelectFieldProps,
  ToggleProps,
  ReviewSectionProps,
  Template,
  TemplatePreset,
  TemplateInstance,
  TemplateToken,
  TemplateModule,
  NavItem,
} from './types';

// ─── Utilities ─────────────────────────────────────────────

function cx(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  backend: 'blue',
  frontend: 'purple',
  data: 'amber',
  infrastructure: 'green',
  all: 'default',
};

const CATEGORY_COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
  purple: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200',
  amber: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  red: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  default: 'bg-slate-100 text-slate-600',
};

function getCategoryColorClass(category: string, categoryColors: Record<string, string>) {
  const color = categoryColors[category.toLowerCase()] ?? 'default';
  return CATEGORY_COLOR_CLASSES[color] ?? CATEGORY_COLOR_CLASSES.default;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'catalog', label: 'Catalog', section: 'discover' },
  { id: 'templates', label: 'Templates', section: 'manage' },
  { id: 'presets', label: 'Presets', section: 'manage' },
  { id: 'instances', label: 'Instances', section: 'manage' },
  { id: 'approvals', label: 'Approvals', section: 'govern' },
  { id: 'audit', label: 'Audit Log', section: 'govern' },
];

// ─── Badge ─────────────────────────────────────────────────

const BADGE_VARIANTS: Record<string, string> = {
  default: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
  green: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  red: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  purple: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200',
  ghost: 'bg-white text-slate-500 ring-1 ring-slate-200',
};

function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
        BADGE_VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Button ────────────────────────────────────────────────

const BUTTON_VARIANTS: Record<string, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
  secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-300 focus:ring-offset-2',
  ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2',
};

const BUTTON_SIZES: Record<string, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-3.5 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  icon,
  as: Component = 'button',
  className,
}: ButtonProps) {
  return (
    <Component
      className={cx(
        'inline-flex items-center rounded-lg font-medium transition-all duration-200',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={Component === 'button' ? disabled : undefined}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </Component>
  );
}

// ─── StatCard ──────────────────────────────────────────────

function StatCard({ label, value, sub, className }: StatCardProps) {
  return (
    <div
      className={cx(
        'bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3',
        className
      )}
    >
      <div className="text-xs text-slate-400 font-medium mb-1">{label}</div>
      <div className="text-xl font-semibold text-slate-800">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── ProgressBar ───────────────────────────────────────────

function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cx('w-full bg-slate-100 rounded-full h-2 overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────

function Field({ label, required, value, onChange, hint, placeholder, className }: FieldProps) {
  return (
    <div className={cx('space-y-1.5', className)}>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-shadow"
      />
      {hint && <div className="text-[11px] text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

// ─── SelectField ───────────────────────────────────────────

function SelectField({ label, value, onChange, options, className }: SelectFieldProps) {
  return (
    <div className={cx('space-y-1.5', className)}>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-shadow capitalize"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Toggle ────────────────────────────────────────────────

function Toggle({ checked, onChange, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-indigo-600' : 'bg-slate-200',
        className
      )}
    >
      <span
        className={cx(
          'pointer-events-none inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// ─── ReviewSection ─────────────────────────────────────────

function ReviewSection({ title, items, className }: ReviewSectionProps) {
  return (
    <div className={cx('bg-slate-50 rounded-lg p-4', className)}>
      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2.5">{title}</h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-200 last:border-0">
            <span className="text-xs text-slate-500 flex items-center gap-2">
              {item.locked && (
                <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              {item.k}
            </span>
            <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
              {item.check && (
                <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {item.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────

function Sidebar({
  items,
  active,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  title = 'Template Platform',
  brandIcon,
  className,
}: SidebarProps) {
  const sections = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section ?? 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <div
      className={cx(
        'h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56',
        className
      )}
    >
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {Object.entries(sections).map(([section, sectionItems]) => (
          <div key={section}>
            {!collapsed && (
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium px-3 pt-2 pb-1.5">
                {section}
              </div>
            )}
            <div className="space-y-0.5">
              {sectionItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    active === item.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="h-10 flex items-center justify-center border-t border-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── CatalogView ───────────────────────────────────────────

function CatalogView({
  presets,
  categories = [],
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onSelect,
  onEdit,
  onGenerate,
  className,
}: CatalogViewProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = presets.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const featured = filtered.filter((p) => p.featured);
  const regular = filtered.filter((p) => !p.featured);
  const allCategories = ['all', ...categories];

  return (
    <div className={cx('space-y-6', className)}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Template Preset Catalog</h1>
        <p className="text-sm text-slate-500 mt-1">Browse and deploy pre-configured template presets</p>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search presets..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white focus:ring-indigo-300 focus:outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cx(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
              activeCategory === cat
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                featured
                categoryColors={categoryColors}
                onSelect={onSelect}
                onEdit={onEdit}
                onGenerate={onGenerate}
              />
            ))}
          </div>
        </div>
      )}

      {/* All presets */}
      <div>
        {featured.length > 0 && (
          <h2 className="text-sm font-semibold text-slate-800 mb-3">All Presets</h2>
        )}
        {regular.length === 0 && featured.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-sm text-slate-500">No presets found</div>
            <div className="text-sm text-slate-500">Try adjusting your search or filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                categoryColors={categoryColors}
                onSelect={onSelect}
                onEdit={onEdit}
                onGenerate={onGenerate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PresetCard ────────────────────────────────────────────

function PresetCard({
  preset,
  featured = false,
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onSelect,
  onEdit,
  onGenerate,
  className,
}: PresetCardProps) {
  return (
    <div
      className={cx(
        'w-full bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200 group',
        featured && 'ring-indigo-100',
        className
      )}
    >
      {/* Clickable content area */}
      <button
        onClick={() => onSelect?.(preset)}
        className="text-left w-full p-5 pb-3 cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cx('font-semibold text-slate-800 group-hover:text-indigo-700 truncate', featured ? 'text-base' : 'text-sm')}>
                {preset.name}
              </h3>
              {featured && (
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )}
            </div>
            <Badge variant={categoryColors[preset.category.toLowerCase()] as BadgeProps['variant'] ?? 'default'}>
              {preset.category}
            </Badge>
          </div>
          <Badge variant={preset.status === 'published' ? 'green' : preset.status === 'draft' ? 'amber' : 'red'}>
            {preset.status}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{preset.description}</p>

        {/* Tags */}
        {preset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {preset.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 text-[10px] text-slate-500 bg-slate-100 rounded">
                {tag}
              </span>
            ))}
            {preset.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-400">+{preset.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          {preset.uses !== undefined && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {preset.uses} uses
            </span>
          )}
          {preset.successRate !== undefined && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {preset.successRate}%
            </span>
          )}
          <span className="ml-auto text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100">v{preset.version}</span>
        </div>
      </button>

      {/* Action bar */}
      {(onEdit || onGenerate) && (
        <div className="flex items-center justify-end gap-2 px-5 pb-4 pt-1 border-t border-slate-100 mt-1">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(preset); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          {onGenerate && preset.status !== 'deprecated' && (
            <button
              onClick={(e) => { e.stopPropagation(); onGenerate(preset); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PresetDetail ──────────────────────────────────────────

function PresetDetail({
  preset,
  onBack,
  onGenerate,
  categoryColors = DEFAULT_CATEGORY_COLORS,
  className,
}: PresetDetailProps) {
  return (
    <div className={cx('space-y-6', className)}>
      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Catalog
        </button>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-slate-800">{preset.name}</h1>
              <Badge variant={preset.status === 'published' ? 'green' : preset.status === 'draft' ? 'amber' : 'red'}>
                {preset.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl">{preset.description}</p>
          </div>
          {onGenerate && (
            <Button onClick={onGenerate}>
              Generate Instance
            </Button>
          )}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard label="Category" value={preset.category} />
          <StatCard label="Version" value={`v${preset.version}`} />
          <StatCard label="Template" value={preset.template} />
          {preset.uses !== undefined && <StatCard label="Total Uses" value={preset.uses} />}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modules */}
        {(preset.requiredModules || preset.optionalModules) && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Modules</h3>
            {preset.requiredModules && preset.requiredModules.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Required</div>
                <div className="space-y-1.5">
                  {preset.requiredModules.map((mod, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-700">{mod.name}</span>
                      <span className="text-[10px] text-slate-400">v{mod.version}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {preset.optionalModules && preset.optionalModules.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Optional</div>
                <div className="space-y-1.5">
                  {preset.optionalModules.map((mod, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-700">{mod.name}</span>
                      <span className="text-[10px] text-slate-400">v{mod.version}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Policies */}
        {preset.policies && preset.policies.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Policies</h3>
            <div className="space-y-1.5">
              {preset.policies.map((policy, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-700">{policy.name}</span>
                  <Badge
                    variant={
                      policy.status === 'enforced' ? 'green' : policy.status === 'advisory' ? 'amber' : 'red'
                    }
                  >
                    {policy.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {preset.references && preset.references.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">References</h3>
            <div className="space-y-1.5">
              {preset.references.map((ref, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-700">{ref.appName}</span>
                  {ref.usageContext && (
                    <span className="text-[10px] text-slate-400">{ref.usageContext}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Labels */}
        {preset.labels && preset.labels.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Labels</h3>
            <div className="flex flex-wrap gap-2">
              {preset.labels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600"
                >
                  {label.color && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                  )}
                  {label.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {preset.tags.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {preset.tags.map((tag) => (
              <Badge key={tag} variant="ghost">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PresetEditForm ───────────────────────────────────────

function PresetEditForm({
  preset,
  templates = [],
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onSave,
  onDelete,
  onBack,
  className,
}: PresetEditFormProps) {
  const [form, setForm] = useState<TemplatePreset>({ ...preset });
  const [tagInput, setTagInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateField = <K extends keyof TemplatePreset>(key: K, value: TemplatePreset[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      updateField('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateField('tags', form.tags.filter((t) => t !== tag));
  };

  const addModule = (type: 'requiredModules' | 'optionalModules') => {
    const current = form[type] ?? [];
    updateField(type, [...current, { name: '', version: '1.0.0', category: '' }]);
  };

  const updateModule = (type: 'requiredModules' | 'optionalModules', index: number, field: string, value: string) => {
    const current = [...(form[type] ?? [])];
    current[index] = { ...current[index], [field]: value };
    updateField(type, current);
  };

  const removeModule = (type: 'requiredModules' | 'optionalModules', index: number) => {
    const current = [...(form[type] ?? [])];
    current.splice(index, 1);
    updateField(type, current);
  };

  const addPolicy = () => {
    const current = form.policies ?? [];
    updateField('policies', [...current, { name: '', status: 'advisory' as const }]);
  };

  const updatePolicy = (index: number, field: string, value: string) => {
    const current = [...(form.policies ?? [])];
    current[index] = { ...current[index], [field]: value };
    updateField('policies', current);
  };

  const removePolicy = (index: number) => {
    const current = [...(form.policies ?? [])];
    current.splice(index, 1);
    updateField('policies', current);
  };

  const addConfigField = () => {
    const current = form.configFields ?? [];
    updateField('configFields', [...current, '']);
  };

  const updateConfigField = (index: number, value: string) => {
    const current = [...(form.configFields ?? [])];
    current[index] = value;
    updateField('configFields', current);
  };

  const removeConfigField = (index: number) => {
    const current = [...(form.configFields ?? [])];
    current.splice(index, 1);
    updateField('configFields', current);
  };

  return (
    <div className={cx('space-y-6', className)}>
      {/* Back */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Catalog
        </button>
      )}

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {preset.id ? 'Edit Preset' : 'New Preset'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {preset.id ? `Editing ${preset.name}` : 'Create a new template preset'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onDelete && preset.id && (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )}
          <Button onClick={() => onSave?.(form)}>
            Save Preset
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-red-800">Delete this preset?</div>
            <div className="text-xs text-red-600 mt-0.5">This action cannot be undone.</div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete?.(preset)}>Confirm Delete</Button>
          </div>
        </div>
      )}

      {/* Metadata card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-medium text-slate-700">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name" required value={form.name} onChange={(v) => updateField('name', v)} placeholder="Preset name" />
          <Field label="Slug" required value={form.slug} onChange={(v) => updateField('slug', v)} placeholder="preset-slug" />
        </div>
        <Field label="Description" required value={form.description} onChange={(v) => updateField('description', v)} placeholder="Brief description of this preset" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Purpose" value={form.purpose ?? ''} onChange={(v) => updateField('purpose', v)} placeholder="Why this preset exists" />
          <Field label="Audience" value={form.audience ?? ''} onChange={(v) => updateField('audience', v)} placeholder="Target audience" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField label="Category" value={form.category} onChange={(v) => updateField('category', v)} options={Object.keys(categoryColors).map((c) => c.charAt(0).toUpperCase() + c.slice(1))} />
          <Field label="Version" required value={form.version} onChange={(v) => updateField('version', v)} placeholder="1.0.0" />
          <SelectField label="Status" value={form.status} onChange={(v) => updateField('status', v as TemplatePreset['status'])} options={['draft', 'published', 'deprecated']} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Template" required value={form.template} onChange={(v) => updateField('template', v)} placeholder="Base template slug" />
          <Field label="Template Version" value={form.templateVersion} onChange={(v) => updateField('templateVersion', v)} placeholder="1.0.0" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-700">Featured</label>
          <Toggle checked={form.featured ?? false} onChange={(v) => updateField('featured', v)} />
        </div>
      </div>

      {/* Tags card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-medium text-slate-700">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {form.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
              {tag}
              <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500 transition-colors ml-0.5">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add tag..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-shadow"
          />
          <Button variant="secondary" size="sm" onClick={addTag}>Add</Button>
        </div>
      </div>

      {/* Config Fields card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-700">Configuration Fields</h2>
          <Button variant="secondary" size="sm" onClick={addConfigField}>+ Add Field</Button>
        </div>
        <p className="text-xs text-slate-400">Fields exposed to consumers during the setup wizard.</p>
        {(form.configFields ?? []).length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-400">No configuration fields defined.</div>
        ) : (
          <div className="space-y-2">
            {(form.configFields ?? []).map((field, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={field}
                  onChange={(e) => updateConfigField(i, e.target.value)}
                  placeholder="Field name"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                />
                <button onClick={() => removeConfigField(i)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modules card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-medium text-slate-700">Modules</h2>

        {/* Required Modules */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Required Modules</div>
            <Button variant="secondary" size="sm" onClick={() => addModule('requiredModules')}>+ Add</Button>
          </div>
          {(form.requiredModules ?? []).length === 0 ? (
            <div className="text-center py-4 text-sm text-slate-400">No required modules.</div>
          ) : (
            <div className="space-y-2">
              {(form.requiredModules ?? []).map((mod, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                  <input type="text" value={mod.name} onChange={(e) => updateModule('requiredModules', i, 'name', e.target.value)} placeholder="Module name" className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  <input type="text" value={mod.version} onChange={(e) => updateModule('requiredModules', i, 'version', e.target.value)} placeholder="Version" className="w-20 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  <input type="text" value={mod.category} onChange={(e) => updateModule('requiredModules', i, 'category', e.target.value)} placeholder="Category" className="w-24 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  <button onClick={() => removeModule('requiredModules', i)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Modules */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Optional Modules</div>
            <Button variant="secondary" size="sm" onClick={() => addModule('optionalModules')}>+ Add</Button>
          </div>
          {(form.optionalModules ?? []).length === 0 ? (
            <div className="text-center py-4 text-sm text-slate-400">No optional modules.</div>
          ) : (
            <div className="space-y-2">
              {(form.optionalModules ?? []).map((mod, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                  <input type="text" value={mod.name} onChange={(e) => updateModule('optionalModules', i, 'name', e.target.value)} placeholder="Module name" className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  <input type="text" value={mod.version} onChange={(e) => updateModule('optionalModules', i, 'version', e.target.value)} placeholder="Version" className="w-20 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  <input type="text" value={mod.category} onChange={(e) => updateModule('optionalModules', i, 'category', e.target.value)} placeholder="Category" className="w-24 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  <button onClick={() => removeModule('optionalModules', i)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Policies card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-700">Policies</h2>
          <Button variant="secondary" size="sm" onClick={addPolicy}>+ Add Policy</Button>
        </div>
        {(form.policies ?? []).length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-400">No policies attached.</div>
        ) : (
          <div className="space-y-2">
            {(form.policies ?? []).map((policy, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                <input type="text" value={policy.name} onChange={(e) => updatePolicy(i, 'name', e.target.value)} placeholder="Policy name" className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                <select value={policy.status} onChange={(e) => updatePolicy(i, 'status', e.target.value)} className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                  <option value="enforced">Enforced</option>
                  <option value="advisory">Advisory</option>
                  <option value="disabled">Disabled</option>
                </select>
                <button onClick={() => removePolicy(i)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SetupWizard ───────────────────────────────────────────

function SetupWizard({
  preset,
  onBack,
  onComplete,
  steps = ['Configure', 'Review', 'Generate'],
  generationPipeline = ['Validate configuration', 'Resolve tokens', 'Apply template', 'Run policies', 'Generate output'],
  className,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setPipelineStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= generationPipeline.length) {
        clearInterval(interval);
        setGenerating(false);
        setGenerated(true);
        onComplete?.(config);
      } else {
        setPipelineStep(step);
      }
    }, 800);
  }, [config, generationPipeline.length, onComplete]);

  return (
    <div className={cx('space-y-6', className)}>
      {/* Back */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {preset.name}
        </button>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cx(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all',
                i < currentStep
                  ? 'bg-emerald-100 text-emerald-600'
                  : i === currentStep
                  ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
                  : 'bg-slate-100 text-slate-400'
              )}
            >
              {i < currentStep ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cx(
                'text-xs font-medium',
                i < currentStep
                  ? 'text-emerald-600'
                  : i === currentStep
                  ? 'text-indigo-600'
                  : 'text-slate-400'
              )}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <div className={cx('w-8 h-px', i < currentStep ? 'bg-emerald-300' : 'bg-slate-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {currentStep === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Configure {preset.name}</h2>
            <p className="text-sm text-slate-500">Fill in the required configuration fields.</p>
            {preset.configFields?.map((field) => (
              <Field
                key={field}
                label={field}
                required
                value={config[field] ?? ''}
                onChange={(v) => setConfig((prev) => ({ ...prev, [field]: v }))}
                placeholder={`Enter ${field.toLowerCase()}`}
              />
            )) ?? (
              <div className="text-sm text-slate-500 py-4 text-center">No configuration fields defined for this preset.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(1)}>Continue to Review</Button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Review Configuration</h2>
            <ReviewSection
              title="Preset"
              items={[
                { k: 'Name', v: preset.name },
                { k: 'Template', v: preset.template },
                { k: 'Version', v: `v${preset.version}`, locked: true },
                { k: 'Category', v: preset.category },
              ]}
            />
            {Object.keys(config).length > 0 && (
              <ReviewSection
                title="Configuration"
                items={Object.entries(config).map(([k, v]) => ({ k, v, check: true }))}
              />
            )}
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(0)}>Back</Button>
              <Button onClick={() => setCurrentStep(2)}>Proceed to Generate</Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Generate Instance</h2>
            {!generating && !generated && (
              <>
                <p className="text-sm text-slate-500">
                  Ready to generate an instance from <span className="text-indigo-600">{preset.name}</span>.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Generation Pipeline</div>
                  {generationPipeline.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-500 py-1">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                        {i + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setCurrentStep(1)}>Back</Button>
                  <Button variant="success" onClick={handleGenerate}>
                    Generate Now
                  </Button>
                </div>
              </>
            )}

            {generating && (
              <div className="space-y-3 py-4">
                {generationPipeline.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={cx(
                        'w-5 h-5 rounded-full flex items-center justify-center transition-all',
                        i < pipelineStep
                          ? 'bg-emerald-100 text-emerald-600'
                          : i === pipelineStep
                          ? 'bg-indigo-100 text-indigo-600 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {i < pipelineStep ? (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : i === pipelineStep ? (
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      ) : (
                        <span className="text-[10px]">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={cx(
                        'text-sm',
                        i < pipelineStep
                          ? 'text-emerald-600'
                          : i === pipelineStep
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      )}
                    >
                      {step}
                    </span>
                  </div>
                ))}
                <div className="mt-4">
                  <div className="text-sm font-medium text-indigo-600 mb-2">Processing...</div>
                  <ProgressBar value={((pipelineStep + 1) / generationPipeline.length) * 100} />
                </div>
              </div>
            )}

            {generated && (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-lg font-semibold text-slate-800">Instance Generated Successfully</div>
                <p className="text-xs text-slate-500 mt-1">Your instance has been created and is ready to use.</p>
                <div className="bg-slate-50 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Preset</span>
                    <span className="text-slate-600">{preset.name}</span>
                  </div>
                </div>
                {onBack && (
                  <Button variant="secondary" onClick={onBack} className="mt-4">
                    Return to Catalog
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── InstancesView ─────────────────────────────────────────

function InstancesView({ instances, onView, onDelete, className }: InstancesViewProps) {
  const statusColor = (s: string) =>
    s === 'success' ? 'green' : s === 'failed' ? 'red' : 'amber';

  return (
    <div className={cx('space-y-6', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Instances</h1>
        <p className="text-sm text-slate-500 mt-1">Generated template instances</p>
      </div>

      {instances.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="text-sm text-slate-500">No instances yet</div>
          <div className="text-sm text-slate-500">Generate an instance from a template preset to see it here.</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Preset</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Generated By</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                {(onView || onDelete) && <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500"></th>}
              </tr>
            </thead>
            <tbody>
              {instances.map((inst) => (
                <tr key={inst.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-sm text-slate-700">{inst.name}</td>
                  <td className="px-4 py-3 text-slate-600">{inst.preset}</td>
                  <td className="px-4 py-3 text-slate-600">{inst.generatedBy}</td>
                  <td className="px-4 py-3 text-slate-500">{inst.generatedAt}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColor(inst.status)}>{inst.status}</Badge>
                  </td>
                  {(onView || onDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {onView && (
                          <button onClick={() => onView(inst)} className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">View</button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(inst)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── InstanceDetail ────────────────────────────────────────

function InstanceDetail({ instance, onBack, onDelete, className }: InstanceDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const statusColor = (s: string) =>
    s === 'success' ? 'green' : s === 'failed' ? 'red' : 'amber';

  return (
    <div className={cx('space-y-6', className)}>
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Instances
        </button>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{instance.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Generated instance details</p>
        </div>
        {onDelete && (
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Delete Instance</Button>
        )}
      </div>

      {confirmDelete && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-red-800">Delete this instance?</div>
            <div className="text-xs text-red-600 mt-0.5">This action cannot be undone.</div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete?.(instance)}>Confirm Delete</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Preset" value={instance.preset} />
          <StatCard label="Version" value={`v${instance.presetVersion}`} />
          <StatCard label="Generated By" value={instance.generatedBy} />
          <StatCard label="Date" value={instance.generatedAt} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Status:</span>
          <Badge variant={statusColor(instance.status)}>{instance.status}</Badge>
        </div>
      </div>

      {instance.tokenValues && Object.keys(instance.tokenValues).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">Configuration Values</h3>
          <ReviewSection
            title="Applied Configuration"
            items={Object.entries(instance.tokenValues).map(([k, v]) => ({ k, v, check: true }))}
          />
        </div>
      )}
    </div>
  );
}

// ─── TemplatesAdmin ────────────────────────────────────────

function TemplatesAdmin({
  templates,
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onNew,
  onEdit,
  onDelete,
  className,
}: TemplatesAdminProps) {
  return (
    <div className={cx('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Templates</h1>
          <p className="text-sm text-slate-500 mt-1">Manage raw template sources</p>
        </div>
        {onNew && (
          <Button onClick={onNew} size="sm">
            New Template
          </Button>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-sm text-slate-500">No templates yet</div>
          <div className="text-sm text-slate-500">Create your first template to get started.</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Version</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Presets</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Tokens</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tmpl) => (
                <tr key={tmpl.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{tmpl.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={categoryColors[tmpl.category.toLowerCase()] as BadgeProps['variant'] ?? 'default'}>
                      {tmpl.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">v{tmpl.version}</td>
                  <td className="px-4 py-3">
                    <Badge variant={tmpl.status === 'published' ? 'green' : tmpl.status === 'draft' ? 'amber' : 'red'}>
                      {tmpl.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{tmpl.presetCount ?? 0}</td>
                  <td className="px-4 py-3 text-slate-600">{tmpl.tokens?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(tmpl)} className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">Edit</button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(tmpl)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── TemplateEditForm ──────────────────────────────────────

const EDIT_TABS = [
  { id: 'meta', label: 'Metadata', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  { id: 'vars', label: 'Variables', icon: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01' },
  { id: 'code', label: 'Content', icon: 'm16 18 6-6-6-6M8 6l-6 6 6 6' },
  { id: 'mods', label: 'Modules', icon: 'M19.4 7.8c0 .3.1.6.3.9l1.6 1.5c.9.9.9 2.5 0 3.4l-1.6 1.6c-.2.2-.3.5-.3.8 0 .5-.3.9-.7 1.1a2.5 2.5 0 1 0-3.2 3.2c.2.5.6.9 1.1.7a1 1 0 0 1 .8.3l-1.6 1.6a2.4 2.4 0 0 1-3.4 0l-1.5-1.6a1 1 0 0 0-.9-.3c-.5 0-.9.3-1.1.7a2.5 2.5 0 1 1-3.2-3.2c.4-.2.7-.6.7-1.1 0-.3-.1-.6-.3-.9L3.6 13.7A2.4 2.4 0 0 1 3 12c0-.6.2-1.2.7-1.7l1.6-1.6c.2-.2.3-.5.3-.8 0-.5.3-.9.7-1.1a2.5 2.5 0 1 0 3.2-3.2c-.4-.2-.6-.5-.7-1a1 1 0 0 1 .3-.8l1.6-1.6a2.4 2.4 0 0 1 3.4 0l1.5 1.6c.2.2.6.3.9.3.5 0 .9-.3 1-.7a2.5 2.5 0 1 1 3.3 3.2c-.5.2-.8.6-.8 1z' },
  { id: 'docs', label: 'Docs', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6M9 9h1' },
  { id: 'ver', label: 'Versions', icon: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9' },
] as const;

type EditTab = typeof EDIT_TABS[number]['id'];

const TOKEN_TYPE_COLORS: Record<string, string> = {
  text: 'bg-sky-50 text-sky-700',
  string: 'bg-sky-50 text-sky-700',
  number: 'bg-violet-50 text-violet-700',
  enum: 'bg-fuchsia-50 text-fuchsia-700',
  boolean: 'bg-teal-50 text-teal-700',
  secret: 'bg-red-50 text-red-700',
  date: 'bg-amber-50 text-amber-700',
  email: 'bg-blue-50 text-blue-700',
  url: 'bg-indigo-50 text-indigo-700',
  list: 'bg-emerald-50 text-emerald-700',
};

const MODULE_CAT_COLORS: Record<string, string> = {
  auth: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  database: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200',
  monitoring: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  'ci-cd': 'bg-violet-50 text-violet-800 ring-1 ring-violet-200',
  infra: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  security: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

function EditTabIcon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function EditOverlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.25)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function VarEditModal({ token, onSave, onClose }: {
  token: TemplateToken | null;
  onSave: (t: TemplateToken) => void;
  onClose: () => void;
}) {
  const blank: TemplateToken = { name: '', type: 'text', required: true, defaultValue: '', description: '', validation: '', options: [] };
  const [f, setF] = useState<TemplateToken>(token ?? blank);
  const [optText, setOptText] = useState((token?.options ?? []).join(', '));
  const up = (k: keyof TemplateToken, val: TemplateToken[keyof TemplateToken]) => setF((p) => ({ ...p, [k]: val }));

  return (
    <EditOverlay onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">{token ? 'Edit Variable' : 'Add Variable'}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
          <EditTabIcon d="M18 6 6 18M6 6l12 12" size={18} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Key <span className="text-red-400">*</span></label>
            <input value={f.name} onChange={(e) => up('name', e.target.value)} placeholder="e.g. service_name" className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Type</label>
            <select value={f.type ?? 'text'} onChange={(e) => up('type', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none">
              {['text', 'number', 'enum', 'boolean', 'list', 'secret'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
          <input value={f.description ?? ''} onChange={(e) => up('description', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Default</label>
            <input value={f.defaultValue ?? ''} onChange={(e) => up('defaultValue', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Validation</label>
            <input value={f.validation ?? ''} onChange={(e) => up('validation', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono text-xs" />
          </div>
        </div>
        {f.type === 'enum' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Options (comma-separated)</label>
            <input value={optText} onChange={(e) => { setOptText(e.target.value); up('options', e.target.value.split(',').map((s) => s.trim()).filter(Boolean)); }} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.required ?? false} onChange={(e) => up('required', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
          <span className="text-sm text-slate-600">Required field</span>
        </label>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
        <button onClick={() => onSave(f)} disabled={!f.name} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40 shadow-sm">{token ? 'Save Changes' : 'Add Variable'}</button>
      </div>
    </EditOverlay>
  );
}

function PublishModal({ currentVersion, onPublish, onClose }: {
  currentVersion: string;
  onPublish: (ver: string, log: string, brk: boolean) => void;
  onClose: () => void;
}) {
  const [ver, setVer] = useState('');
  const [log, setLog] = useState('');
  const [brk, setBrk] = useState(false);

  return (
    <EditOverlay onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">Publish New Version</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
          <EditTabIcon d="M18 6 6 18M6 6l12 12" size={18} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <EditTabIcon d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zM12 16v-4M12 8h.01" size={15} />
          <span className="text-xs text-slate-500">Current version: <strong className="text-slate-700">{currentVersion}</strong></span>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">New Version <span className="text-red-400">*</span></label>
          <input value={ver} onChange={(e) => setVer(e.target.value)} placeholder="e.g. 3.2.0" className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Changelog <span className="text-red-400">*</span></label>
          <textarea value={log} onChange={(e) => setLog(e.target.value)} rows={3} placeholder="What changed?" className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={brk} onChange={(e) => setBrk(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-red-600" />
          <span className="text-sm text-slate-600">Contains breaking changes</span>
        </label>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
        <button disabled={!ver || !log} onClick={() => onPublish(ver, log, brk)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40 shadow-sm">Publish Version</button>
      </div>
    </EditOverlay>
  );
}

function TemplateEditForm({
  template,
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onSave,
  onDelete,
  onPublish,
  onBack,
  className,
}: TemplateEditFormProps) {
  const [tab, setTab] = useState<EditTab>('meta');
  const [form, setForm] = useState<Template>({ ...template });
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [editingToken, setEditingToken] = useState<TemplateToken | null>(null);
  const [deleteTokenIdx, setDeleteTokenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const mark = () => setDirty(true);

  const updateField = <K extends keyof Template>(key: K, value: Template[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    mark();
  };

  const extracted = (() => {
    const out: string[] = [];
    const re = /\{\{\{\s*(\w+)\s*\}\}\}/g;
    let m: RegExpExecArray | null;
    const src = form.content ?? '';
    while ((m = re.exec(src)) !== null) {
      if (!out.includes(m[1])) out.push(m[1]);
    }
    return out;
  })();

  const tokens = form.tokens ?? [];
  const modules = form.modules ?? [];
  const versions = form.versions ?? [];

  const statusBadgeVariant = (s: string): BadgeProps['variant'] => {
    if (s === 'published') return 'green';
    if (s === 'draft') return 'amber';
    if (s === 'deprecated') return 'red';
    return 'default';
  };

  return (
    <div className={cx('space-y-5', className)}>
      {/* Top bar */}
      <div className="flex items-center justify-between">
        {onBack ? (
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            <EditTabIcon d="M19 12H5m7 7-7-7 7-7" size={15} /> Back to Templates
          </button>
        ) : <div />}
        <div className="flex items-center gap-3 flex-wrap">
          {dirty && <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">Unsaved changes</span>}
          {onDelete && template.id && (
            <button onClick={() => setModal('delTpl')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
              <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} /> Delete
            </button>
          )}
          {onPublish && (
            <button onClick={() => setModal('publish')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
              <EditTabIcon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" size={15} /> Publish Version
            </button>
          )}
          <button onClick={() => { setDirty(false); onSave?.(form); setToast('Template saved successfully'); }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors">
            <EditTabIcon d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" size={15} /> Save Template
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {template.id ? 'Edit Template' : 'New Template'}
          </h1>
          <Badge variant={statusBadgeVariant(form.status)}>{form.status.charAt(0).toUpperCase() + form.status.slice(1)}</Badge>
        </div>
        <p className="text-sm text-slate-500">
          {form.name || 'Untitled'} &middot; <span className="font-mono text-xs text-slate-400">v{form.version}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {EDIT_TABS.map((t) => {
          const count = t.id === 'vars' ? tokens.length : t.id === 'mods' ? modules.filter((m) => m.enabled).length : t.id === 'ver' ? versions.length : null;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={cx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            )}>
              <EditTabIcon d={t.icon} size={14} />
              {t.label}
              {count !== null && (
                <span className={cx('text-[11px] px-1.5 py-0.5 rounded-full', tab === t.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500')}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-6">

          {/* ─── META ─── */}
          {tab === 'meta' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">General Information</h2>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Name" required value={form.name} onChange={(v) => updateField('name', v)} placeholder="Template name" />
                <Field label="Slug" required value={form.slug} onChange={(v) => updateField('slug', v)} placeholder="template-slug" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
                <textarea value={form.description ?? ''} onChange={(e) => updateField('description', e.target.value)} rows={3} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-5">
                <SelectField label="Category" value={form.category} onChange={(v) => { updateField('category', v); }} options={Object.keys(categoryColors).filter((c) => c !== 'all').map((c) => c.charAt(0).toUpperCase() + c.slice(1))} />
                <Field label="Version" required value={form.version} onChange={(v) => updateField('version', v)} placeholder="1.0.0" />
                <SelectField label="Status" value={form.status} onChange={(v) => updateField('status', v as Template['status'])} options={['draft', 'published', 'deprecated', 'retired']} />
              </div>
              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tags</label>
                <div className="flex items-center gap-2 flex-wrap p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                  {(form.tags ?? []).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                      {tag}
                      <button onClick={() => updateField('tags', (form.tags ?? []).filter((t) => t !== tag))} className="text-slate-400 hover:text-red-500">
                        <EditTabIcon d="M18 6 6 18M6 6l12 12" size={11} />
                      </button>
                    </span>
                  ))}
                  <input placeholder="+ Add tag" className="flex-1 min-w-[80px] bg-transparent text-xs text-slate-600 focus:outline-none" onKeyDown={(e) => {
                    const input = e.target as HTMLInputElement;
                    if (e.key === 'Enter' && input.value.trim()) {
                      updateField('tags', [...(form.tags ?? []), input.value.trim()]);
                      input.value = '';
                    }
                  }} />
                </div>
              </div>
              {/* Source Repo */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Source Repository</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <input value={form.sourceRepo ?? ''} onChange={(e) => updateField('sourceRepo', e.target.value)} className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono text-xs" />
                </div>
              </div>
            </section>
          )}

          {/* ─── VARIABLES ─── */}
          {tab === 'vars' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Template Variables</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{tokens.length} variables &mdash; blueprints inherit these</p>
                </div>
                <button onClick={() => { setEditingToken(null); setModal('addVar'); }} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                  <EditTabIcon d="M12 5v14M5 12h14" size={15} /> Add Variable
                </button>
              </div>
              {tokens.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">No variables defined yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {tokens.map((v, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                      <svg className="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800 font-mono">{v.name}</span>
                          <span className={cx('inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide', TOKEN_TYPE_COLORS[v.type ?? 'text'] ?? 'bg-slate-100 text-slate-600')}>{v.type ?? 'text'}</span>
                          {v.required && <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Required</span>}
                        </div>
                        <p className="text-xs text-slate-400">{v.description}</p>
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          {v.defaultValue && <span className="text-[11px] text-slate-400">Default: <span className="font-mono text-slate-500">{v.defaultValue}</span></span>}
                          {v.validation && <span className="text-[11px] text-slate-400">Validation: <span className="font-mono text-slate-500">{v.validation}</span></span>}
                          {(v.options ?? []).length > 0 && <span className="text-[11px] text-slate-400">Options: <span className="font-mono text-slate-500">{v.options!.join(' | ')}</span></span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingToken(v); setModal('editVar'); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                          <EditTabIcon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} />
                        </button>
                        <button onClick={() => { setDeleteTokenIdx(i); setModal('delVar'); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                          <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── CONTENT ─── */}
          {tab === 'code' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Template Body</h2>
                <p className="text-xs text-slate-400 mt-0.5">{'Use {{{ variable }}} syntax for placeholders'}</p>
              </div>
              <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700" style={{ background: 'rgba(30,41,59,0.5)' }}>
                  <span className="text-xs text-slate-400 font-mono">template</span>
                  <span className="text-[10px] text-slate-500">{(form.content ?? '').split('\n').length} lines</span>
                </div>
                <div className="flex overflow-auto" style={{ maxHeight: 380 }}>
                  <div className="py-4 px-3 shrink-0 select-none" style={{ background: 'rgba(30,41,59,0.3)', minWidth: 44 }}>
                    {(form.content ?? '').split('\n').map((_, i) => <div key={i} className="text-right text-xs font-mono text-slate-600" style={{ lineHeight: '1.5rem' }}>{i + 1}</div>)}
                  </div>
                  <textarea
                    value={form.content ?? ''}
                    onChange={(e) => updateField('content', e.target.value)}
                    spellCheck={false}
                    className="flex-1 py-4 px-4 bg-transparent text-sm font-mono text-emerald-300 resize-none focus:outline-none w-full"
                    style={{ lineHeight: '1.5rem', minHeight: 240 }}
                  />
                </div>
              </div>
              {extracted.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <EditTabIcon d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zM12 16v-4M12 8h.01" size={13} />
                  <span className="text-[11px] text-slate-400">Referenced:</span>
                  {extracted.map((v) => <span key={v} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-mono">{v}</span>)}
                </div>
              )}
            </section>
          )}

          {/* ─── MODULES ─── */}
          {tab === 'mods' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800">Available Modules</h2>
                <p className="text-xs text-slate-400 mt-0.5">Toggle modules &mdash; required modules cannot be disabled</p>
              </div>
              {modules.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">No modules configured.</div>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-6">
                  {modules.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (!m.required) {
                          updateField('modules', modules.map((x) => x.id === m.id ? { ...x, enabled: !x.enabled } : x));
                        }
                      }}
                      className={cx(
                        'relative rounded-xl border-2 p-4 transition-all text-left',
                        m.enabled ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={cx('inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', MODULE_CAT_COLORS[m.category] ?? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200')}>{m.category}</span>
                          {m.required && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                              <EditTabIcon d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" size={10} /> Required
                            </span>
                          )}
                        </div>
                        <div className={cx(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                          m.enabled ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white',
                          m.required ? 'opacity-50' : ''
                        )}>
                          {m.enabled && <EditTabIcon d="M20 6 9 17l-5-5" size={12} />}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-0.5">{m.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-2">{m.slug}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── DOCS ─── */}
          {tab === 'docs' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Template Documentation</h2>
                <p className="text-xs text-slate-400 mt-0.5">Markdown shown to blueprint authors and consumers</p>
              </div>
              <textarea
                value={form.docs ?? ''}
                onChange={(e) => updateField('docs', e.target.value)}
                rows={20}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none font-mono leading-relaxed"
              />
            </section>
          )}

          {/* ─── VERSIONS ─── */}
          {tab === 'ver' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Version History</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Published versions are immutable</p>
                </div>
                {onPublish && (
                  <button onClick={() => setModal('publish')} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                    <EditTabIcon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" size={15} /> Publish New
                  </button>
                )}
              </div>
              {versions.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">No version history yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {versions.map((ver, i) => (
                    <div key={ver.version} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col items-center pt-1">
                        <div className={cx('w-3 h-3 rounded-full border-2', i === 0 ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 bg-white')} />
                        {i < versions.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" style={{ minHeight: 24 }} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                          <span className="text-sm font-bold font-mono text-slate-800">v{ver.version}</span>
                          <Badge variant={statusBadgeVariant(ver.status)}>{ver.status.charAt(0).toUpperCase() + ver.status.slice(1)}</Badge>
                          {ver.breaking && <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded">Breaking</span>}
                        </div>
                        <p className="text-sm text-slate-600">{ver.changelog}</p>
                        <p className="text-xs text-slate-400 mt-1.5">{ver.author} &middot; {ver.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Right sidebar ─── */}
        <div className="w-64 shrink-0 space-y-5 hidden lg:block">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Template Info</h3>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-xs text-slate-500">Owner</span>
              <span className="text-xs font-medium text-slate-700">{form.owner ?? 'Unassigned'}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-xs text-slate-500">Category</span>
              <span className="text-xs font-medium text-slate-700 capitalize">{form.category}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-xs text-slate-500">Status</span>
              <Badge variant={statusBadgeVariant(form.status)}>{form.status}</Badge>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-xs text-slate-500">Version</span>
              <span className="text-xs font-medium text-slate-700 font-mono">v{form.version}</span>
            </div>
            <div className="h-px bg-slate-100 my-1" />
            <div className="flex items-center justify-between py-0.5">
              <span className="text-xs text-slate-500">Presets</span>
              <span className="text-xs font-medium text-indigo-600">{form.presetCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-xs text-slate-500">Instances</span>
              <span className="text-xs font-medium text-emerald-600">{form.instanceCount ?? 0}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Actions</h3>
            {[
              { icon: 'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1', label: 'Duplicate Template' },
              { icon: 'm12 2-10 5 10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5', label: 'Create Blueprint' },
              { icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', label: 'Preview Output' },
            ].map((qa) => (
              <button key={qa.label} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors text-left">
                <EditTabIcon d={qa.icon} size={14} /> {qa.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {(modal === 'addVar' || modal === 'editVar') && (
        <VarEditModal
          token={editingToken}
          onSave={(t) => {
            if (modal === 'editVar' && editingToken) {
              updateField('tokens', tokens.map((x) => x.name === editingToken.name ? t : x));
              setToast('Variable updated');
            } else {
              updateField('tokens', [...tokens, t]);
              setToast('Variable added');
            }
            setModal(null);
            setEditingToken(null);
          }}
          onClose={() => { setModal(null); setEditingToken(null); }}
        />
      )}

      {modal === 'publish' && (
        <PublishModal
          currentVersion={form.version}
          onPublish={(ver, log, brk) => {
            updateField('version', ver);
            onPublish?.(form, ver, log, brk);
            setToast('Version ' + ver + ' published');
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'delVar' && (
        <EditOverlay onClose={() => setModal(null)}>
          <div className="px-6 py-5">
            <h3 className="text-base font-semibold text-slate-800">Remove Variable</h3>
            <p className="text-sm text-slate-500 mt-2">Blueprints referencing this variable may break. This cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => {
              if (deleteTokenIdx !== null) {
                updateField('tokens', tokens.filter((_, i) => i !== deleteTokenIdx));
                setToast('Variable removed');
              }
              setModal(null);
              setDeleteTokenIdx(null);
            }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Delete</button>
          </div>
        </EditOverlay>
      )}

      {modal === 'delTpl' && (
        <EditOverlay onClose={() => setModal(null)}>
          <div className="px-6 py-5">
            <h3 className="text-base font-semibold text-slate-800">Delete Template</h3>
            <p className="text-sm text-slate-500 mt-2">This permanently removes all versions. This cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => { setModal(null); onDelete?.(template); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Delete</button>
          </div>
        </EditOverlay>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-lg text-sm font-medium">
          <EditTabIcon d="M20 6 9 17l-5-5" size={16} /> {toast}
          <button onClick={() => setToast(null)} className="ml-2 text-emerald-600 hover:text-emerald-800">
            <EditTabIcon d="M18 6 6 18M6 6l12 12" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PresetsAdmin ──────────────────────────────────────────

function PresetsAdmin({
  presets,
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onNew,
  onEdit,
  onDelete,
  className,
}: PresetsAdminProps) {
  return (
    <div className={cx('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Presets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage template preset configurations</p>
        </div>
        {onNew && (
          <Button onClick={onNew} size="sm">
            New Preset
          </Button>
        )}
      </div>

      {presets.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div className="text-sm text-slate-500">No presets yet</div>
          <div className="text-sm text-slate-500">Create your first preset to get started.</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Template</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Version</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Uses</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {presets.map((preset) => (
                <tr key={preset.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{preset.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{preset.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{preset.template}</td>
                  <td className="px-4 py-3">
                    <Badge variant={categoryColors[preset.category.toLowerCase()] as BadgeProps['variant'] ?? 'default'}>
                      {preset.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">v{preset.version}</td>
                  <td className="px-4 py-3">
                    <Badge variant={preset.status === 'published' ? 'green' : preset.status === 'draft' ? 'amber' : 'red'}>
                      {preset.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{preset.uses ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(preset)} className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">Edit</button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(preset)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── ApprovalsView ─────────────────────────────────────────

function ApprovalsView({ approvals, onApprove, onReject, className }: ApprovalsViewProps) {
  return (
    <div className={cx('space-y-6', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Approvals</h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve preset changes</p>
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-slate-500">No pending approvals</div>
          <div className="text-sm text-slate-500">All caught up! Check back later.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{req.preset}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    by {req.author} &middot; {req.submitted}
                    {req.baseTemplate && <> &middot; Base: {req.baseTemplate}</>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {onApprove && (
                    <Button variant="success" size="sm" onClick={() => onApprove(req.id)}>
                      Approve
                    </Button>
                  )}
                  {onReject && (
                    <Button variant="danger" size="sm" onClick={() => onReject(req.id)}>
                      Reject
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Changes</div>
                {req.changes.map((change, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {change}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AuditView ─────────────────────────────────────────────

const DEFAULT_ACTION_COLORS: Record<string, string> = {
  created: 'green',
  updated: 'blue',
  deleted: 'red',
  approved: 'green',
  rejected: 'red',
  generated: 'purple',
  published: 'green',
  deprecated: 'amber',
};

function AuditView({ entries, actionColors = DEFAULT_ACTION_COLORS, className }: AuditViewProps) {
  return (
    <div className={cx('space-y-6', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Audit Log</h1>
        <p className="text-sm text-slate-500 mt-1">Activity history and change tracking</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-slate-500">No audit entries</div>
          <div className="text-sm text-slate-500">Activity will appear here as changes are made.</div>
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, i) => {
            const colorVariant = (actionColors[entry.action.toLowerCase()] ?? 'default') as BadgeProps['variant'];
            return (
              <div
                key={entry.id ?? i}
                className="flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <span className="text-xs text-slate-500 w-36 flex-shrink-0 font-mono">{entry.timestamp}</span>
                <Badge variant={colorVariant} className="w-20 justify-center flex-shrink-0">
                  {entry.action}
                </Badge>
                <span className="text-sm text-slate-700 flex-1 truncate">{entry.entity}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">{entry.user}</span>
                {entry.details && (
                  <span className="text-xs text-slate-400 truncate max-w-[200px] hidden group-hover:inline">
                    {entry.details}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────

function TemplateManagePresentsRoot({
  presets = [],
  templates = [],
  instances = [],
  auditLog = [],
  approvals = [],
  categories = ['Backend', 'Frontend', 'Data', 'Infrastructure'],
  navItems,
  defaultPage = 'catalog',
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onPresetSelect,
  onTemplateSave,
  onTemplateDelete,
  onTemplatePublish,
  onPresetSave,
  onPresetDelete,
  onInstanceGenerate,
  onInstanceDelete,
  onApprovalAction,
  title = 'Template Platform',
  brandIcon,
  userAvatar,
  className,
  defaultCollapsed = false,
  headerRight,
  basePath,
}: TemplateManagePresentsProps) {
  const effectiveNavItems = navItems ?? DEFAULT_NAV_ITEMS;

  // Derive initial page from URL if basePath is set
  const getPageFromUrl = useCallback(() => {
    if (basePath == null) return defaultPage;
    const pathname = window.location.pathname;
    const base = basePath.endsWith('/') ? basePath : basePath + '/';
    if (pathname.startsWith(base)) {
      const segment = pathname.slice(base.length).split('/')[0];
      if (segment && (effectiveNavItems).some((n) => n.id === segment)) {
        return segment;
      }
    }
    return defaultPage;
  }, [basePath, defaultPage, effectiveNavItems]);

  const [page, setPage] = useState(getPageFromUrl);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset | null>(null);
  const [wizardPreset, setWizardPreset] = useState<TemplatePreset | null>(null);
  const [editingPreset, setEditingPreset] = useState<TemplatePreset | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewingInstance, setViewingInstance] = useState<TemplateInstance | null>(null);

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    if (basePath == null) return;
    const onPopState = () => {
      setPage(getPageFromUrl());
      setSelectedPreset(null);
      setWizardPreset(null);
      setEditingPreset(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [basePath, getPageFromUrl]);
  const navWithBadges = effectiveNavItems.map((item) => {
    if (item.id === 'approvals' && approvals.length > 0) {
      return { ...item, badge: approvals.length };
    }
    return item;
  });

  const handlePresetSelect = useCallback(
    (preset: TemplatePreset) => {
      setSelectedPreset(preset);
      onPresetSelect?.(preset);
    },
    [onPresetSelect]
  );

  const handleNavigate = useCallback((id: string) => {
    setPage(id);
    setSelectedPreset(null);
    setWizardPreset(null);
    setEditingPreset(null);
    setEditingTemplate(null);
    setViewingInstance(null);
    if (basePath != null) {
      const base = basePath.endsWith('/') ? basePath : basePath + '/';
      const url = base + id;
      if (window.location.pathname !== url) {
        window.history.pushState(null, '', url);
      }
    }
  }, [basePath]);

  const handleEditPreset = useCallback((preset: TemplatePreset) => {
    setEditingPreset(preset);
    setSelectedPreset(null);
    setWizardPreset(null);
    setEditingTemplate(null);
    setViewingInstance(null);
  }, []);

  const handleNewPreset = useCallback(() => {
    handleEditPreset({
      id: '', slug: '', name: '', description: '', category: 'Backend',
      version: '1.0.0', template: '', templateVersion: '', status: 'draft', tags: [],
    });
  }, [handleEditPreset]);

  const handleGeneratePreset = useCallback((preset: TemplatePreset) => {
    setWizardPreset(preset);
    setSelectedPreset(null);
    setEditingPreset(null);
    setEditingTemplate(null);
    setViewingInstance(null);
  }, []);

  const handleEditTemplate = useCallback((template: Template) => {
    setEditingTemplate(template);
    setEditingPreset(null);
    setSelectedPreset(null);
    setWizardPreset(null);
    setViewingInstance(null);
  }, []);

  const handleNewTemplate = useCallback(() => {
    handleEditTemplate({
      id: '', slug: '', name: '', category: 'Backend', version: '1.0.0', status: 'draft',
    });
  }, [handleEditTemplate]);

  const handleViewInstance = useCallback((instance: TemplateInstance) => {
    setViewingInstance(instance);
    setEditingPreset(null);
    setEditingTemplate(null);
    setSelectedPreset(null);
    setWizardPreset(null);
  }, []);

  const renderContent = () => {
    // Template edit form view
    if (editingTemplate) {
      return (
        <TemplateEditForm
          template={editingTemplate}
          categoryColors={categoryColors}
          onBack={() => setEditingTemplate(null)}
          onSave={(updated) => {
            onTemplateSave?.(updated);
            setEditingTemplate(null);
          }}
          onDelete={(tmpl) => {
            onTemplateDelete?.(tmpl);
            setEditingTemplate(null);
          }}
          onPublish={onTemplatePublish ? (tmpl, ver, log, brk) => {
            onTemplatePublish(tmpl, ver, log, brk);
          } : undefined}
        />
      );
    }

    // Instance detail view
    if (viewingInstance) {
      return (
        <InstanceDetail
          instance={viewingInstance}
          onBack={() => setViewingInstance(null)}
          onDelete={(inst) => {
            onInstanceDelete?.(inst);
            setViewingInstance(null);
          }}
        />
      );
    }

    // Preset edit form view
    if (editingPreset) {
      return (
        <PresetEditForm
          preset={editingPreset}
          templates={templates}
          categoryColors={categoryColors}
          onBack={() => setEditingPreset(null)}
          onSave={(updated) => {
            onPresetSave?.(updated);
            setEditingPreset(null);
          }}
          onDelete={(preset) => {
            onPresetDelete?.(preset);
            setEditingPreset(null);
          }}
        />
      );
    }

    // Wizard view
    if (wizardPreset) {
      return (
        <SetupWizard
          preset={wizardPreset}
          onBack={() => {
            setWizardPreset(null);
            if (selectedPreset) {
              // go back to detail
            } else {
              setPage('catalog');
            }
          }}
          onComplete={(config) => {
            onInstanceGenerate?.(wizardPreset, config);
            setWizardPreset(null);
            setSelectedPreset(null);
          }}
        />
      );
    }

    // Detail view
    if (selectedPreset && page === 'catalog') {
      return (
        <PresetDetail
          preset={selectedPreset}
          categoryColors={categoryColors}
          onBack={() => setSelectedPreset(null)}
          onGenerate={() => setWizardPreset(selectedPreset)}
        />
      );
    }

    switch (page) {
      case 'catalog':
        return (
          <CatalogView
            presets={presets}
            categories={categories}
            categoryColors={categoryColors}
            onSelect={handlePresetSelect}
            onEdit={handleEditPreset}
            onGenerate={handleGeneratePreset}
          />
        );
      case 'templates':
        return (
          <TemplatesAdmin
            templates={templates}
            categoryColors={categoryColors}
            onNew={handleNewTemplate}
            onEdit={handleEditTemplate}
            onDelete={(tmpl) => onTemplateDelete?.(tmpl)}
          />
        );
      case 'presets':
        return (
          <PresetsAdmin
            presets={presets}
            categoryColors={categoryColors}
            onNew={handleNewPreset}
            onEdit={handleEditPreset}
            onDelete={(preset) => onPresetDelete?.(preset)}
          />
        );
      case 'instances':
        return (
          <InstancesView
            instances={instances}
            onView={handleViewInstance}
            onDelete={(inst) => onInstanceDelete?.(inst)}
          />
        );
      case 'approvals':
        return (
          <ApprovalsView
            approvals={approvals}
            onApprove={(id, comment) => onApprovalAction?.(id, 'approve', comment)}
            onReject={(id, comment) => onApprovalAction?.(id, 'reject', comment)}
          />
        );
      case 'audit':
        return <AuditView entries={auditLog} />;
      default:
        return (
          <CatalogView
            presets={presets}
            categories={categories}
            categoryColors={categoryColors}
            onSelect={handlePresetSelect}
            onEdit={handleEditPreset}
            onGenerate={handleGeneratePreset}
          />
        );
    }
  };

  return (
    <div
      className={cx(
        'flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden',
        className
      )}
    >
      <Sidebar
        items={navWithBadges}
        active={page}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        title={title}
        brandIcon={brandIcon}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Compound Component Assembly ───────────────────────────

export const TemplateManagePresents = Object.assign(TemplateManagePresentsRoot, {
  Catalog: CatalogView,
  PresetCard,
  PresetDetail,
  PresetEditForm,
  SetupWizard,
  Instances: InstancesView,
  InstanceDetail,
  TemplatesAdmin,
  TemplateEditForm,
  PresetsAdmin,
  Approvals: ApprovalsView,
  AuditLog: AuditView,
  Sidebar,
  Badge,
  Button,
  StatCard,
  ProgressBar,
  Field,
  SelectField,
  Toggle,
  ReviewSection,
});
