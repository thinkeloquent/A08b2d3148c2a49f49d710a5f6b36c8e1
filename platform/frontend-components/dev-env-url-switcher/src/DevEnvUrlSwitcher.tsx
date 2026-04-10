import { useState, useEffect, useRef } from 'react';
import type {
  DevEnvUrlSwitcherProps,
  DevEnvUrlSwitcherModalProps,
  DevEnvUrlSwitcherLink,
  LinkCardProps,
} from './types';

const DEFAULT_COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function LinkCard({ item, index, onNavigate, className }: LinkCardProps) {
  const colors = DEFAULT_COLORS;
  const color = colors[index % colors.length];
  const initial = item.name.charAt(0).toUpperCase();

  return (
    <button
      onClick={() => onNavigate(item.url)}
      className={[
        'group w-full text-left rounded-xl border border-slate-200 bg-white',
        'hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/40',
        'transition-all duration-200 p-3.5 flex items-center gap-3.5',
        'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2',
        'active:scale-[0.985]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
          'text-white text-sm font-bold group-hover:scale-105 transition-transform duration-200',
          color,
        ].join(' ')}
      >
        {initial}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
          {item.name}
        </span>
        <span className="block text-xs text-slate-400 truncate mt-0.5">
          {extractHostname(item.url)}
        </span>
      </span>
      <span className="text-xs text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0">
        &#8599;
      </span>
    </button>
  );
}

function Modal({
  open,
  onClose,
  links,
  onNavigate,
  search,
  setSearch,
  title = 'Quick Navigate',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No matches',
  colors = DEFAULT_COLORS,
  className,
}: DevEnvUrlSwitcherModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [anim, setAnim] = useState<'closed' | 'entering' | 'open' | 'leaving'>('closed');

  useEffect(() => {
    if (open) {
      setAnim('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim('open')));
      setTimeout(() => inputRef.current?.focus(), 120);
    } else if (anim === 'open') {
      setAnim('leaving');
      const t = setTimeout(() => setAnim('closed'), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (anim === 'closed') return null;

  const filtered = links.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase()),
  );

  const isOpen = anim === 'open';

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
      <div
        className={[
          'absolute inset-0 transition-all duration-200',
          isOpen ? 'bg-slate-900/25 backdrop-blur-sm' : 'bg-transparent',
        ].join(' ')}
        onClick={onClose}
      />
      <div
        className={[
          'relative w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-slate-900/10',
          'border border-slate-200/80 transition-all duration-200 origin-bottom',
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-3 opacity-0 scale-95',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <span className="text-sm font-bold text-slate-800">{title}</span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 focus:outline-none"
          >
            &#10005;
          </button>
        </div>

        <div className="px-5 pb-3">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 transition-all"
          />
        </div>

        <div className="px-5 pb-5 max-h-72 overflow-y-auto space-y-1.5">
          {filtered.length > 0 ? (
            filtered.map((item, i) => (
              <LinkCard key={item.url + i} item={item} index={i} onNavigate={onNavigate} />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">{emptyMessage}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-2.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Esc</kbd>{' '}
            close
          </span>
          <span className="text-[11px] text-slate-400">Opens in new tab</span>
        </div>
      </div>
    </div>
  );
}

const defaultNavigate = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export function DevEnvUrlSwitcher({
  links,
  onNavigate = defaultNavigate,
  triggerLabel = 'Links',
  triggerIcon,
  title,
  searchPlaceholder,
  emptyMessage,
  colors,
  className,
}: DevEnvUrlSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleNavigate = (url: string) => {
    onNavigate(url);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={[
          'fixed bottom-6 right-6 z-[9998] h-12 px-5 rounded-2xl',
          'bg-gradient-to-r from-indigo-500 to-violet-600',
          'text-white text-sm font-semibold',
          'shadow-lg shadow-indigo-500/25',
          'hover:shadow-xl hover:shadow-indigo-500/35',
          'hover:scale-105 active:scale-95',
          'transition-all duration-200',
          'focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-offset-2',
          'flex items-center gap-2',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {triggerIcon}
        {triggerLabel}
        <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-md">{links.length}</span>
      </button>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setSearch('');
        }}
        links={links}
        onNavigate={handleNavigate}
        search={search}
        setSearch={setSearch}
        title={title}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        colors={colors}
      />
    </>
  );
}
