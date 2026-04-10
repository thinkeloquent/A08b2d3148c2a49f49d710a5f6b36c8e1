import type { GitHubCommitHistoryEntry } from '@/types';

interface LifecycleHeaderProps {
  fileName: string;
  commits: GitHubCommitHistoryEntry[];
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / 86_400_000);
}

function formatAge(days: number): string {
  if (days < 1) return 'today';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
  return m > 0 ? `${y}y ${m}m` : `${y}y`;
}

export function LifecycleHeader({ fileName, commits }: LifecycleHeaderProps) {
  if (commits.length === 0) return null;

  const now = new Date();
  const dates = commits.map(c => new Date(c.date)).filter(d => !isNaN(d.getTime()));
  if (dates.length === 0) return null;

  const oldest = new Date(Math.min(...dates.map(d => d.getTime())));
  const newest = new Date(Math.max(...dates.map(d => d.getTime())));
  const ageDays = daysBetween(oldest, now);
  const recencyDays = daysBetween(newest, now);
  const isHot = recencyDays <= 14;
  const isCold = recencyDays > 180;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="text-[14px] text-slate-800 font-semibold font-mono mb-3">{fileName}</div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
          {commits.length} commit{commits.length !== 1 ? 's' : ''}
        </span>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
          Age: {formatAge(ageDays)}
        </span>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
          isHot
            ? 'bg-orange-50 border-orange-200 text-orange-600'
            : isCold
              ? 'bg-slate-50 border-slate-200 text-slate-400'
              : 'bg-green-50 border-green-200 text-green-600'
        }`}>
          {isHot ? 'Hot' : isCold ? 'Cold' : 'Active'} &middot; {recencyDays === 0 ? 'today' : `${recencyDays}d ago`}
        </span>
        <span className="text-[11px] text-slate-400">
          Created {oldest.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
