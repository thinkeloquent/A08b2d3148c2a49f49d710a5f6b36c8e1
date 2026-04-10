import { useState, useEffect, useRef, useCallback } from 'react';
import type { ScopeItem } from '../types';

/* ── Icons matching the screenshot ── */

const OrganizationsIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="7" height="7" rx="1.5" />
    <rect x="11" y="2" width="7" height="7" rx="1.5" />
    <rect x="2" y="11" width="7" height="7" rx="1.5" />
    <rect x="11" y="11" width="7" height="7" rx="1.5" />
  </svg>
);

const WorkspacesIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="14" height="7" rx="2" />
    <rect x="5" y="6" width="10" height="6" rx="1.5" />
    <rect x="7" y="3" width="6" height="5" rx="1" />
  </svg>
);

const TeamsIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="3" />
    <circle cx="13" cy="7" r="3" />
    <path d="M1 17c0-2.8 2.7-5 6-5 1.2 0 2.3.3 3.2.8" />
    <path d="M10.8 12.8c.9-.5 2-.8 3.2-.8 3.3 0 6 2.2 6 5" />
  </svg>
);

const ApplicationsIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="16" height="16" rx="3" />
    <line x1="2" y1="7" x2="18" y2="7" />
    <circle cx="5" cy="4.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="7.5" cy="4.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="10" cy="4.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const ProjectsIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5c0-1.1.9-2 2-2h4l2 2h6c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5z" />
  </svg>
);

const ResourcesIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2L18 6.5V13.5L10 18L2 13.5V6.5L10 2Z" />
    <line x1="10" y1="18" x2="10" y2="10" />
    <line x1="18" y1="6.5" x2="10" y2="10" />
    <line x1="2" y1="6.5" x2="10" y2="10" />
  </svg>
);

const ChevDown = (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 8,11 13,6" />
  </svg>
);

/** Default scope items matching the screenshot hierarchy. */
const DEFAULT_SCOPE_ITEMS: ScopeItem[] = [
  { id: 'organizations', label: 'Organizations', icon: OrganizationsIcon },
  { id: 'workspaces',    label: 'Workspaces',    icon: WorkspacesIcon },
  { id: 'teams',         label: 'Teams',         icon: TeamsIcon },
  { id: 'applications',  label: 'Applications',  icon: ApplicationsIcon },
  { id: 'projects',      label: 'Projects',      icon: ProjectsIcon },
  { id: 'resources',     label: 'Resources',     icon: ResourcesIcon },
];

export interface ScopeDropdownProps {
  items?: ScopeItem[];
  activeId?: string;
  onScopeChange?: (id: string) => void;
  className?: string;
}

/**
 * ScopeDropdown — a directed component that renders a hierarchy scope
 * selector (Organizations → Workspaces → Teams → Applications → Projects → Resources).
 *
 * Reads context from `useHorizontalNavigation()` when placed inside a
 * `<HorizontalNavigation>` tree. Works standalone with explicit props.
 */
export function ScopeDropdown({
  items: itemsProp,
  activeId: activeIdProp,
  onScopeChange,
  className,
}: ScopeDropdownProps = {}) {
  const items = itemsProp ?? DEFAULT_SCOPE_ITEMS;
  const [internalId, setInternalId] = useState(items[0]?.id);
  const activeId = activeIdProp ?? internalId;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeItem = items.find((i) => i.id === activeId) ?? items[0];

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = useCallback(
    (id: string) => {
      if (onScopeChange) {
        onScopeChange(id);
      } else {
        setInternalId(id);
      }
      setOpen(false);
    },
    [onScopeChange],
  );

  return (
    <div ref={containerRef} className={['relative flex-shrink-0', className].filter(Boolean).join(' ')}>
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors group"
      >
        <span className={open || activeId ? 'text-blue-600' : 'text-slate-500'}>
          {activeItem?.icon}
        </span>
        <span className="text-sm font-semibold text-slate-800">
          {activeItem?.label}
        </span>
        <span
          className={[
            'transition-all duration-150',
            open ? 'text-slate-600 rotate-180' : 'text-slate-400 group-hover:text-slate-600',
          ].join(' ')}
        >
          {ChevDown}
        </span>
      </button>

      {/* ── Flyout panel ── */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50"
          style={{ animation: 'hn-dropIn 0.15s ease-out' }}
        >
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors relative',
                  isActive
                    ? 'text-blue-600 bg-blue-50/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                ].join(' ')}
              >
                {/* Left accent bar for active item */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-blue-500" />
                )}
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
