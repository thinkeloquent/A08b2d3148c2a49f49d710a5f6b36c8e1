import { useMemo } from 'react';
import type { ApiRepo, GitHubRepoDetails } from '@/types';
import { parseGithubOwnerName } from '@/types';
import { GithubLogo, GitBranch, GitFork, Star } from '@/components/icons';
import { RepoSelect, type RepoOption } from '@/components/RepoSelect';
import { formatCount } from '@/utils/format';

interface TopBarProps {
  apiRepos: ApiRepo[];
  selectedRepoKey: string | null;
  onChangeRepo: (key: string) => void;
  loading?: boolean;
  repoDetails?: GitHubRepoDetails | null;
}

export function TopBar({ apiRepos, selectedRepoKey, onChangeRepo, loading, repoDetails }: TopBarProps) {
  const options: RepoOption[] = useMemo(() =>
    apiRepos.map(r => {
      const parsed = parseGithubOwnerName(r.githubUrl);
      const owner = parsed?.owner ?? r.maintainer ?? '';
      const name = parsed?.name ?? r.name;
      const key = owner ? `${owner}/${name}` : name;
      return { value: key, owner, name, description: r.description, stars: r.stars, forks: r.forks };
    }),
    [apiRepos],
  );

  const selectedOption = options.find(o => o.value === selectedRepoKey) ?? null;

  return (
    <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 flex-wrap">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
          <GithubLogo />
        </div>
        <span className="text-[13px] font-bold text-slate-800 tracking-tight">GitHub File Metadata Retrieval</span>
      </div>

      {/* Repo selector */}
      <RepoSelect
        options={options}
        value={selectedRepoKey}
        onChange={onChangeRepo}
        loading={loading}
      />

      {/* Right side badges */}
      {selectedOption && (
        <div className="flex items-center gap-1.5 ml-auto">
          <Badge icon={<GitBranch size={13} />} label={repoDetails?.default_branch ?? 'main'} />
          <Badge icon={<GitFork size={13} />} label={formatCount(repoDetails?.forks_count ?? selectedOption.forks)} />
          <Badge icon={<Star size={13} />} label={formatCount(repoDetails?.stargazers_count ?? selectedOption.stars)} className="text-amber-500" />
        </div>
      )}
    </div>
  );
}

function Badge({ icon, label, className = 'text-slate-500' }: { icon: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium ${className}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
