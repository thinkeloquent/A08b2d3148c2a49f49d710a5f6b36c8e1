import { useState, useMemo } from 'react';
import type {
  PanelRightPropertyFieldsProps,
  PropertyField,
  PropertyFieldGroup,
} from './types';

function DefaultHashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-300 shrink-0"
    >
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  );
}

function DefaultSearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function DefaultChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        'text-slate-400 transition-transform duration-150',
        isExpanded ? '' : '-rotate-90',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FieldItem({
  field,
  group,
  onFieldClick,
}: {
  field: PropertyField;
  group: PropertyFieldGroup;
  onFieldClick?: (field: PropertyField, group: PropertyFieldGroup) => void;
}) {
  const Tag = onFieldClick ? 'button' : 'div';
  return (
    <Tag
      className="flex items-center gap-2 px-4 py-1.5 mx-2 rounded-md hover:bg-slate-50 transition-colors group w-full text-left"
      onClick={onFieldClick ? () => onFieldClick(field, group) : undefined}
      type={onFieldClick ? 'button' : undefined}
    >
      {field.icon ?? <DefaultHashIcon />}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">
          {field.label}
        </p>
      </div>
      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
        {field.fieldKey}
      </span>
    </Tag>
  );
}

function GroupSection({
  group,
  isExpanded,
  onToggle,
  onFieldClick,
  chevronIcon,
}: {
  group: PropertyFieldGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onFieldClick?: (field: PropertyField, group: PropertyFieldGroup) => void;
  chevronIcon?: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-50">
      <button
        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
        onClick={onToggle}
        type="button"
      >
        {chevronIcon ?? <DefaultChevronIcon isExpanded={isExpanded} />}
        {group.name}
        <span className="text-[10px] text-slate-400 font-normal ml-auto">
          {group.fields.length}
        </span>
      </button>
      {isExpanded && (
        <div className="pb-1">
          {group.fields.map((field) => (
            <FieldItem
              key={field.fieldKey}
              field={field}
              group={group}
              onFieldClick={onFieldClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PanelRightPropertyFields({
  title,
  titleIcon,
  totalCount,
  groups,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search fields...',
  searchIcon,
  onFieldClick,
  defaultCollapsedGroups = [],
  chevronIcon,
  className,
  children,
}: PanelRightPropertyFieldsProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(defaultCollapsedGroups),
  );

  const computedTotalCount =
    totalCount ?? groups.reduce((sum, g) => sum + g.fields.length, 0);

  const filteredGroups = useMemo(() => {
    if (!searchValue) return groups;
    const query = searchValue.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        fields: group.fields.filter(
          (f) =>
            f.label.toLowerCase().includes(query) ||
            f.fieldKey.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.fields.length > 0);
  }, [groups, searchValue]);

  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <aside
      className={[
        'w-72 shrink-0 border-l border-slate-200 bg-white flex flex-col h-full overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          {titleIcon}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </h3>
          <span className="text-[10px] text-slate-400 ml-auto">
            {computedTotalCount}
          </span>
        </div>
        <div className="relative">
          {searchIcon ?? <DefaultSearchIcon />}
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400 transition-colors"
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredGroups.map((group) => (
          <GroupSection
            key={group.name}
            group={group}
            isExpanded={!collapsedGroups.has(group.name)}
            onToggle={() => toggleGroup(group.name)}
            onFieldClick={onFieldClick}
            chevronIcon={chevronIcon}
          />
        ))}
      </div>
      {children}
    </aside>
  );
}
