import { useState } from 'react';
import type { GitHubCommitHistoryEntry, CommitFileStats } from '@/types';
import { fetchBulkCommitFileStats } from '@/api/github';
import { hashColor } from '@/utils/colors';

interface CodeChurnChartProps {
  owner: string;
  repo: string;
  filePath: string;
  commits: GitHubCommitHistoryEntry[];
}

export function CodeChurnChart({ owner, repo, filePath, commits }: CodeChurnChartProps) {
  const [stats, setStats] = useState<CommitFileStats[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  function loadStats() {
    setLoading(true);
    setError(false);
    fetchBulkCommitFileStats(owner, repo, commits, filePath).
    then((data) => {
      setStats(data);
      setLoading(false);
    }).
    catch(() => {
      setError(true);
      setLoading(false);
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          Code Churn &middot; Additions vs Deletions
        </div>
        {!stats && !loading &&
        <button
          onClick={loadStats}
          className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-colors">

            Generate Report
          </button>
        }
      </div>

      {loading &&
      <div className="text-[12px] text-slate-400 py-6 text-center">
          Fetching commit stats ({commits.length} commits)...
        </div>
      }

      {error &&
      <div className="text-[12px] text-red-400 py-4 text-center">
          Failed to fetch commit stats.
          <button onClick={loadStats} className="ml-2 text-indigo-500 hover:underline">Retry</button>
        </div>
      }

      {!stats && !loading && !error &&
      <div className="text-[12px] text-slate-300 py-4 text-center">
          Click &ldquo;Generate Report&rdquo; to analyze additions &amp; deletions per commit
        </div>
      }

      {stats && stats.length > 0 && <ChurnBarChart stats={stats} />}
      {stats && stats.length === 0 &&
      <div className="text-[12px] text-slate-400 py-4 text-center">No file-level stats available</div>
      }
    </div>);

}

function ChurnBarChart({ stats }: {stats: CommitFileStats[];}) {
  const maxVal = Math.max(...stats.map((s) => Math.max(s.additions, s.deletions)), 1);
  const barW = Math.max(20, Math.min(50, 600 / stats.length));
  const chartH = 120;
  const dateRowH = 36;
  const svgW = stats.length * (barW + 4) + 20;

  // Summary
  const totalAdd = stats.reduce((s, c) => s + c.additions, 0);
  const totalDel = stats.reduce((s, c) => s + c.deletions, 0);

  return (
    <div>
      {/* Summary badges */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-600 border border-green-200">
          +{totalAdd.toLocaleString()} added
        </span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-red-50 text-red-500 border border-red-200">
          &minus;{totalDel.toLocaleString()} deleted
        </span>
        <span className="text-[11px] text-slate-400">
          across {stats.length} commit{stats.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg width={svgW} height={chartH + dateRowH} className="block" data-test-id="svg-3533e396">
          {/* Bars */}
          {stats.map((s, i) => {
            const x = i * (barW + 4) + 10;
            const addH = s.additions / maxVal * chartH;
            const delH = s.deletions / maxVal * chartH;
            const color = hashColor(s.authorLogin || s.author);
            const dateObj = s.date ? new Date(s.date) : null;
            const dateLabel = dateObj ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
            const yearLabel = dateObj ? dateObj.getFullYear().toString() : '';
            const fullDate = dateObj ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
            return (
              <g key={s.sha + i}>
                {/* Additions (green) */}
                <rect
                  x={x}
                  y={chartH - addH}
                  width={barW / 2 - 1}
                  height={addH}
                  rx={1.5}
                  fill="#4ade80"
                  opacity={0.85}>

                  <title>+{s.additions} &middot; {fullDate} ({s.sha})</title>
                </rect>
                {/* Deletions (red) */}
                <rect
                  x={x + barW / 2}
                  y={chartH - delH}
                  width={barW / 2 - 1}
                  height={delH}
                  rx={1.5}
                  fill="#f87171"
                  opacity={0.85}>

                  <title>&minus;{s.deletions} &middot; {fullDate} ({s.sha})</title>
                </rect>
                {/* Author color dot */}
                <circle cx={x + barW / 2} cy={chartH + 8} r={3} fill={color} />
                {/* Date label */}
                <text x={x + barW / 2} y={chartH + 20} fontSize="8" fill="#64748b" textAnchor="middle" fontFamily="system-ui">
                  {dateLabel}
                </text>
                <text x={x + barW / 2} y={chartH + 30} fontSize="7" fill="#94a3b8" textAnchor="middle" fontFamily="system-ui">
                  {yearLabel}
                </text>
              </g>);

          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#4ade80]" /> Additions</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f87171]" /> Deletions</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Author</span>
      </div>
    </div>);

}