import { useState } from 'react';
import type { GitHubCommitHistoryEntry, CommitFileStats } from '@/types';
import { fetchBulkCommitFileStats } from '@/api/github';

interface LocTrendChartProps {
  owner: string;
  repo: string;
  filePath: string;
  commits: GitHubCommitHistoryEntry[];
}

export function LocTrendChart({ owner, repo, filePath, commits }: LocTrendChartProps) {
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
          Line Changes Over Time
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
          Calculating line trends ({commits.length} commits)...
        </div>
      }

      {error &&
      <div className="text-[12px] text-red-400 py-4 text-center">
          Failed to fetch stats.
          <button onClick={loadStats} className="ml-2 text-indigo-500 hover:underline">Retry</button>
        </div>
      }

      {!stats && !loading && !error &&
      <div className="text-[12px] text-slate-300 py-4 text-center">
          Click &ldquo;Generate Report&rdquo; to see cumulative line change trends
        </div>
      }

      {stats && stats.length > 0 && <TrendLineChart stats={stats} />}
      {stats && stats.length === 0 &&
      <div className="text-[12px] text-slate-400 py-4 text-center">No stats available</div>
      }
    </div>);

}

function TrendLineChart({ stats }: {stats: CommitFileStats[];}) {
  const chartW = 600;
  const chartH = 140;
  const padL = 40;
  const padR = 10;
  const padT = 10;
  const padB = 24;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  // Build cumulative LOC (approximate: sum of net changes)
  const points: {x: number;loc: number;date: string;sha: string;}[] = [];
  let cumulative = 0;
  for (let i = 0; i < stats.length; i++) {
    cumulative += stats[i].additions - stats[i].deletions;
    points.push({ x: i, loc: cumulative, date: stats[i].date, sha: stats[i].sha });
  }

  const minLoc = Math.min(0, ...points.map((p) => p.loc));
  const maxLoc = Math.max(1, ...points.map((p) => p.loc));
  const locRange = maxLoc - minLoc || 1;

  function toX(idx: number): number {
    return padL + idx / Math.max(1, points.length - 1) * innerW;
  }
  function toY(loc: number): number {
    return padT + innerH - (loc - minLoc) / locRange * innerH;
  }

  // Build path
  const pathD = points.
  map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.x)} ${toY(p.loc)}`).
  join(' ');

  // Build area
  const areaD = pathD +
  ` L ${toX(points.length - 1)} ${toY(0) > padT + innerH ? padT + innerH : toY(0)}` +
  ` L ${toX(0)} ${toY(0) > padT + innerH ? padT + innerH : toY(0)} Z`;

  // Y-axis ticks
  const yTicks = [minLoc, Math.round((minLoc + maxLoc) / 2), maxLoc];

  return (
    <div>
      <div className="overflow-x-auto">
        <svg width={chartW} height={chartH} className="block" data-test-id="svg-3ee96c88">
          {/* Grid lines */}
          {yTicks.map((t) =>
          <g key={t}>
              <line x1={padL} y1={toY(t)} x2={chartW - padR} y2={toY(t)} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 4} y={toY(t) + 3} fontSize="9" fill="#94a3b8" textAnchor="end" fontFamily="monospace">
                {t > 0 ? `+${t}` : t}
              </text>
            </g>
          )}

          {/* Zero line */}
          {minLoc < 0 &&
          <line x1={padL} y1={toY(0)} x2={chartW - padR} y2={toY(0)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 2" />
          }

          {/* Area fill */}
          <path d={areaD} fill="url(#locGradient)" opacity="0.3" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />

          {/* Dots */}
          {points.map((p, i) =>
          <circle key={i} cx={toX(p.x)} cy={toY(p.loc)} r={3} fill="#6366f1" stroke="white" strokeWidth="1.5">
              <title>{p.sha}: net {p.loc > 0 ? `+${p.loc}` : p.loc} lines</title>
            </circle>
          )}

          {/* Date labels (first, middle, last) */}
          {[0, Math.floor(points.length / 2), points.length - 1].
          filter((v, i, a) => a.indexOf(v) === i).
          map((idx) =>
          <text key={idx} x={toX(idx)} y={chartH - 4} fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="system-ui">
                {points[idx]?.date ? new Date(points[idx].date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : ''}
              </text>
          )}

          {/* Gradient def */}
          <defs>
            <linearGradient id="locGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="text-[10px] text-slate-400 mt-1">
        Cumulative net line changes (additions &minus; deletions) over {points.length} commit{points.length !== 1 ? 's' : ''}
      </div>
    </div>);

}