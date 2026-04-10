import { useState, useEffect, useRef, useCallback } from 'react';
import { useHorizontalNavigation } from '../HorizontalNavigationContext';
import type { OrgSlot } from '../types';

/* ── Icons ── */
const SearchIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="7" cy="7" r="5" />
    <line x1="11" y1="11" x2="14.5" y2="14.5" />
  </svg>
);

const ChevDown = (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 8,11 13,6" />
  </svg>
);

const PlusCircle = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="11" /><line x1="5" y1="8" x2="11" y2="8" />
  </svg>
);

const GearIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="8" cy="8" r="3" />
    <path d="M13.4 10.3a1.1 1.1 0 00.22 1.22l.04.04a1.34 1.34 0 11-1.9 1.9l-.03-.04a1.1 1.1 0 00-1.22-.22 1.1 1.1 0 00-.67 1.01V14.67a1.34 1.34 0 01-2.68 0v-.06a1.1 1.1 0 00-.72-1.01 1.1 1.1 0 00-1.22.22l-.04.04a1.34 1.34 0 11-1.9-1.9l.04-.04A1.1 1.1 0 003.54 10.7a1.1 1.1 0 00-1.01-.67H2.27a1.34 1.34 0 010-2.68h.06A1.1 1.1 0 003.34 6.6a1.1 1.1 0 00-.22-1.22l-.04-.04a1.34 1.34 0 111.9-1.9l.04.04a1.1 1.1 0 001.22.22h.05a1.1 1.1 0 00.67-1.01V2.27a1.34 1.34 0 012.68 0v.06a1.1 1.1 0 00.67 1.01 1.1 1.1 0 001.22-.22l.04-.04a1.34 1.34 0 111.9 1.9l-.04.04a1.1 1.1 0 00-.22 1.22v.05a1.1 1.1 0 001.01.67h.26a1.34 1.34 0 010 2.68h-.06a1.1 1.1 0 00-1.01.67z" />
  </svg>
);

const RefreshIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1v5h5" /><path d="M15 15v-5h-5" />
    <path d="M2.3 10a6 6 0 0010.3 1.5L15 10M1 6l2.4-1.5A6 6 0 0113.7 6" />
  </svg>
);

const Checkmark = (
  <svg className="ml-auto flex-shrink-0 text-blue-600" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,8 7,12 13,4" />
  </svg>
);

export interface OrganizationDropdownProps {
  org?: OrgSlot;
}

/**
 * OrganizationDropdown — a directed component that reads `org` from
 * `useHorizontalNavigation()` context and renders the org-switcher
 * trigger + flyout panel.
 *
 * Drop this anywhere inside a `<HorizontalNavigation>` tree and it
 * will automatically wire up to the org data supplied to the parent.
 *
 * Props can override the context value when the component is used
 * standalone (outside of HorizontalNavigation).
 */
export function OrganizationDropdown({ org: orgOverride }: OrganizationDropdownProps = {}) {
  const ctx = useHorizontalNavigation();
  const org = orgOverride ?? ctx?.org;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Close on outside click; focus search input on open; reset search on close */
  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }
    requestAnimationFrame(() => searchInputRef.current?.focus());

    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = useCallback(() => {
    org?.onClick?.();
    setOpen((prev) => !prev);
  }, [org]);

  if (!org) return null;

  const orgList =
    org.orgs && org.orgs.length > 0
      ? org.orgs
      : [{ id: '__current', name: org.name, initial: org.initial, color: org.color }];

  const filtered = search
    ? orgList.filter((entry) => entry.name.toLowerCase().includes(search.toLowerCase()))
    : orgList;

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      {/* ── Trigger ── */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-slate-100 transition-colors group"
      >
        <span
          className={[
            'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
            org.color || 'bg-purple-600',
          ].join(' ')}
        >
          {org.icon || org.initial || org.name.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-semibold text-slate-800">{org.name}</span>
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
          className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
          style={{ animation: 'hn-dropIn 0.15s ease-out' }}
        >
          {/* Search */}
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Organization
              </p>
              {org.onRefresh && (
                <button
                  onClick={() => org.onRefresh?.()}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Refresh organizations"
                >
                  {RefreshIcon}
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                {SearchIcon}
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Org list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((entry) => {
                const isCurrent = entry.name === org.name;
                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      if (!isCurrent) org.onOrgChange?.(entry.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className={[
                        'w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0',
                        entry.color || org.color || 'bg-purple-600',
                      ].join(' ')}
                    >
                      {entry.initial || entry.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {entry.name}
                    </span>
                    {entry.status === 'archived' && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                        archived
                      </span>
                    )}
                    {isCurrent && Checkmark}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-3 text-sm text-slate-400 text-center">
                No organizations found
              </p>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-t border-slate-100 mt-1 pt-1">
            <a
              href={org.createHref || '#'}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {PlusCircle}
              Create organization
            </a>
            <a
              href={org.manageHref || '#'}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {GearIcon}
              Manage organizations
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
