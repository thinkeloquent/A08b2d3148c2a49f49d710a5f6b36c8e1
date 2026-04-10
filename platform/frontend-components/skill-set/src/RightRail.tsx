import { useState } from 'react';
import type { RightRailProps } from './types';
import { Tag } from './Tag';
import { StatusBadge } from './StatusBadge';
import { CheckIcon, CopyIcon, DlIcon, StarIcon, EmptyBoxIcon } from './icons';

const DETAIL_TABS = ['overview', 'triggers', 'requirements'] as const;

export function RightRail({
  skill,
  installed = false,
  onInstall,
  tagColors,
  installCommandPrefix = 'skillset install',
  emptyIcon,
  className = '',
}: RightRailProps) {
  const [detailTab, setDetailTab] = useState<string>('overview');
  const [copied, setCopied] = useState(false);

  if (!skill) {
    return (
      <div
        className={`flex w-[300px] min-w-[260px] flex-col items-center justify-center border-l border-[var(--border)] bg-[var(--surface)] text-center ${className}`}
      >
        {emptyIcon ?? <EmptyBoxIcon size={48} className="text-[var(--text-3)]" />}
        <p className="mt-3 text-[13px] text-[var(--text-3)]">Select a skill to view details</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${installCommandPrefix} ${skill.ns}/${skill.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`flex w-[300px] min-w-[260px] flex-col border-l border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {/* Header */}
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[var(--text-3)]">{skill.ns}/</span>
          <span className="text-[14px] font-semibold text-[var(--text-1)]">{skill.name}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-3)]">v{skill.version}</span>
          <StatusBadge status={skill.status} />
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-2)]">{skill.desc}</p>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4 text-[11px] text-[var(--text-3)]">
          <span className="flex items-center gap-1">
            <DlIcon size={12} />
            {skill.dl >= 1000 ? `${(skill.dl / 1000).toFixed(1)}k` : skill.dl}{' '}
            downloads
          </span>
          <span className="flex items-center gap-1">
            <StarIcon size={12} />
            {skill.stars} stars
          </span>
        </div>

        {/* Install command */}
        <div className="mt-3 flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-2">
          <code className="flex-1 truncate font-mono text-[11px] text-green-400">
            $ {installCommandPrefix} {skill.ns}/{skill.name}
          </code>
          <button
            onClick={handleCopy}
            className="cursor-pointer border-none bg-transparent p-1 text-gray-400 transition-colors hover:text-white"
            title="Copy command"
          >
            {copied ? (
              <CheckIcon size={12} className="text-green-400" />
            ) : (
              <CopyIcon size={12} />
            )}
          </button>
        </div>

        {/* Install toggle */}
        <button
          onClick={() => onInstall?.(skill.id)}
          className={`mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none px-4 py-2 text-[13px] font-semibold transition-colors ${
            installed
              ? 'bg-[var(--ok-bg)] text-[var(--ok)] hover:bg-red-50 hover:text-red-600'
              : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
          }`}
        >
          {installed ? (
            <>
              <CheckIcon size={12} /> Installed
            </>
          ) : (
            'Install'
          )}
        </button>
      </div>

      {/* Detail tabs */}
      <div className="flex border-b border-[var(--border)]">
        {DETAIL_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setDetailTab(t)}
            className={`flex-1 cursor-pointer border-b-2 border-x-0 border-t-0 bg-transparent py-2 text-[11px] font-medium capitalize transition-colors ${
              detailTab === t
                ? 'border-b-[var(--accent)] text-[var(--accent)]'
                : 'border-b-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Detail content */}
      <div className="flex-1 overflow-y-auto p-4">
        {detailTab === 'overview' && (
          <div className="flex flex-col gap-3">
            <DetailSection title="Tags">
              <div className="flex flex-wrap gap-1">
                {skill.tags.map((t) => (
                  <Tag key={t} label={t} colors={tagColors?.[t]} sm />
                ))}
              </div>
            </DetailSection>
            <DetailSection title="Updated">
              <span className="text-[12px] text-[var(--text-2)]">{skill.updated}</span>
            </DetailSection>
          </div>
        )}

        {detailTab === 'triggers' && (
          <div className="flex flex-col gap-1.5">
            {skill.triggers.map((tr, i) => (
              <div
                key={i}
                className="rounded-md bg-gray-50 px-2.5 py-1.5 font-mono text-[11px] text-[var(--text-2)]"
              >
                {tr}
              </div>
            ))}
          </div>
        )}

        {detailTab === 'requirements' && (
          <div className="flex flex-col gap-3">
            <DetailSection title="System Dependencies">
              {skill.sys.map((s, i) => (
                <div
                  key={i}
                  className="rounded-md bg-gray-50 px-2.5 py-1.5 font-mono text-[11px] text-[var(--text-2)]"
                >
                  {s}
                </div>
              ))}
            </DetailSection>
            <DetailSection title="Agent Tools">
              {skill.tools.map((tl, i) => (
                <div
                  key={i}
                  className="rounded-md bg-gray-50 px-2.5 py-1.5 font-mono text-[11px] text-[var(--text-2)]"
                >
                  {tl}
                </div>
              ))}
            </DetailSection>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        {title}
      </div>
      {children}
    </div>
  );
}
