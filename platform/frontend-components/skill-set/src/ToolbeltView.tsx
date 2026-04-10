import { useMemo } from 'react';
import type { ToolbeltViewProps } from './types';
import { Tag } from './Tag';
import { StatusBadge } from './StatusBadge';
import { DlIcon, StarIcon, XIcon, EmptyBoxIcon } from './icons';

export function ToolbeltView({
  skills,
  installedIds,
  onInstallToggle,
  tagColors,
  className = '',
}: ToolbeltViewProps) {
  const installed = useMemo(
    () => skills.filter((s) => installedIds.has(s.id)),
    [skills, installedIds]
  );

  if (installed.length === 0) {
    return (
      <div
        className={`flex flex-1 flex-col items-center justify-center bg-[var(--bg)] text-center ${className}`}
      >
        <EmptyBoxIcon size={56} className="text-[var(--text-3)]" />
        <p className="mt-4 text-[15px] font-medium text-[var(--text-2)]">Toolbelt is empty</p>
        <p className="mt-1 text-[12px] text-[var(--text-3)]">
          Install skills from the registry to see them here
        </p>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto bg-[var(--bg)] p-6 ${className}`}>
      <div className="mb-4 text-[13px] font-semibold text-[var(--text-2)]">
        {installed.length} skill{installed.length !== 1 ? 's' : ''} installed
      </div>
      <div className="flex flex-col gap-2">
        {installed.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]"
          >
            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[var(--text-3)]">{skill.ns}/</span>
                <span className="text-[13px] font-semibold text-[var(--text-1)]">{skill.name}</span>
                <span className="text-[11px] text-[var(--text-3)]">v{skill.version}</span>
                <StatusBadge status={skill.status} />
              </div>
              <p className="mt-1 truncate text-[12px] text-[var(--text-2)]">{skill.desc}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {skill.tags.map((t) => (
                  <Tag key={t} label={t} colors={tagColors?.[t]} sm />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-3)]">
              <span className="flex items-center gap-1">
                <DlIcon size={12} />
                {skill.dl >= 1000 ? `${(skill.dl / 1000).toFixed(1)}k` : skill.dl}
              </span>
              <span className="flex items-center gap-1">
                <StarIcon size={12} />
                {skill.stars}
              </span>
            </div>

            {/* Remove button */}
            <button
              onClick={() => onInstallToggle(skill.id)}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-100"
              title="Uninstall"
            >
              <XIcon size={8} />
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
