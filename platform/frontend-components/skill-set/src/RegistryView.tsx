import { useState, useMemo } from 'react';
import type { RegistryViewProps, Skill } from './types';
import { SkillCard } from './SkillCard';
import { RightRail } from './RightRail';
import { Tag } from './Tag';
import { SearchIcon, XIcon } from './icons';

type SortKey = 'dl' | 'stars';
type StatusFilter = 'all' | 'stable' | 'beta';

export function RegistryView({
  skills,
  tagColors,
  installedIds,
  onInstallToggle,
  installCommandPrefix,
  className = '',
}: RegistryViewProps) {
  const [query, setQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('dl');

  // Gather all unique tags
  const allTags = useMemo(() => {
    const s = new Set<string>();
    skills.forEach((sk) => sk.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, [skills]);

  // Filter and sort
  const filtered = useMemo(() => {
    let list = skills;
    // text search
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q) ||
          s.ns.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    // tag filter
    if (activeTags.size > 0) {
      list = list.filter((s) => s.tags.some((t) => activeTags.has(t)));
    }
    // status filter
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }
    // sort
    return [...list].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [skills, query, activeTags, statusFilter, sortBy]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <div className={`flex flex-1 overflow-hidden ${className}`}>
      {/* Center column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
            <SearchIcon size={14} className="text-[var(--text-3)]" />
            <input
              type="text"
              placeholder="Search skills, tags, namespaces..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-none bg-transparent text-[13px] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="cursor-pointer border-none bg-transparent p-0.5 text-[var(--text-3)] hover:text-[var(--text-2)]"
              >
                <XIcon size={10} />
              </button>
            )}
          </div>

          {/* Tag filters */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`cursor-pointer rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all ${
                  activeTags.has(tag)
                    ? 'border-[var(--accent)] bg-[var(--accent-lt)] text-[var(--accent)]'
                    : 'border-[var(--border)] bg-transparent text-[var(--text-3)] hover:border-[var(--border-md)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Sort + status row */}
          <div className="mt-2 flex items-center gap-3">
            <div className="flex gap-1">
              {(['all', 'stable', 'beta'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`cursor-pointer rounded-md border-none px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-[var(--accent-lt)] text-[var(--accent)]'
                      : 'bg-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--text-3)]">
              <span>Sort:</span>
              {(['dl', 'stars'] as SortKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setSortBy(k)}
                  className={`cursor-pointer rounded-md border-none px-2 py-1 text-[11px] font-medium transition-colors ${
                    sortBy === k
                      ? 'bg-[var(--accent-lt)] text-[var(--accent)]'
                      : 'bg-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'
                  }`}
                >
                  {k === 'dl' ? 'Downloads' : 'Stars'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card grid */}
        <div className="flex-1 overflow-y-auto bg-[var(--bg)] p-5">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {filtered.map((s) => (
              <SkillCard
                key={s.id}
                skill={s}
                selected={selectedSkill?.id === s.id}
                onSelect={setSelectedSkill}
                tagColors={tagColors}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[14px] font-medium text-[var(--text-2)]">No skills found</p>
              <p className="mt-1 text-[12px] text-[var(--text-3)]">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right rail */}
      <RightRail
        skill={selectedSkill}
        installed={selectedSkill ? installedIds.has(selectedSkill.id) : false}
        onInstall={onInstallToggle}
        tagColors={tagColors}
        installCommandPrefix={installCommandPrefix}
      />
    </div>
  );
}
