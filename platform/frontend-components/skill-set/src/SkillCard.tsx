import type { SkillCardProps } from './types';
import { Tag } from './Tag';
import { StatusBadge } from './StatusBadge';
import { DlIcon, StarIcon } from './icons';

export function SkillCard({
  skill,
  selected = false,
  onSelect,
  tagColors,
  className = '',
}: SkillCardProps) {
  return (
    <div
      onClick={() => onSelect?.(skill)}
      className={`cursor-pointer rounded-xl border bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)] transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-sm)] ${
        selected
          ? 'border-[var(--accent)] ring-2 ring-[var(--accent-mid)]'
          : 'border-[var(--border)]'
      } ${className}`}
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--text-3)]">{skill.ns}/</span>
            <span className="truncate text-[13px] font-semibold text-[var(--text-1)]">
              {skill.name}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-[var(--text-3)]">v{skill.version}</div>
        </div>
        <StatusBadge status={skill.status} />
      </div>

      {/* Description */}
      <p className="line2 mb-3 text-[12px] leading-relaxed text-[var(--text-2)]">{skill.desc}</p>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1">
        {skill.tags.map((t) => (
          <Tag key={t} label={t} colors={tagColors?.[t]} sm />
        ))}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-3 border-t border-[var(--border)] pt-2.5 text-[11px] text-[var(--text-3)]">
        <span className="flex items-center gap-1">
          <DlIcon size={12} />
          {skill.dl >= 1000 ? `${(skill.dl / 1000).toFixed(1)}k` : skill.dl}
        </span>
        <span className="flex items-center gap-1">
          <StarIcon size={12} />
          {skill.stars}
        </span>
        <span className="ml-auto text-[10px]">{skill.updated}</span>
      </div>
    </div>
  );
}
