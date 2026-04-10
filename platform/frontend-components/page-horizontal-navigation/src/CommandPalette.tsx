import { useState, useRef, useEffect } from 'react';
import type { CommandPaletteProps } from './types';

const SearchIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="7" cy="7" r="5" />
    <line x1="11" y1="11" x2="14.5" y2="14.5" />
  </svg>
);

export function CommandPalette({ open, onClose, onSelect, items, placeholder = 'Search pages...', className }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={['fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]', className].filter(Boolean).join(' ')} onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-300/40 overflow-hidden"
        style={{ animation: 'hn-paletteIn 0.2s ease-out' }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <span className="text-slate-400">{SearchIcon}</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
          <kbd className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No results found</p>
          )}
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              {item.icon && <span className="opacity-50">{item.icon}</span>}
              <span className="font-medium">{item.label}</span>
              <span className="ml-auto text-xs text-slate-400">{item.group}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
