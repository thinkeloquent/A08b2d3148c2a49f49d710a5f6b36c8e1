import type { GitHubCommitHistoryEntry } from '@/types';
import { hashColor } from '@/utils/colors';
import { GITHUB_BASE_URL } from '@/api/github';
import { AvatarImg } from '@/components/AvatarImg';

interface Contributor {
  login: string;
  name: string;
  avatarUrl: string;
  commitCount: number;
  color: string;
}

interface ContributorClusterProps {
  commits: GitHubCommitHistoryEntry[];
}

export function ContributorCluster({ commits }: ContributorClusterProps) {
  const contributors = new Map<string, Contributor>();
  for (const c of commits) {
    const key = c.authorLogin || c.author;
    const existing = contributors.get(key);
    if (existing) {
      existing.commitCount++;
    } else {
      contributors.set(key, {
        login: c.authorLogin,
        name: c.author,
        avatarUrl: c.authorAvatarUrl,
        commitCount: 1,
        color: hashColor(key),
      });
    }
  }

  const sorted = [...contributors.values()].sort((a, b) => b.commitCount - a.commitCount);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
        Contributors ({sorted.length})
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {sorted.map(c => (
          <div key={c.login || c.name} className="group relative">
            <a
              href={c.login ? `${GITHUB_BASE_URL}/${c.login}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <AvatarImg
                src={c.avatarUrl}
                name={c.name}
                size={32}
                className="border-2 hover:border-indigo-300 transition-colors"
                borderColor={c.color}
              />
            </a>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 text-white text-[11px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="font-medium">{c.login ? `@${c.login}` : c.name}</div>
              <div className="text-slate-300">{c.commitCount} commit{c.commitCount !== 1 ? 's' : ''}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Export the color mapping for reuse in charts */
export function getAuthorColor(authorKey: string): string {
  return hashColor(authorKey);
}
