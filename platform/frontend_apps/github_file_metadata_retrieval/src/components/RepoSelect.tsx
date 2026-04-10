import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown } from '@/components/icons';

export interface RepoOption {
  value: string;
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
}

interface RepoSelectProps {
  options: RepoOption[];
  value: string | null;
  onChange: (key: string) => void;
  loading?: boolean;
  placeholder?: string;
}

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  return lower.includes(q);
}

export function RepoSelect({ options, value, onChange, loading, placeholder = 'Select a repository...' }: RepoSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusIdx, setFocusIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value) ?? null;

  const filtered = useMemo(() => {
    if (!search) return options;
    return options.filter(o =>
      fuzzyMatch(o.owner, search) || fuzzyMatch(o.name, search) || fuzzyMatch(o.description, search)
    );
  }, [options, search]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset focus index when filtered list changes
  useEffect(() => { setFocusIdx(-1); }, [filtered]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusIdx >= 0 && listRef.current) {
      const el = listRef.current.children[focusIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusIdx]);

  function handleOpen() {
    setOpen(true);
    setSearch('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleSelect(opt: RepoOption) {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && focusIdx >= 0 && filtered[focusIdx]) {
      e.preventDefault();
      handleSelect(filtered[focusIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
    }
  }

  return (
    <div ref={containerRef} className="relative w-[300px]">
      {/* Control */}
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] flex items-center gap-2 cursor-pointer hover:border-slate-300 transition-colors shadow-sm min-h-[34px]"
        >
          {selected ? (
            <span className="flex items-center gap-1 truncate">
              <span className="text-indigo-500 font-medium">{selected.owner}</span>
              {selected.owner && <span className="text-slate-300">/</span>}
              <span className="font-semibold text-slate-800">{selected.name}</span>
            </span>
          ) : (
            <span className="text-slate-400">{loading ? 'Loading...' : placeholder}</span>
          )}
          <ChevronDown size={12} className="text-slate-400 ml-auto shrink-0" />
        </button>
      ) : (
        <div className="w-full bg-white border border-indigo-400 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm min-h-[34px] ring-2 ring-indigo-100">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search repositories..."
            className="flex-1 bg-transparent outline-none text-[13px] text-slate-800 placeholder:text-slate-400 min-w-0"
          />
          <ChevronDown size={12} className="text-slate-400 shrink-0" />
        </div>
      )}

      {/* Dropdown menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-[100] overflow-hidden">
          <div ref={listRef} className="max-h-[300px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-[13px] text-slate-400 text-center">
                No repositories found
              </div>
            ) : (
              filtered.map((opt, i) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setFocusIdx(i)}
                  className={`rounded-lg px-3 py-2 cursor-pointer text-[13px] transition-colors ${
                    opt.value === value
                      ? 'bg-indigo-50'
                      : i === focusIdx
                        ? 'bg-slate-50'
                        : ''
                  }`}
                >
                  <div>
                    <span className="text-slate-400">{opt.owner}/</span>
                    <span className={`font-semibold ${opt.value === value ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {opt.name}
                    </span>
                  </div>
                  {opt.description && (
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{opt.description}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
