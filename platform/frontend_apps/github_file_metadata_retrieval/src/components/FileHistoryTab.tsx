import { useState, useEffect, lazy, Suspense } from 'react';
import type { GitHubCommitHistoryEntry } from '@/types';
import { fetchFileCommits } from '@/api/github';
import { LifecycleHeader } from '@/components/history/LifecycleHeader';
import { ContributorCluster } from '@/components/history/ContributorCluster';
import { CalendarHeatmap } from '@/components/history/CalendarHeatmap';

const CommitTimeline = lazy(() =>
  import('@/components/history/CommitTimeline').then(m => ({ default: m.CommitTimeline })),
);
import { CodeChurnChart } from '@/components/history/CodeChurnChart';
import { LocTrendChart } from '@/components/history/LocTrendChart';
import { CommitList } from '@/components/history/CommitList';

interface FileHistoryTabProps {
  owner: string;
  repo: string;
  filePath: string;
  fileName: string;
}

export function FileHistoryTab({ owner, repo, filePath, fileName }: FileHistoryTabProps) {
  const [commits, setCommits] = useState<GitHubCommitHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCommits([]);
    fetchFileCommits(owner, repo, filePath)
      .then(data => {
        setCommits(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [owner, repo, filePath]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Loading commit history...
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        No commit history found for this file
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fb] p-5">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 1. Lifecycle badges */}
        <LifecycleHeader fileName={fileName} commits={commits} />

        {/* 5. Contributors */}
        <ContributorCluster commits={commits} />

        {/* 1b. Interactive timeline / diff scrubber */}
        <Suspense fallback={<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-[12px] text-slate-400 text-center py-8">Loading chart...</div>}>
          <CommitTimeline commits={commits} />
        </Suspense>

        {/* 3. Calendar heatmap - activity patterns */}
        <CalendarHeatmap commits={commits} />

        {/* 4. Code churn - additions vs deletions (lazy) */}
        <CodeChurnChart owner={owner} repo={repo} filePath={filePath} commits={commits} />

        {/* 2. LOC trend over time (lazy) */}
        <LocTrendChart owner={owner} repo={repo} filePath={filePath} commits={commits} />

        {/* Full commit list */}
        <CommitList owner={owner} repo={repo} commits={commits} />
      </div>
    </div>
  );
}
