import { useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import type {
  TemplateManagePresentsProps,
  CatalogViewProps,
  PresetCardProps,
  PresetEditFormProps,
  PresetDetailProps,
  InstancesViewProps,
  InstanceDetailProps,
  TemplatesAdminProps,
  TemplateEditFormProps,
  PresetsAdminProps,
  ModulesAdminProps,
  ModuleEditFormProps,
  AuditViewProps,
  SidebarProps,
  TopNavProps,
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
  PresetModuleRef,
  Module,
  PresetVariable,
  TemplateReference,
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
  { id: 'modules', label: 'Modules', section: 'manage' },
  { id: 'instances', label: 'Instances', section: 'manage' },
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

// ─── TopNav ───────────────────────────────────────────────

function TopNav({
  items,
  active,
  onNavigate,
  title = 'Template Platform',
  brandIcon,
  className,
}: TopNavProps) {
  const sections = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section ?? 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <div
      className={cx(
        'w-full flex items-center gap-1 mb-6 border-b border-slate-200 pb-0',
        className
      )}
    >
      <nav className="flex items-center gap-1 overflow-x-auto">
        {Object.entries(sections).map(([section, sectionItems], idx) => (
          <div key={section} className="flex items-center gap-1">
            {idx > 0 && (
              <div className="w-px h-4 bg-slate-200 mx-3 shrink-0 self-center" />
            )}
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mr-1 shrink-0 self-center">
              {section}
            </span>
            {sectionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cx(
                  'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 -mb-px',
                  active === item.id
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                )}
              >
                {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

// ─── Catalog Filter Helpers ────────────────────────────────

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-b-0 pb-4 mb-4 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <svg
          className={cx(
            'w-4 h-4 text-slate-400 transition-transform duration-200',
            open ? 'rotate-180' : ''
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  count,
  onChange,
}: {
  label: string;
  checked: boolean;
  count: number;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group/fc">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
      />
      <span className="flex-1 text-sm text-slate-600 group-hover/fc:text-slate-800 truncate">
        {label}
      </span>
      <span className={cx('text-xs tabular-nums', checked ? 'text-indigo-600 font-medium' : 'text-slate-400')}>
        {count}
      </span>
    </label>
  );
}

type SortOption = 'name-asc' | 'name-desc' | 'uses' | 'success-rate';

function CatalogFilterPanel({
  presets,
  categories,
  search,
  onSearchChange,
  selectedStatuses,
  onToggleStatus,
  selectedCategories,
  onToggleCategory,
  selectedTags,
  onToggleTag,
  featuredOnly,
  onToggleFeatured,
}: {
  presets: TemplatePreset[];
  categories: string[];
  search: string;
  onSearchChange: (v: string) => void;
  selectedStatuses: Set<string>;
  onToggleStatus: (s: string) => void;
  selectedCategories: Set<string>;
  onToggleCategory: (c: string) => void;
  selectedTags: Set<string>;
  onToggleTag: (t: string) => void;
  featuredOnly: boolean;
  onToggleFeatured: () => void;
}) {
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of presets) {
      counts[p.status] = (counts[p.status] || 0) + 1;
    }
    return counts;
  }, [presets]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of presets) {
      const cat = p.category;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [presets]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of presets) {
      for (const t of p.tags) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return counts;
  }, [presets]);

  const topTags = useMemo(
    () =>
      Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    [tagCounts]
  );

  const featuredCount = useMemo(() => presets.filter((p) => p.featured).length, [presets]);

  const statuses = ['published', 'draft', 'deprecated'] as const;

  return (
    <aside className="w-64 shrink-0">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sticky top-0">
        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search presets..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg ring-1 ring-slate-200 bg-white focus:ring-indigo-300 focus:outline-none transition-shadow"
          />
        </div>

        {/* Featured toggle */}
        <div className="border-b border-slate-100 pb-4 mb-4">
          <label className="flex items-center gap-2.5 cursor-pointer group/fc">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={() => onToggleFeatured()}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="flex-1 text-sm text-slate-600 group-hover/fc:text-slate-800">
              Featured Only
            </span>
            <span className={cx('text-xs tabular-nums', featuredOnly ? 'text-indigo-600 font-medium' : 'text-slate-400')}>
              {featuredCount}
            </span>
          </label>
        </div>

        {/* Status */}
        <FilterSection title="Status">
          {statuses.map((s) => (
            <FilterCheckbox
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              checked={selectedStatuses.has(s)}
              count={statusCounts[s] || 0}
              onChange={() => onToggleStatus(s)}
            />
          ))}
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category">
          {categories.map((cat) => (
            <FilterCheckbox
              key={cat}
              label={cat}
              checked={selectedCategories.has(cat)}
              count={categoryCounts[cat] || 0}
              onChange={() => onToggleCategory(cat)}
            />
          ))}
        </FilterSection>

        {/* Tags */}
        {topTags.length > 0 && (
          <FilterSection title="Tags" defaultOpen={false}>
            {topTags.map(([tag, count]) => (
              <FilterCheckbox
                key={tag}
                label={tag}
                checked={selectedTags.has(tag)}
                count={count}
                onChange={() => onToggleTag(tag)}
              />
            ))}
          </FilterSection>
        )}
      </div>
    </aside>
  );
}

// ─── CatalogView ───────────────────────────────────────────

function CatalogView({
  presets,
  categories = [],
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onSelect,
  onEdit,
  className,
}: CatalogViewProps) {
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const toggleSet = useCallback((prev: Set<string>, value: string) => {
    const next = new Set(prev);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }, []);

  const hasActiveFilters =
    selectedStatuses.size > 0 || selectedCategories.size > 0 || selectedTags.size > 0 || featuredOnly;

  const clearAllFilters = useCallback(() => {
    setSelectedStatuses(new Set());
    setSelectedCategories(new Set());
    setSelectedTags(new Set());
    setFeaturedOnly(false);
    setSearch('');
  }, []);

  const filtered = useMemo(() => {
    let result = presets.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = selectedStatuses.size === 0 || selectedStatuses.has(p.status);
      const matchesCategory =
        selectedCategories.size === 0 || selectedCategories.has(p.category);
      const matchesTags =
        selectedTags.size === 0 || p.tags.some((t) => selectedTags.has(t));
      const matchesFeatured = !featuredOnly || p.featured;
      return matchesSearch && matchesStatus && matchesCategory && matchesTags && matchesFeatured;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'uses':
          return (b.uses ?? 0) - (a.uses ?? 0);
        case 'success-rate':
          return (b.successRate ?? 0) - (a.successRate ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [presets, search, selectedStatuses, selectedCategories, selectedTags, featuredOnly, sortBy]);

  const sortLabels: Record<SortOption, string> = {
    'name-asc': 'Name A–Z',
    'name-desc': 'Name Z–A',
    uses: 'Most Used',
    'success-rate': 'Success Rate',
  };

  return (
    <div className={cx('space-y-6', className)}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Template Preset Catalog</h1>
        <p className="text-sm text-slate-500 mt-1">Browse and deploy pre-configured template presets</p>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-6 items-start">
        {/* Left filter panel */}
        <CatalogFilterPanel
          presets={presets}
          categories={categories}
          search={search}
          onSearchChange={setSearch}
          selectedStatuses={selectedStatuses}
          onToggleStatus={(s) => setSelectedStatuses((prev) => toggleSet(prev, s))}
          selectedCategories={selectedCategories}
          onToggleCategory={(c) => setSelectedCategories((prev) => toggleSet(prev, c))}
          selectedTags={selectedTags}
          onToggleTag={(t) => setSelectedTags((prev) => toggleSet(prev, t))}
          featuredOnly={featuredOnly}
          onToggleFeatured={() => setFeaturedOnly((v) => !v)}
        />

        {/* Content area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{' '}
              <span className="font-medium text-slate-700">{presets.length}</span> presets
            </span>
            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm rounded-lg ring-1 ring-slate-200 bg-white px-3 py-1.5 text-slate-600 focus:ring-indigo-300 focus:outline-none cursor-pointer"
              >
                {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {/* View toggle */}
              <div className="flex items-center rounded-lg ring-1 ring-slate-200 bg-white overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cx(
                    'p-1.5 transition-colors',
                    viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  )}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cx(
                    'p-1.5 transition-colors',
                    viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  )}
                  title="List view"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {featuredOnly && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-xs font-medium">
                  Featured
                  <button onClick={() => setFeaturedOnly(false)} className="hover:text-indigo-900">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {[...selectedStatuses].map((s) => (
                <span
                  key={`s-${s}`}
                  className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  <button
                    onClick={() => setSelectedStatuses((prev) => toggleSet(prev, s))}
                    className="hover:text-indigo-900"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {[...selectedCategories].map((c) => (
                <span
                  key={`c-${c}`}
                  className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {c}
                  <button
                    onClick={() => setSelectedCategories((prev) => toggleSet(prev, c))}
                    className="hover:text-violet-900"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {[...selectedTags].map((t) => (
                <span
                  key={`t-${t}`}
                  className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {t}
                  <button
                    onClick={() => setSelectedTags((prev) => toggleSet(prev, t))}
                    className="hover:text-amber-900"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs text-slate-500 hover:text-indigo-600 underline underline-offset-2 ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Card grid / list */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-sm text-slate-500">No presets found</div>
              <div className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div
              className={cx(
                'grid gap-4',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              )}
            >
              {filtered.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  featured={preset.featured}
                  categoryColors={categoryColors}
                  onSelect={onSelect}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </div>
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
      {onEdit && (
        <div className="flex items-center justify-end gap-2 px-5 pb-4 pt-1 border-t border-slate-100 mt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(preset); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PresetDetail ──────────────────────────────────────────

function PresetDetail({
  preset,
  registryModules = [],
  onBack,
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
        {preset.modules && preset.modules.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Modules</h3>
            {preset.modules.filter((m) => m.required).length > 0 && (
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Required</div>
                <div className="space-y-1.5">
                  {preset.modules.filter((m) => m.required).map((ref) => {
                    const mod = registryModules.find((rm) => rm.id === ref.moduleId);
                    return (
                      <div key={ref.moduleId} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                        <span className="text-xs text-slate-700">{mod?.name ?? ref.moduleId}</span>
                        <div className="flex items-center gap-2">
                          {ref.inherited && <span className="text-[10px] text-slate-400 italic">inherited</span>}
                          <span className="text-[10px] text-slate-400 font-mono">v{ref.versionOverride ?? mod?.version ?? '?'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {preset.modules.filter((m) => !m.required).length > 0 && (
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Optional</div>
                <div className="space-y-1.5">
                  {preset.modules.filter((m) => !m.required).map((ref) => {
                    const mod = registryModules.find((rm) => rm.id === ref.moduleId);
                    return (
                      <div key={ref.moduleId} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                        <span className="text-xs text-slate-700">{mod?.name ?? ref.moduleId}</span>
                        <div className="flex items-center gap-2">
                          {!ref.inherited && <span className="text-[10px] text-indigo-500">preset</span>}
                          <span className="text-[10px] text-slate-400 font-mono">v{ref.versionOverride ?? mod?.version ?? '?'}</span>
                        </div>
                      </div>
                    );
                  })}
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

// ─── Preset Edit Constants ─────────────────────────────────

const PRESET_EDIT_TABS = [
  { id: 'meta', label: 'Metadata', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  { id: 'vars', label: 'Variables', icon: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01' },
  { id: 'mods', label: 'Modules', icon: 'M19.4 7.8c0 .3.1.6.3.9l1.6 1.5c.9.9.9 2.5 0 3.4l-1.6 1.6c-.2.2-.3.5-.3.8 0 .5-.3.9-.7 1.1a2.5 2.5 0 1 0-3.2 3.2c.2.5.6.9 1.1.7a1 1 0 0 1 .8.3l-1.6 1.6a2.4 2.4 0 0 1-3.4 0l-1.5-1.6a1 1 0 0 0-.9-.3c-.5 0-.9.3-1.1.7a2.5 2.5 0 1 1-3.2-3.2c.4-.2.7-.6.7-1.1 0-.3-.1-.6-.3-.9L3.6 13.7A2.4 2.4 0 0 1 3 12c0-.6.2-1.2.7-1.7l1.6-1.6c.2-.2.3-.5.3-.8 0-.5.3-.9.7-1.1a2.5 2.5 0 1 0 3.2-3.2c-.4-.2-.6-.5-.7-1a1 1 0 0 1 .3-.8l1.6-1.6a2.4 2.4 0 0 1 3.4 0l1.5 1.6c.2.2.6.3.9.3.5 0 .9-.3 1-.7a2.5 2.5 0 1 1 3.3 3.2c-.5.2-.8.6-.8 1z' },
  { id: 'policies', label: 'Policies', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { id: 'refs', label: 'References', icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
  { id: 'ver', label: 'Versions', icon: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9' },
] as const;

type PresetEditTab = typeof PRESET_EDIT_TABS[number]['id'];

const VISIBILITY_COLORS: Record<string, string> = {
  editable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  locked: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  hidden: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  derived: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
};

const POLICY_STATUS_COLORS: Record<string, string> = {
  enforced: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  advisory: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  disabled: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
};

// ─── PresetVarEditModal ───────────────────────────────────

function PresetVarEditModal({ variable, tokenName, onSave, onClose }: {
  variable: PresetVariable | null;
  tokenName: string;
  onSave: (v: PresetVariable) => void;
  onClose: () => void;
}) {
  const blank: PresetVariable = { key: tokenName, visibility: 'editable', defaultValue: '', helpText: '' };
  const [f, setF] = useState<PresetVariable>(variable ?? blank);
  const up = (k: keyof PresetVariable, val: PresetVariable[keyof PresetVariable]) => setF((p) => ({ ...p, [k]: val }));

  return (
    <EditOverlay onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">{variable ? 'Edit Variable Override' : 'Configure Variable'}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
          <EditTabIcon d="M18 6 6 18M6 6l12 12" size={18} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Token Key</label>
          <div className="px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-700">{f.key}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Display Label</label>
            <input value={f.label ?? ''} onChange={(e) => up('label', e.target.value)} placeholder="Override display name" className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Visibility</label>
            <select value={f.visibility} onChange={(e) => up('visibility', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none">
              <option value="editable">Editable</option>
              <option value="locked">Locked</option>
              <option value="hidden">Hidden</option>
              <option value="derived">Derived</option>
            </select>
          </div>
        </div>
        {f.visibility === 'editable' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Default Value</label>
            <input value={f.defaultValue ?? ''} onChange={(e) => up('defaultValue', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
        )}
        {f.visibility === 'locked' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Locked Value</label>
            <input value={f.lockedValue ?? ''} onChange={(e) => up('lockedValue', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Help Text</label>
          <input value={f.helpText ?? ''} onChange={(e) => up('helpText', e.target.value)} placeholder="Guidance shown to consumers" className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Validation</label>
            <input value={f.validation ?? ''} onChange={(e) => up('validation', e.target.value)} placeholder="Override regex" className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Sort Order</label>
            <input type="number" value={f.sortOrder ?? ''} onChange={(e) => up('sortOrder', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
        <button onClick={() => onSave(f)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">{variable ? 'Save Changes' : 'Configure'}</button>
      </div>
    </EditOverlay>
  );
}

// ─── PresetEditForm ───────────────────────────────────────

function PresetEditForm({
  preset,
  templates = [],
  registryModules = [],
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onSave,
  onDelete,
  onPublish,
  onBack,
  className,
}: PresetEditFormProps) {
  const [tab, setTab] = useState<PresetEditTab>('meta');
  const [form, setForm] = useState<TemplatePreset>({ ...preset });
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [editingVar, setEditingVar] = useState<PresetVariable | null>(null);
  const [editingVarKey, setEditingVarKey] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const mark = () => setDirty(true);

  const updateField = <K extends keyof TemplatePreset>(key: K, value: TemplatePreset[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    mark();
  };

  // Resolve the selected template
  const selectedTemplate = templates.find(
    (t) => t.slug === form.template || t.name === form.template
  );
  const templateTokens = selectedTemplate?.tokens ?? [];
  const presetVars = form.presetVariables ?? [];
  const versions = form.versions ?? [];
  const policies = form.policies ?? [];
  const references = form.references ?? [];
  const presetModules = form.modules ?? [];
  const resolveModule = (moduleId: string) => registryModules.find((m) => m.id === moduleId);

  const statusBadgeVariant = (s: string): BadgeProps['variant'] => {
    if (s === 'published') return 'green';
    if (s === 'draft') return 'amber';
    if (s === 'deprecated') return 'red';
    return 'default';
  };

  // Policy helpers
  const addPolicy = () => updateField('policies', [...policies, { name: '', status: 'advisory' as const }]);
  const updatePolicy = (index: number, field: string, value: string) => {
    const current = [...policies];
    current[index] = { ...current[index], [field]: value };
    updateField('policies', current);
  };
  const removePolicy = (index: number) => updateField('policies', policies.filter((_, i) => i !== index));

  // Reference helpers
  const addLinkReference = () => updateField('references', [...references, { type: 'link' as const, appName: '', usageContext: '' }]);
  const addContentReference = () => updateField('references', [...references, { type: 'content' as const, appName: '', filename: '', mimetype: '', content: '' }]);
  const updateReference = (index: number, field: string, value: string) => {
    const current = [...references];
    current[index] = { ...current[index], [field]: value };
    updateField('references', current);
  };
  const removeReference = (index: number) => updateField('references', references.filter((_, i) => i !== index));

  // Import all template tokens as preset variables
  const importAllVars = () => {
    const existing = new Set(presetVars.map((v) => v.key));
    const newVars = templateTokens
      .filter((t) => !existing.has(t.name))
      .map((t, i) => ({
        key: t.name,
        visibility: 'editable' as const,
        defaultValue: t.defaultValue ?? '',
        sortOrder: presetVars.length + i,
      }));
    if (newVars.length > 0) {
      updateField('presetVariables', [...presetVars, ...newVars]);
      setToast(`Imported ${newVars.length} variable(s)`);
    }
  };

  // Auto-import variables + modules when base template changes
  const handleTemplateChange = (slug: string) => {
    const tpl = templates.find((t) => t.slug === slug || t.name === slug);
    const tokens = tpl?.tokens ?? [];
    // Build new preset variables from template tokens
    const newVars: PresetVariable[] = tokens.map((t, i) => ({
      key: t.name,
      visibility: 'editable' as const,
      defaultValue: t.defaultValue ?? '',
      sortOrder: i,
    }));

    setForm((prev) => ({
      ...prev,
      template: slug,
      templateVersion: tpl?.version ?? prev.templateVersion,
      presetVariables: newVars,
    }));
    mark();
    if (tokens.length > 0) {
      setToast(`Inherited ${tokens.length} variable(s) from ${tpl?.name ?? slug}`);
    }
  };

  // ─── Template selection gate for new presets ───────────
  const isNewPreset = !preset.id;
  const needsTemplateSelection = isNewPreset && !form.template;

  if (needsTemplateSelection) {
    return (
      <div className={cx('space-y-5', className)}>
        {/* Top bar */}
        <div className="flex items-center justify-between">
          {onBack ? (
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
              <EditTabIcon d="M19 12H5m7 7-7-7 7-7" size={15} /> Back to Presets
            </button>
          ) : <div />}
        </div>

        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Create New Preset</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Select a base template to inherit variables, modules, and configuration from.
          </p>
        </div>

        {/* Template cards grid */}
        {templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-4">
              <EditTabIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={24} />
            </div>
            <p className="text-sm text-slate-500">No templates available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const tokenCount = tpl.tokens?.length ?? 0;
              const moduleCount = tpl.modules?.length ?? 0;
              const colorKey = tpl.category.toLowerCase();
              const ring = categoryColors[colorKey] === 'blue' ? 'hover:ring-blue-300' :
                categoryColors[colorKey] === 'purple' ? 'hover:ring-purple-300' :
                categoryColors[colorKey] === 'amber' ? 'hover:ring-amber-300' :
                categoryColors[colorKey] === 'green' ? 'hover:ring-green-300' : 'hover:ring-indigo-300';
              const catBadge = categoryColors[colorKey] === 'blue' ? 'bg-blue-50 text-blue-700' :
                categoryColors[colorKey] === 'purple' ? 'bg-purple-50 text-purple-700' :
                categoryColors[colorKey] === 'amber' ? 'bg-amber-50 text-amber-700' :
                categoryColors[colorKey] === 'green' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600';

              return (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateChange(tpl.slug)}
                  className={cx(
                    'group relative text-left bg-white rounded-2xl border border-slate-200 p-5 space-y-3',
                    'transition-all hover:shadow-md hover:ring-2 ring-offset-1',
                    ring,
                  )}
                >
                  {/* Category + Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cx('inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', catBadge)}>
                      {tpl.category}
                    </span>
                    <Badge variant={tpl.status === 'published' ? 'green' : tpl.status === 'draft' ? 'amber' : 'red'}>
                      {tpl.status}
                    </Badge>
                    <span className="ml-auto text-[11px] font-mono text-slate-400">v{tpl.version}</span>
                  </div>

                  {/* Name + description */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{tpl.name}</h3>
                    {tpl.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <EditTabIcon d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" size={12} />
                      {tokenCount} variable{tokenCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <EditTabIcon d="M19.4 7.8c0 .3.1.6.3.9l1.6 1.5c.9.9.9 2.5 0 3.4l-1.6 1.6c-.2.2-.3.5-.3.8" size={12} />
                      {moduleCount} module{moduleCount !== 1 ? 's' : ''}
                    </span>
                    {tpl.owner && (
                      <span className="flex items-center gap-1">
                        <EditTabIcon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" size={12} />
                        {tpl.owner}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {tpl.tags && tpl.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tpl.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="inline-flex px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-500">{tag}</span>
                      ))}
                      {tpl.tags.length > 4 && (
                        <span className="text-[10px] text-slate-400">+{tpl.tags.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Hover arrow indicator */}
                  <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditTabIcon d="M5 12h14M12 5l7 7-7 7" size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cx('space-y-5', className)}>
      {/* Top bar */}
      <div className="flex items-center justify-between">
        {onBack ? (
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            <EditTabIcon d="M19 12H5m7 7-7-7 7-7" size={15} /> Back to Presets
          </button>
        ) : <div />}
        <div className="flex items-center gap-3 flex-wrap">
          {dirty && <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">Unsaved changes</span>}
          {onDelete && preset.id && (
            <button onClick={() => setModal('delPreset')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
              <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} /> Delete
            </button>
          )}
          {onPublish && !isNewPreset && (
            <button onClick={() => setModal('publish')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
              <EditTabIcon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" size={15} /> Publish Version
            </button>
          )}
          <button onClick={() => { setDirty(false); onSave?.(form); setToast('Preset saved successfully'); }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors">
            <EditTabIcon d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" size={15} /> Save Preset
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {preset.id ? 'Edit Preset' : 'New Preset'}
          </h1>
          <Badge variant={statusBadgeVariant(form.status)}>{form.status.charAt(0).toUpperCase() + form.status.slice(1)}</Badge>
          {form.featured && <Badge variant="amber">Featured</Badge>}
        </div>
        <p className="text-sm text-slate-500">
          {form.name || 'Untitled'} &middot; <span className="font-mono text-xs text-slate-400">v{form.version}</span>
          {form.template && <> &middot; Base: <span className="font-medium text-slate-600">{form.template}</span></>}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {PRESET_EDIT_TABS.filter((t) => !(t.id === 'ver' && isNewPreset)).map((t) => {
          const count = t.id === 'vars' ? presetVars.length
            : t.id === 'mods' ? presetModules.length
            : t.id === 'policies' ? policies.length
            : t.id === 'refs' ? references.length
            : t.id === 'ver' ? versions.length
            : null;
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

          {/* ─── METADATA ─── */}
          {tab === 'meta' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">General Information</h2>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Name" required value={form.name} onChange={(v) => updateField('name', v)} placeholder="Preset name" />
                <Field label="Slug" required value={form.slug} onChange={(v) => updateField('slug', v)} placeholder="preset-slug" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Purpose" value={form.purpose ?? ''} onChange={(v) => updateField('purpose', v)} placeholder="Why this preset exists" />
                <Field label="Audience" value={form.audience ?? ''} onChange={(v) => updateField('audience', v)} placeholder="Target audience" />
              </div>
              <div className="grid grid-cols-3 gap-5">
                <SelectField label="Category" value={form.category} onChange={(v) => updateField('category', v)} options={Object.keys(categoryColors).filter((c) => c !== 'all').map((c) => c.charAt(0).toUpperCase() + c.slice(1))} />
                <Field label="Version" required value={form.version} onChange={(v) => updateField('version', v)} placeholder="1.0.0" />
                <SelectField label="Status" value={form.status} onChange={(v) => updateField('status', v as TemplatePreset['status'])} options={['draft', 'published', 'deprecated']} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-500">Base Template</label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-700">
                    <EditTabIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={14} />
                    <span className="font-medium">{selectedTemplate?.name ?? form.template}</span>
                    <span className="ml-auto text-[11px] font-mono text-slate-400">{form.template}</span>
                  </div>
                </div>
                <Field label="Template Version" value={form.templateVersion} onChange={(v) => updateField('templateVersion', v)} placeholder="1.0.0" />
              </div>
              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tags</label>
                <div className="flex items-center gap-2 flex-wrap p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                      {tag}
                      <button onClick={() => updateField('tags', form.tags.filter((t) => t !== tag))} className="text-slate-400 hover:text-red-500">
                        <EditTabIcon d="M18 6 6 18M6 6l12 12" size={11} />
                      </button>
                    </span>
                  ))}
                  <input placeholder="+ Add tag" className="flex-1 min-w-[80px] bg-transparent text-xs text-slate-600 focus:outline-none" onKeyDown={(e) => {
                    const input = e.target as HTMLInputElement;
                    if (e.key === 'Enter' && input.value.trim()) {
                      const tag = input.value.trim().toLowerCase();
                      if (!form.tags.includes(tag)) updateField('tags', [...form.tags, tag]);
                      input.value = '';
                    }
                  }} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-500">Featured</label>
                <Toggle checked={form.featured ?? false} onChange={(v) => updateField('featured', v)} />
              </div>
            </section>
          )}

          {/* ─── VARIABLES ─── */}
          {tab === 'vars' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Variable Configuration</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {presetVars.length} configured &mdash; {templateTokens.length} inherited from template
                  </p>
                </div>
                {templateTokens.length > 0 && (
                  <button onClick={importAllVars} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                    <EditTabIcon d="M12 5v14M5 12h14" size={15} /> Import All
                  </button>
                )}
              </div>
              {!form.template ? (
                <div className="text-center py-12 text-sm text-slate-400">Select a base template in the Metadata tab first.</div>
              ) : templateTokens.length === 0 && presetVars.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">Base template has no variables defined.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Show template tokens merged with preset overrides */}
                  {templateTokens.map((token) => {
                    const override = presetVars.find((v) => v.key === token.name);
                    return (
                      <div key={token.name} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                        <svg className="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800 font-mono">{token.name}</span>
                            <span className={cx('inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide', TOKEN_TYPE_COLORS[token.type ?? 'text'] ?? 'bg-slate-100 text-slate-600')}>{token.type ?? 'text'}</span>
                            {override ? (
                              <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide', VISIBILITY_COLORS[override.visibility])}>
                                {override.visibility === 'locked' && <EditTabIcon d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" size={9} />}
                                {override.visibility}
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400 italic">unconfigured</span>
                            )}
                            {token.required && <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Required</span>}
                          </div>
                          <p className="text-xs text-slate-400">{override?.helpText || token.description}</p>
                          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                            {override?.visibility === 'locked' && override.lockedValue && (
                              <span className="text-[11px] text-slate-400">Locked: <span className="font-mono text-red-600">{override.lockedValue}</span></span>
                            )}
                            {override?.visibility === 'editable' && override.defaultValue && (
                              <span className="text-[11px] text-slate-400">Default: <span className="font-mono text-slate-500">{override.defaultValue}</span></span>
                            )}
                            {!override && token.defaultValue && (
                              <span className="text-[11px] text-slate-400">Template default: <span className="font-mono text-slate-500">{token.defaultValue}</span></span>
                            )}
                            {override?.label && (
                              <span className="text-[11px] text-slate-400">Label: <span className="text-slate-500">{override.label}</span></span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingVar(override ?? null); setEditingVarKey(token.name); setModal('editVar'); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                            <EditTabIcon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} />
                          </button>
                          {override && (
                            <button onClick={() => { updateField('presetVariables', presetVars.filter((v) => v.key !== token.name)); setToast('Override removed'); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600" title="Reset to template default">
                              <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {/* Show preset vars that don't map to a template token (orphaned) */}
                  {presetVars.filter((v) => !templateTokens.some((t) => t.name === v.key)).map((v) => (
                    <div key={v.key} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors group bg-amber-50/30">
                      <svg className="w-4 h-4 text-amber-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 9v4M12 17h.01" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-sm font-semibold text-slate-800 font-mono">{v.key}</span>
                          <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide', VISIBILITY_COLORS[v.visibility])}>{v.visibility}</span>
                          <span className="text-[10px] text-amber-600 font-medium">No matching template token</span>
                        </div>
                        {v.helpText && <p className="text-xs text-slate-400">{v.helpText}</p>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingVar(v); setEditingVarKey(v.key); setModal('editVar'); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                          <EditTabIcon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} />
                        </button>
                        <button onClick={() => { updateField('presetVariables', presetVars.filter((pv) => pv.key !== v.key)); setToast('Variable removed'); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                          <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── MODULES ─── */}
          {tab === 'mods' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Module Configuration</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {presetModules.length} module{presetModules.length !== 1 ? 's' : ''} configured
                  </p>
                </div>
                {registryModules.length > 0 && (
                  <button onClick={() => setModal('pickMod')} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">
                    <EditTabIcon d="M12 5v14M5 12h14" size={15} /> Add Module
                  </button>
                )}
              </div>
              {presetModules.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">No modules configured. Add modules from the registry.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {presetModules.map((pm) => {
                    const mod = resolveModule(pm.moduleId);
                    const name = mod?.name ?? pm.moduleId;
                    const cat = mod?.category ?? '';
                    return (
                      <div key={pm.moduleId} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                        <svg className="w-4 h-4 text-indigo-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19.4 7.8c0 .3.1.6.3.9l1.6 1.5c.9.9.9 2.5 0 3.4l-1.6 1.6c-.2.2-.3.5-.3.8 0 .5-.3.9-.7 1.1a2.5 2.5 0 1 0-3.2 3.2c.2.5.6.9 1.1.7" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{name}</span>
                            <span className={cx('inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', MODULE_CAT_COLORS[cat] ?? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200')}>{cat || 'module'}</span>
                            <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide', pm.required ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200')}>
                              {pm.required ? 'Required' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{mod?.description}</p>
                          {mod && <span className="text-[11px] text-slate-400 mt-1">v{pm.versionOverride ?? mod.version}</span>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => updateField('modules', presetModules.map((x) => x.moduleId === pm.moduleId ? { ...x, required: !x.required } : x))} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600" title="Toggle required">
                            <EditTabIcon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} />
                          </button>
                          <button onClick={() => { updateField('modules', presetModules.filter((x) => x.moduleId !== pm.moduleId)); setToast('Module removed'); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                            <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Module Picker Modal for Preset */}
          {modal === 'pickMod' && (
            <ModulePickerModal
              modules={registryModules}
              excludeIds={presetModules.map((m) => m.moduleId)}
              onAdd={(ids) => {
                const newRefs: PresetModuleRef[] = ids.map((id) => ({ moduleId: id, required: false }));
                updateField('modules', [...presetModules, ...newRefs]);
                setToast(`Added ${ids.length} module(s)`);
                setModal(null);
              }}
              onClose={() => setModal(null)}
            />
          )}

          {/* ─── POLICIES ─── */}
          {tab === 'policies' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Governance Policies</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Attach policies that consumers must comply with</p>
                </div>
                <button onClick={addPolicy} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                  <EditTabIcon d="M12 5v14M5 12h14" size={15} /> Add Policy
                </button>
              </div>
              {policies.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">No policies attached.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {policies.map((policy, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                      <EditTabIcon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={15} />
                      <div className="flex-1 min-w-0">
                        <input type="text" value={policy.name} onChange={(e) => updatePolicy(i, 'name', e.target.value)} placeholder="Policy name" className="w-full px-0 py-0 text-sm font-medium text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300" />
                      </div>
                      <select value={policy.status} onChange={(e) => updatePolicy(i, 'status', e.target.value)} className={cx('px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border-none appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20', POLICY_STATUS_COLORS[policy.status])}>
                        <option value="enforced">Enforced</option>
                        <option value="advisory">Advisory</option>
                        <option value="disabled">Disabled</option>
                      </select>
                      <button onClick={() => removePolicy(i)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── REFERENCES ─── */}
          {tab === 'refs' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">References</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {references.filter((r) => (r.type ?? 'link') === 'link').length} link{references.filter((r) => (r.type ?? 'link') === 'link').length !== 1 ? 's' : ''} &middot; {references.filter((r) => r.type === 'content').length} content
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={addLinkReference} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                    <EditTabIcon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" size={14} /> Link
                  </button>
                  <button onClick={addContentReference} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors">
                    <EditTabIcon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" size={14} /> Content
                  </button>
                </div>
              </div>
              {references.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">No references yet. Add a link or content reference.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {references.map((ref, i) => (
                    <div key={i} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-start gap-4">
                        {(ref.type ?? 'link') === 'link' ? (
                          <div className="mt-1.5 shrink-0 w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <EditTabIcon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" size={14} />
                          </div>
                        ) : (
                          <div className="mt-1.5 shrink-0 w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                            <EditTabIcon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" size={14} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={cx('inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', (ref.type ?? 'link') === 'link' ? 'bg-indigo-50 text-indigo-600' : 'bg-violet-50 text-violet-600')}>
                              {ref.type ?? 'link'}
                            </span>
                          </div>
                          {(ref.type ?? 'link') === 'link' ? (
                            <div className="grid grid-cols-2 gap-3">
                              <input type="text" value={ref.appName} onChange={(e) => updateReference(i, 'appName', e.target.value)} placeholder="Application name" className="px-2.5 py-1.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                              <input type="text" value={ref.usageContext ?? ''} onChange={(e) => updateReference(i, 'usageContext', e.target.value)} placeholder="Usage context" className="px-2.5 py-1.5 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-3 gap-3">
                                <input type="text" value={ref.appName} onChange={(e) => updateReference(i, 'appName', e.target.value)} placeholder="Reference name" className="px-2.5 py-1.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                                <input type="text" value={ref.filename ?? ''} onChange={(e) => updateReference(i, 'filename', e.target.value)} placeholder="filename.ext" className="px-2.5 py-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-mono text-xs" />
                                <input type="text" value={ref.mimetype ?? ''} onChange={(e) => updateReference(i, 'mimetype', e.target.value)} placeholder="application/json" className="px-2.5 py-1.5 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-mono text-xs" />
                              </div>
                              <textarea
                                value={ref.content ?? ''}
                                onChange={(e) => updateReference(i, 'content', e.target.value)}
                                rows={4}
                                placeholder="Paste content here..."
                                className="w-full px-3 py-2 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none"
                              />
                            </>
                          )}
                        </div>
                        <button onClick={() => removeReference(i)} className="mt-1.5 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preset Info</h3>
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
              <span className="text-xs text-slate-500">Base Template</span>
              <span className="text-xs font-medium text-indigo-600">{form.template || 'None'}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-xs text-slate-500">Template Ver.</span>
              <span className="text-xs font-medium text-slate-700 font-mono">{form.templateVersion || '-'}</span>
            </div>
            {form.uses != null && (
              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs text-slate-500">Uses</span>
                <span className="text-xs font-medium text-emerald-600">{form.uses}</span>
              </div>
            )}
            {form.successRate != null && (
              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs text-slate-500">Success Rate</span>
                <span className="text-xs font-medium text-emerald-600">{form.successRate}%</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Actions</h3>
            {[
              { icon: 'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1', label: 'Duplicate Preset' },
              { icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', label: 'View Base Template' },
            ].map((qa) => (
              <button key={qa.label} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors text-left">
                <EditTabIcon d={qa.icon} size={14} /> {qa.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {modal === 'editVar' && (
        <PresetVarEditModal
          variable={editingVar}
          tokenName={editingVarKey}
          onSave={(v) => {
            const existing = presetVars.findIndex((pv) => pv.key === v.key);
            if (existing >= 0) {
              updateField('presetVariables', presetVars.map((pv) => pv.key === v.key ? v : pv));
              setToast('Variable updated');
            } else {
              updateField('presetVariables', [...presetVars, v]);
              setToast('Variable configured');
            }
            setModal(null);
            setEditingVar(null);
          }}
          onClose={() => { setModal(null); setEditingVar(null); }}
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

      {modal === 'delPreset' && (
        <EditOverlay onClose={() => setModal(null)}>
          <div className="px-6 py-5">
            <h3 className="text-base font-semibold text-slate-800">Delete Preset</h3>
            <p className="text-sm text-slate-500 mt-2">This permanently removes the preset and all its versions. This cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => { setModal(null); onDelete?.(preset); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Delete</button>
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
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Source</th>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{inst.sourceName}</span>
                      <Badge variant={inst.source === 'preset' ? 'blue' : 'purple'}>{inst.source}</Badge>
                    </div>
                  </td>
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

function InstanceDetail({ instance, registryModules = [], onBack, onDelete, className }: InstanceDetailProps) {
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
          <p className="text-sm text-slate-500 mt-1">Compiled instance from {instance.source}</p>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Source" value={instance.sourceName} />
          <StatCard label="Source Type" value={instance.source} />
          <StatCard label="Version" value={`v${instance.sourceVersion}`} />
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

      {instance.modules && instance.modules.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">Included Modules</h3>
          <div className="flex flex-wrap gap-2">
            {instance.modules.map((modId) => {
              const mod = registryModules.find((rm) => rm.id === modId);
              return (
                <span key={modId} className={cx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', MODULE_CAT_COLORS[mod?.category ?? ''] ?? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200')}>
                  {mod?.name ?? modId}
                  {mod && <span className="text-[10px] opacity-60 font-mono">v{mod.version}</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {instance.compiledContent && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Compiled Output</h3>
            <p className="text-xs text-slate-400 mt-0.5">Rendered template with all tokens resolved</p>
          </div>
          <div className="bg-slate-900 overflow-auto" style={{ maxHeight: 380 }}>
            <div className="flex">
              <div className="py-4 px-3 shrink-0 select-none" style={{ background: 'rgba(30,41,59,0.3)', minWidth: 44 }}>
                {instance.compiledContent.split('\n').map((_, i) => <div key={i} className="text-right text-xs font-mono text-slate-600" style={{ lineHeight: '1.5rem' }}>{i + 1}</div>)}
              </div>
              <pre className="flex-1 py-4 px-4 text-sm font-mono text-emerald-300 overflow-x-auto" style={{ lineHeight: '1.5rem' }}>
                {instance.compiledContent}
              </pre>
            </div>
          </div>
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
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
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
                    <Badge variant={tmpl.type === 'dynamic' ? 'purple' : 'ghost'}>
                      {tmpl.type}
                    </Badge>
                  </td>
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
  { id: 'refs', label: 'References', icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
  { id: 'docs', label: 'Usage Docs', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6M9 9h1' },
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

function TemplatePreviewView({
  template,
  onBack,
  className,
}: {
  template: Template;
  onBack?: () => void;
  className?: string;
}) {
  const tokens = template.tokens ?? [];
  const content = template.content ?? '';
  const isStatic = template.type === 'static' || tokens.length === 0;

  const [tokenValues, setTokenValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const t of tokens) {
      init[t.name] = t.defaultValue ?? '';
    }
    return init;
  });

  const rendered = useMemo(() => {
    let out = content;
    for (const [key, val] of Object.entries(tokenValues)) {
      const re = new RegExp(`\\{\\{\\{\\s*${key}\\s*\\}\\}\\}`, 'g');
      out = out.replace(re, val || `{{{${key}}}}`);
    }
    return out;
  }, [content, tokenValues]);

  const filledCount = Object.values(tokenValues).filter((v) => v.trim()).length;

  return (
    <div className={cx('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-800">Preview Latest Output</h1>
          <p className="text-sm text-slate-500 mt-1">
            {template.name} &middot; v{template.version}
            {isStatic ? (
              <span className="ml-1.5 text-slate-400">(static template)</span>
            ) : (
              <span className="ml-1.5 text-slate-400">({tokens.length} token{tokens.length !== 1 ? 's' : ''})</span>
            )}
          </p>
        </div>
        <Badge variant={template.status === 'published' ? 'green' : template.status === 'draft' ? 'amber' : 'red'}>
          {template.status}
        </Badge>
      </div>

      {/* Two-panel layout for dynamic, single panel for static */}
      {isStatic ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Output</h2>
          </div>
          <pre className="p-6 text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-700 max-h-[70vh] overflow-y-auto">
            {content || <span className="text-slate-400 italic">No content defined</span>}
          </pre>
        </div>
      ) : (
        <div className="flex gap-6 items-start">
          {/* Left: Token input panel */}
          <div className="w-80 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-0">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Token Values</h2>
                <span className="text-[11px] text-slate-400">
                  {filledCount}/{tokens.length} filled
                </span>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {tokens.map((t) => (
                  <div key={t.name}>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {t.name}
                      {t.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    {t.description && (
                      <p className="text-[11px] text-slate-400 mb-1.5">{t.description}</p>
                    )}
                    {t.type === 'enum' && t.options && t.options.length > 0 ? (
                      <select
                        value={tokenValues[t.name] ?? ''}
                        onChange={(e) => setTokenValues((prev) => ({ ...prev, [t.name]: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none"
                      >
                        <option value="">Select...</option>
                        {t.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : t.type === 'boolean' ? (
                      <select
                        value={tokenValues[t.name] ?? ''}
                        onChange={(e) => setTokenValues((prev) => ({ ...prev, [t.name]: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none"
                      >
                        <option value="">Select...</option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : (
                      <input
                        type={t.type === 'number' ? 'number' : 'text'}
                        value={tokenValues[t.name] ?? ''}
                        onChange={(e) => setTokenValues((prev) => ({ ...prev, [t.name]: e.target.value }))}
                        placeholder={t.defaultValue || `Enter ${t.name}`}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Rendered output */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Rendered Output</h2>
              </div>
              <pre className="p-6 text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-700 max-h-[70vh] overflow-y-auto">
                {rendered || <span className="text-slate-400 italic">No content defined</span>}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateEditForm({
  template,
  registryModules = [],
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onSave,
  onDelete,
  onPublish,
  onPreview,
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

  // Filter tabs based on template type — static hides vars + code
  const visibleTabs = form.type === 'static'
    ? EDIT_TABS.filter((t) => t.id !== 'vars' && t.id !== 'code')
    : EDIT_TABS;

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
  const tplReferences = form.references ?? [];
  const versions = form.versions ?? [];

  // Reference helpers
  const addTplLinkReference = () => updateField('references', [...tplReferences, { type: 'link' as const, appName: '', usageContext: '' }]);
  const addTplContentReference = () => updateField('references', [...tplReferences, { type: 'content' as const, appName: '', filename: '', mimetype: '', content: '' }]);
  const updateTplReference = (index: number, field: string, value: string) => {
    const current = [...tplReferences];
    current[index] = { ...current[index], [field]: value };
    updateField('references', current);
  };
  const removeTplReference = (index: number) => updateField('references', tplReferences.filter((_, i) => i !== index));

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
          <Badge variant={form.type === 'dynamic' ? 'purple' : 'ghost'}>{form.type === 'dynamic' ? 'Dynamic' : 'Static'}</Badge>
        </div>
        <p className="text-sm text-slate-500">
          {form.name || 'Untitled'} &middot; <span className="font-mono text-xs text-slate-400">v{form.version}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {visibleTabs.map((t) => {
          const count = t.id === 'vars' ? tokens.length : t.id === 'refs' ? tplReferences.length : t.id === 'ver' ? versions.length : null;
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
              <div className="grid grid-cols-4 gap-5">
                <SelectField label="Category" value={form.category} onChange={(v) => { updateField('category', v); }} options={Object.keys(categoryColors).filter((c) => c !== 'all').map((c) => c.charAt(0).toUpperCase() + c.slice(1))} />
                <SelectField label="Type" value={form.type} onChange={(v) => updateField('type', v as Template['type'])} options={['static', 'dynamic']} />
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

          {/* ─── REFERENCES ─── */}
          {tab === 'refs' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">References</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {tplReferences.filter((r) => (r.type ?? 'link') === 'link').length} link{tplReferences.filter((r) => (r.type ?? 'link') === 'link').length !== 1 ? 's' : ''} &middot; {tplReferences.filter((r) => r.type === 'content').length} content
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={addTplLinkReference} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                    <EditTabIcon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" size={14} /> Link
                  </button>
                  <button onClick={addTplContentReference} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors">
                    <EditTabIcon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" size={14} /> Content
                  </button>
                </div>
              </div>
              {tplReferences.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">No references yet. Add a link or content reference.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {tplReferences.map((ref, i) => (
                    <div key={i} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-start gap-4">
                        {(ref.type ?? 'link') === 'link' ? (
                          <div className="mt-1.5 shrink-0 w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <EditTabIcon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" size={14} />
                          </div>
                        ) : (
                          <div className="mt-1.5 shrink-0 w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                            <EditTabIcon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" size={14} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={cx('inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', (ref.type ?? 'link') === 'link' ? 'bg-indigo-50 text-indigo-600' : 'bg-violet-50 text-violet-600')}>
                              {ref.type ?? 'link'}
                            </span>
                          </div>
                          {(ref.type ?? 'link') === 'link' ? (
                            <div className="grid grid-cols-2 gap-3">
                              <input type="text" value={ref.appName} onChange={(e) => updateTplReference(i, 'appName', e.target.value)} placeholder="Application name" className="px-2.5 py-1.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                              <input type="text" value={ref.usageContext ?? ''} onChange={(e) => updateTplReference(i, 'usageContext', e.target.value)} placeholder="Usage context" className="px-2.5 py-1.5 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-3 gap-3">
                                <input type="text" value={ref.appName} onChange={(e) => updateTplReference(i, 'appName', e.target.value)} placeholder="Reference name" className="px-2.5 py-1.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                                <input type="text" value={ref.filename ?? ''} onChange={(e) => updateTplReference(i, 'filename', e.target.value)} placeholder="filename.ext" className="px-2.5 py-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-mono text-xs" />
                                <input type="text" value={ref.mimetype ?? ''} onChange={(e) => updateTplReference(i, 'mimetype', e.target.value)} placeholder="application/json" className="px-2.5 py-1.5 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-mono text-xs" />
                              </div>
                              <textarea
                                value={ref.content ?? ''}
                                onChange={(e) => updateTplReference(i, 'content', e.target.value)}
                                rows={4}
                                placeholder="Paste content here..."
                                className="w-full px-3 py-2 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none"
                              />
                            </>
                          )}
                        </div>
                        <button onClick={() => removeTplReference(i)} className="mt-1.5 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} />
                        </button>
                      </div>
                    </div>
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
            <button onClick={() => {}} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors text-left">
              <EditTabIcon d="M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" size={14} /> Duplicate Template
            </button>
            <button onClick={() => onPreview?.(form)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors text-left">
              <EditTabIcon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" size={14} /> Preview Latest Output
            </button>
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

// ─── ModulePickerModal ─────────────────────────────────────

function ModulePickerModal({ modules, excludeIds, onAdd, onClose }: {
  modules: Module[];
  excludeIds: string[];
  onAdd: (moduleIds: string[]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const available = modules.filter(
    (m) => !excludeIds.includes(m.id) && (
      search.trim() === '' ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
    )
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <EditOverlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">Add Modules</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
          <EditTabIcon d="M18 6 6 18M6 6l12 12" size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="px-6 pt-4 pb-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <EditTabIcon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Module list */}
      <div className="overflow-y-auto px-6 pb-2" style={{ maxHeight: 320 }}>
        {available.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">No modules match your search.</div>
        ) : (
          <div className="space-y-1 py-2">
            {available.map((m) => (
              <label
                key={m.id}
                className={cx(
                  'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors',
                  selected.has(m.id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(m.id)}
                  onChange={() => toggle(m.id)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{m.name}</span>
                    <span className={cx('text-[11px] px-2 py-0.5 rounded-full font-medium', MODULE_CAT_COLORS[m.category] ?? 'bg-slate-100 text-slate-600')}>
                      {m.category}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">v{m.version}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{m.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
          Cancel
        </button>
        <button
          disabled={selected.size === 0}
          onClick={() => { onAdd(Array.from(selected)); onClose(); }}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-40 transition-colors"
        >
          Add Selected ({selected.size})
        </button>
      </div>
    </EditOverlay>
  );
}

// ─── ModulesAdmin ───────────────────────────────────────────

function ModulesAdmin({
  modules,
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onNew,
  onEdit,
  onDelete,
  className,
}: ModulesAdminProps) {
  return (
    <div className={cx('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Modules</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the central module registry</p>
        </div>
        {onNew && (
          <Button onClick={onNew} size="sm">
            New Module
          </Button>
        )}
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a7 7 0 0 1 7 7 7 7 0 0 1-7 7A7 7 0 0 1 4 11a7 7 0 0 1 7-7zM11 4v14M4 11h14" />
            </svg>
          </div>
          <div className="text-sm text-slate-500">No modules yet</div>
          <div className="text-sm text-slate-500">Create your first module to get started.</div>
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
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Dependencies</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{mod.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{mod.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cx('inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium', MODULE_CAT_COLORS[mod.category] ?? 'bg-slate-100 text-slate-600')}>
                      {mod.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">v{mod.version}</td>
                  <td className="px-4 py-3">
                    <Badge variant={mod.status === 'published' ? 'green' : mod.status === 'draft' ? 'amber' : 'red'}>
                      {mod.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{(mod.dependencies ?? []).length > 0 ? (mod.dependencies ?? []).join(', ') : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(mod)} className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">Edit</button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(mod)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
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

// ─── ModuleEditForm ─────────────────────────────────────────

function ModuleEditForm({
  module,
  registryModules = [],
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onSave,
  onDelete,
  onBack,
  className,
}: ModuleEditFormProps) {
  const [form, setForm] = useState<Module>({ ...module });
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const updateField = <K extends keyof Module>(key: K, value: Module[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const tags = form.tags ?? [];
  const deps = form.dependencies ?? [];

  const catKeys = [...Object.keys(MODULE_CAT_COLORS), 'other'];

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
            <EditTabIcon d="M19 12H5m7 7-7-7 7-7" size={15} /> Back to Modules
          </button>
        ) : <div />}
        <div className="flex items-center gap-3 flex-wrap">
          {dirty && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              Unsaved changes
            </span>
          )}
          {onDelete && module.id && (
            <button
              onClick={() => setModal('delMod')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              <EditTabIcon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={15} /> Delete
            </button>
          )}
          <button
            onClick={() => { setDirty(false); onSave?.(form); setToast('Module saved successfully'); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
          >
            <EditTabIcon d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" size={15} /> Save Module
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {module.id ? 'Edit Module' : 'New Module'}
          </h1>
          <Badge variant={statusBadgeVariant(form.status)}>{form.status.charAt(0).toUpperCase() + form.status.slice(1)}</Badge>
        </div>
        <p className="text-sm text-slate-500">
          {form.name || 'Untitled'} &middot; <span className="font-mono text-xs text-slate-400">v{form.version}</span>
        </p>
      </div>

      {/* Form body */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-800">Module Details</h2>

        {/* Row 1: Name + Slug */}
        <div className="grid grid-cols-2 gap-5">
          <Field label="Name" required value={form.name} onChange={(v) => updateField('name', v)} placeholder="Module name" />
          <Field label="Slug" required value={form.slug} onChange={(v) => updateField('slug', v)} placeholder="module-slug" />
        </div>

        {/* Row 2: Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
          />
        </div>

        {/* Row 3: Category + Version + Status */}
        <div className="grid grid-cols-3 gap-5">
          <SelectField
            label="Category"
            value={form.category}
            onChange={(v) => updateField('category', v)}
            options={catKeys}
          />
          <Field label="Version" required value={form.version} onChange={(v) => updateField('version', v)} placeholder="1.0.0" />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => updateField('status', v as Module['status'])}
            options={['draft', 'published', 'deprecated']}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Tags</label>
          <div className="flex items-center gap-2 flex-wrap p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                {tag}
                <button
                  onClick={() => updateField('tags', tags.filter((t) => t !== tag))}
                  className="text-slate-400 hover:text-red-500"
                >
                  <EditTabIcon d="M18 6 6 18M6 6l12 12" size={11} />
                </button>
              </span>
            ))}
            <input
              placeholder="+ Add tag"
              className="flex-1 min-w-[80px] bg-transparent text-xs text-slate-600 focus:outline-none"
              onKeyDown={(e) => {
                const input = e.target as HTMLInputElement;
                if (e.key === 'Enter' && input.value.trim()) {
                  const tag = input.value.trim().toLowerCase();
                  if (!tags.includes(tag)) updateField('tags', [...tags, tag]);
                  input.value = '';
                }
              }}
            />
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Dependencies</label>
          <div className="flex items-center gap-2 flex-wrap p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
            {deps.map((dep) => (
              <span key={dep} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 font-mono">
                {dep}
                <button
                  onClick={() => updateField('dependencies', deps.filter((d) => d !== dep))}
                  className="text-slate-400 hover:text-red-500"
                >
                  <EditTabIcon d="M18 6 6 18M6 6l12 12" size={11} />
                </button>
              </span>
            ))}
            <input
              placeholder="+ Add module slug"
              className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-600 font-mono focus:outline-none"
              onKeyDown={(e) => {
                const input = e.target as HTMLInputElement;
                if (e.key === 'Enter' && input.value.trim()) {
                  const dep = input.value.trim().toLowerCase();
                  if (!deps.includes(dep)) updateField('dependencies', [...deps, dep]);
                  input.value = '';
                }
              }}
            />
          </div>
          {registryModules.length > 0 && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              Available slugs: {registryModules.filter((m) => m.id !== module.id).map((m) => m.slug).join(', ')}
            </p>
          )}
        </div>
      </section>

      {/* Delete confirmation modal */}
      {modal === 'delMod' && (
        <EditOverlay onClose={() => setModal(null)}>
          <div className="px-6 py-5">
            <h3 className="text-base font-semibold text-slate-800">Delete Module</h3>
            <p className="text-sm text-slate-500 mt-2">This permanently removes the module from the registry. Templates and presets referencing it may break. This cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button
              onClick={() => { setModal(null); onDelete?.(form); }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
            >
              Delete
            </button>
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
  modules: registryModules = [],
  instances = [],
  auditLog = [],
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
  onPresetPublish,

  onInstanceDelete,
  onModuleSave,
  onModuleDelete,
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

  const [editingPreset, setEditingPreset] = useState<TemplatePreset | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<Template | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [viewingInstance, setViewingInstance] = useState<TemplateInstance | null>(null);

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    if (basePath == null) return;
    const onPopState = () => {
      setPage(getPageFromUrl());
      setSelectedPreset(null);

      setEditingPreset(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [basePath, getPageFromUrl]);
  const navWithBadges = effectiveNavItems;

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

    setEditingPreset(null);
    setEditingTemplate(null);
    setPreviewingTemplate(null);
    setEditingModule(null);
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

    setEditingTemplate(null);
    setViewingInstance(null);
  }, []);

  const handleNewPreset = useCallback(() => {
    handleEditPreset({
      id: '', slug: '', name: '', description: '', category: 'Backend',
      version: '1.0.0', template: '', templateVersion: '', status: 'draft', tags: [],
    });
  }, [handleEditPreset]);

  const handleEditTemplate = useCallback((template: Template) => {
    setEditingTemplate(template);
    setPreviewingTemplate(null);
    setEditingPreset(null);
    setSelectedPreset(null);

    setViewingInstance(null);
  }, []);

  const handlePreviewTemplate = useCallback((template: Template) => {
    setPreviewingTemplate(template);
    setEditingTemplate(null);
    setEditingPreset(null);
    setSelectedPreset(null);

    setViewingInstance(null);
    if (basePath != null) {
      const base = basePath.endsWith('/') ? basePath : basePath + '/';
      const url = base + 'preview';
      if (window.location.pathname !== url) {
        window.history.pushState(null, '', url);
      }
    }
  }, [basePath]);

  const handleNewTemplate = useCallback(() => {
    handleEditTemplate({
      id: '', slug: '', name: '', category: 'Backend', version: '1.0.0', type: 'dynamic', status: 'draft',
    });
  }, [handleEditTemplate]);

  const handleEditModule = useCallback((module: Module) => {
    setEditingModule(module);
    setEditingPreset(null);
    setEditingTemplate(null);
    setSelectedPreset(null);

    setViewingInstance(null);
  }, []);

  const handleNewModule = useCallback(() => {
    handleEditModule({
      id: '', slug: '', name: '', description: '', category: '', version: '1.0.0', status: 'draft',
    });
  }, [handleEditModule]);

  const handleViewInstance = useCallback((instance: TemplateInstance) => {
    setViewingInstance(instance);
    setEditingPreset(null);
    setEditingTemplate(null);
    setSelectedPreset(null);

  }, []);

  const renderContent = () => {
    // Template preview view
    if (previewingTemplate) {
      return (
        <TemplatePreviewView
          template={previewingTemplate}
          onBack={() => setPreviewingTemplate(null)}
        />
      );
    }

    // Template edit form view
    if (editingTemplate) {
      return (
        <TemplateEditForm
          template={editingTemplate}
          registryModules={registryModules}
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
          onPreview={handlePreviewTemplate}
        />
      );
    }

    // Module edit form view
    if (editingModule) {
      return (
        <ModuleEditForm
          module={editingModule}
          registryModules={registryModules}
          onBack={() => setEditingModule(null)}
          onSave={(updated) => {
            onModuleSave?.(updated);
            setEditingModule(null);
          }}
          onDelete={(mod) => {
            onModuleDelete?.(mod);
            setEditingModule(null);
          }}
        />
      );
    }

    // Instance detail view
    if (viewingInstance) {
      return (
        <InstanceDetail
          instance={viewingInstance}
          registryModules={registryModules}
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
          registryModules={registryModules}
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
          onPublish={onPresetPublish ? (preset, ver, log, brk) => {
            onPresetPublish(preset, ver, log, brk);
          } : undefined}
        />
      );
    }

    // Detail view
    if (selectedPreset && page === 'catalog') {
      return (
        <PresetDetail
          preset={selectedPreset}
          registryModules={registryModules}
          categoryColors={categoryColors}
          onBack={() => setSelectedPreset(null)}
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
      case 'modules':
        return (
          <ModulesAdmin
            modules={registryModules}
            categoryColors={categoryColors}
            onNew={handleNewModule}
            onEdit={handleEditModule}
            onDelete={(mod) => onModuleDelete?.(mod)}
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

          />
        );
    }
  };

  return (
    <div
      className={cx(
        'flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden',
        className
      )}
    >
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <TopNav
            items={navWithBadges}
            active={page}
            onNavigate={handleNavigate}
          />
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// ─── Compound Component Assembly ───────────────────────────

export const TemplateManagePresents = Object.assign(TemplateManagePresentsRoot, {
  Catalog: CatalogView,
  PresetCard,
  PresetDetail,
  PresetEditForm,

  Instances: InstancesView,
  InstanceDetail,
  TemplatesAdmin,
  TemplateEditForm,
  TemplatePreview: TemplatePreviewView,
  PresetsAdmin,
  ModulesAdmin,
  ModuleEditForm,
  AuditLog: AuditView,
  Sidebar,
  TopNav,
  Badge,
  Button,
  StatCard,
  ProgressBar,
  Field,
  SelectField,
  Toggle,
  ReviewSection,
});
