import { useState, useRef, useEffect, useCallback } from 'react';
import type { NavDropdownProps } from './types';

const ChevDown = (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 8,11 13,6" />
  </svg>
);

export function NavDropdown({ label, items, activeId, onSelect, className }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 8, left: rect.left });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, updatePosition]);

  const hasActive = items.some((i) => i.id === activeId);

  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className={[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
          'transition-all duration-150 whitespace-nowrap select-none',
          hasActive
            ? 'bg-slate-100 text-slate-900'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
        ].join(' ')}
      >
        {label}
        <span className={['transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}>
          {ChevDown}
        </span>
      </button>

      {open && menuPos && (
        <div
          ref={menuRef}
          className="fixed w-56 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/60 py-1.5 z-50"
          style={{ top: menuPos.top, left: menuPos.left, animation: 'hn-dropIn 0.18s ease-out' }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); setOpen(false); }}
              className={[
                'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors',
                item.id === activeId
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              {item.icon && <span className="opacity-60 flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge != null && (
                <span className={[
                  'ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full',
                  typeof item.badge === 'string'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-indigo-100 text-indigo-600',
                ].join(' ')}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
