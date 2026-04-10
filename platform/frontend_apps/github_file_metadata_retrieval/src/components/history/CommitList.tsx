import { useState } from 'react';
import type { GitHubCommitHistoryEntry, CommitDetail } from '@/types';
import { hashColor } from '@/utils/colors';
import { fetchCommitDetail, GITHUB_BASE_URL } from '@/api/github';
import { AvatarImg } from '@/components/AvatarImg';

interface CommitListProps {
  owner: string;
  repo: string;
  commits: GitHubCommitHistoryEntry[];
}

export function CommitList({ owner, repo, commits }: CommitListProps) {
  if (commits.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
        Commit History ({commits.length})
      </div>
      <div className="space-y-0">
        {commits.map((commit, idx) =>
        <CommitRow
          key={commit.sha + idx}
          owner={owner}
          repo={repo}
          commit={commit}
          isLast={idx === commits.length - 1} />

        )}
      </div>
    </div>);

}

// ── Per-row component with on-demand expand ────────────────────────

interface CommitRowProps {
  owner: string;
  repo: string;
  commit: GitHubCommitHistoryEntry;
  isLast: boolean;
}

function CommitRow({ owner, repo, commit, isLast }: CommitRowProps) {
  const [detail, setDetail] = useState<CommitDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);

  const color = hashColor(commit.authorLogin || commit.author);

  function handleExpand() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (detail) {
      setExpanded(true);
      return;
    }
    setLoading(true);
    setError(false);
    fetchCommitDetail(owner, repo, commit.fullSha).
    then((d) => {
      setDetail(d);
      setExpanded(true);
      setLoading(false);
    }).
    catch(() => {
      setError(true);
      setLoading(false);
    });
  }

  return (
    <div className={`py-2.5 ${!isLast ? 'border-b border-slate-100' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Timeline dot */}
        <div className="flex flex-col items-center pt-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-slate-700 font-medium leading-snug truncate">
            {commit.message}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-400 flex-wrap">
            <AvatarImg src={commit.authorAvatarUrl} name={commit.authorLogin || commit.author} size={16} />
            {commit.authorLogin ?
            <a
              href={`${GITHUB_BASE_URL}/${commit.authorLogin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline">

                @{commit.authorLogin}
              </a> :

            <span>{commit.author}</span>
            }
            <span className="text-slate-300">&middot;</span>
            <span>
              {commit.date ?
              new Date(commit.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              }) :
              '\u2014'}
            </span>
            <span className="text-slate-300">&middot;</span>
            <span className="font-mono text-indigo-500">{commit.sha}</span>
            {commit.verified &&
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200">
                Verified
              </span>
            }
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={handleExpand}
          disabled={loading}
          title={expanded ? 'Collapse details' : 'Show PRs & changes'}
          className={`shrink-0 mt-1 p-1.5 rounded-lg border transition-colors ${
          expanded ?
          'bg-indigo-50 border-indigo-200 text-indigo-500' :
          'bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-200'}`
          }>

          {loading ?
          <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> :

          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" data-test-id="svg-02cd5b9c">
              <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm0 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM9.25 5a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019.25 5z" />
            </svg>
          }
        </button>
      </div>

      {/* Error state */}
      {error &&
      <div className="ml-[22px] mt-2 text-[11px] text-red-400">
          Failed to load details.{' '}
          <button onClick={handleExpand} className="text-indigo-500 hover:underline">Retry</button>
        </div>
      }

      {/* Expanded detail panel */}
      {expanded && detail &&
      <div className="ml-[22px] mt-2 space-y-2">
          {/* PRs */}
          {detail.prs.length > 0 &&
        <div className="flex flex-wrap gap-1.5">
              {detail.prs.map((pr) =>
          <a
            key={pr.number}
            href={pr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors hover:opacity-80 ${
            pr.merged_at ?
            'bg-purple-50 text-purple-600 border-purple-200' :
            pr.state === 'closed' ?
            'bg-red-50 text-red-500 border-red-200' :
            'bg-green-50 text-green-600 border-green-200'}`
            }>

                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" data-test-id="svg-cebb4c80">
                    <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
                  </svg>
                  #{pr.number}
                  <span className="text-[10px] opacity-70 max-w-[220px] truncate">{pr.title}</span>
                </a>
          )}
            </div>
        }

          {/* Stats summary */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400">{detail.files.length} file{detail.files.length !== 1 ? 's' : ''} changed</span>
            <span className="text-green-600 font-medium">+{detail.additions.toLocaleString()}</span>
            <span className="text-red-500 font-medium">&minus;{detail.deletions.toLocaleString()}</span>
          </div>

          {/* File changes with diffs */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {detail.files.map((file) =>
          <FileChangeRow key={file.filename} file={file} />
          )}
          </div>
        </div>
      }
    </div>);

}

// ── File change row with collapsible diff ──────────────────────────

interface FileChangeRowProps {
  file: {filename: string;status: string;additions: number;deletions: number;patch?: string;};
}

function FileChangeRow({ file }: FileChangeRowProps) {
  const [showPatch, setShowPatch] = useState(false);

  const statusColors: Record<string, string> = {
    added: 'bg-green-50 text-green-600 border-green-200',
    removed: 'bg-red-50 text-red-500 border-red-200',
    modified: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    renamed: 'bg-blue-50 text-blue-500 border-blue-200'
  };
  const statusClass = statusColors[file.status] ?? 'bg-slate-50 text-slate-500 border-slate-200';

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 text-[12px] ${file.patch ? 'cursor-pointer hover:bg-slate-50' : ''}`}
        onClick={() => file.patch && setShowPatch((p) => !p)}>

        {file.patch &&
        <span className="text-slate-400 text-[10px] shrink-0">{showPatch ? '▼' : '▶'}</span>
        }
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${statusClass}`}>
          {file.status}
        </span>
        <span className="font-mono text-slate-600 truncate flex-1">{file.filename}</span>
        <span className="text-green-600 font-mono text-[11px] shrink-0">+{file.additions}</span>
        <span className="text-red-500 font-mono text-[11px] shrink-0">&minus;{file.deletions}</span>
      </div>

      {showPatch && file.patch &&
      <div className="bg-slate-50 overflow-x-auto border-t border-slate-100">
          <pre className="text-[11px] leading-[1.6] font-mono p-0">
            {file.patch.split('\n').map((line, i) => {
            let bg = '';
            let textColor = 'text-slate-600';
            if (line.startsWith('+') && !line.startsWith('+++')) {
              bg = 'bg-green-50';
              textColor = 'text-green-700';
            } else if (line.startsWith('-') && !line.startsWith('---')) {
              bg = 'bg-red-50';
              textColor = 'text-red-600';
            } else if (line.startsWith('@@')) {
              bg = 'bg-blue-50';
              textColor = 'text-blue-500';
            }
            return (
              <div key={i} className={`px-3 ${bg} ${textColor} whitespace-pre`}>
                  {line}
                </div>);

          })}
          </pre>
        </div>
      }
    </div>);

}