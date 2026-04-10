import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  GridComponent, TooltipComponent, DataZoomComponent,
  MarkLineComponent, LegendComponent } from
'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { GitHubCommitHistoryEntry, CommitFileStats, CommitPullRequest } from '@/types';
import { fetchBulkCommitFileStats, fetchBulkCommitPulls, GITHUB_BASE_URL } from '@/api/github';
import { hashColor } from '@/utils/colors';
import { AvatarImg } from '@/components/AvatarImg';

echarts.use([
BarChart, GridComponent, TooltipComponent,
DataZoomComponent, MarkLineComponent, LegendComponent, CanvasRenderer]
);

interface TimeTravelScrubberProps {
  owner: string;
  repo: string;
  filePath: string;
  commits: GitHubCommitHistoryEntry[];
  autoLoad?: boolean;
  bare?: boolean;
}

interface CumulativeSnapshot {
  commitIdx: number;
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  netLines: number;
  contributors: Map<string, {login: string;name: string;avatarUrl: string;commits: number;color: string;}>;
  currentCommit: CommitFileStats;
}

export function TimeTravelScrubber({ owner, repo, filePath, commits, autoLoad, bare }: TimeTravelScrubberProps) {
  const [stats, setStats] = useState<CommitFileStats[] | null>(null);
  const [prMap, setPrMap] = useState<Record<string, CommitPullRequest[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sliderIdx, setSliderIdx] = useState(0);
  const autoLoaded = useRef(false);

  // Auto-load when prop is set
  useEffect(() => {
    if (autoLoad && !autoLoaded.current && !stats && !loading) {
      autoLoaded.current = true;
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  function loadStats() {
    setLoading(true);
    setError(false);
    const statsP = fetchBulkCommitFileStats(owner, repo, commits, filePath);
    const prsP = fetchBulkCommitPulls(owner, repo, commits.map((c) => c.fullSha));
    Promise.all([statsP, prsP]).
    then(([data, prs]) => {
      setStats(data);
      setPrMap(prs);
      setSliderIdx(data.length - 1);
      setLoading(false);
    }).
    catch(() => {
      setError(true);
      setLoading(false);
    });
  }

  const snapshot: CumulativeSnapshot | null = useMemo(() => {
    if (!stats || stats.length === 0) return null;
    const idx = Math.min(sliderIdx, stats.length - 1);
    let totalAdd = 0;
    let totalDel = 0;
    const contribs = new Map<string, {login: string;name: string;avatarUrl: string;commits: number;color: string;}>();

    for (let i = 0; i <= idx; i++) {
      const s = stats[i];
      totalAdd += s.additions;
      totalDel += s.deletions;
      const key = s.authorLogin || s.author;
      const existing = contribs.get(key);
      if (existing) {
        existing.commits++;
      } else {
        const commitEntry = commits.find((c) => c.sha === s.sha || c.fullSha.startsWith(s.sha));
        contribs.set(key, {
          login: s.authorLogin,
          name: s.author,
          avatarUrl: commitEntry?.authorAvatarUrl ?? '',
          commits: 1,
          color: hashColor(key)
        });
      }
    }

    return {
      commitIdx: idx,
      totalCommits: idx + 1,
      totalAdditions: totalAdd,
      totalDeletions: totalDel,
      netLines: totalAdd - totalDel,
      contributors: contribs,
      currentCommit: stats[idx]
    };
  }, [stats, sliderIdx, commits]);

  return (
    <div className={bare ? '' : 'bg-white rounded-xl border border-slate-200 p-4 shadow-sm'}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          Time Travel &middot; Cumulative File Scrubber
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
          Building time travel data ({commits.length} commits)...
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
          Click &ldquo;Generate Report&rdquo; to scrub through the file&apos;s cumulative history
        </div>
      }

      {stats && stats.length > 0 && snapshot &&
      <TimeTravelView
        stats={stats}
        snapshot={snapshot}
        sliderIdx={sliderIdx}
        onSliderChange={setSliderIdx}
        commits={commits}
        prMap={prMap} />

      }

      {stats && stats.length === 0 &&
      <div className="text-[12px] text-slate-400 py-4 text-center">No file-level stats available</div>
      }
    </div>);

}

// ── Internal view ──────────────────────────────────────────────────

interface TimeTravelViewProps {
  stats: CommitFileStats[];
  snapshot: CumulativeSnapshot;
  sliderIdx: number;
  onSliderChange: (idx: number) => void;
  commits: GitHubCommitHistoryEntry[];
  prMap: Record<string, CommitPullRequest[]>;
}

function TimeTravelView({ stats, snapshot, sliderIdx, onSliderChange, commits, prMap }: TimeTravelViewProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const currentDate = snapshot.currentCommit.date ?
  new Date(snapshot.currentCommit.date) :
  null;

  const matchingCommit = commits.find(
    (c) => c.sha === snapshot.currentCommit.sha || c.fullSha.startsWith(snapshot.currentCommit.sha)
  );

  const contribArray = [...snapshot.contributors.values()].sort((a, b) => b.commits - a.commits);

  // Build date labels for the x-axis
  const dateLabels = stats.map((s) => {
    const d = s.date ? new Date(s.date) : null;
    return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '';
  });

  const buildOption = useCallback((selIdx: number): echarts.EChartsCoreOption => {
    // Color bars: selected and before = vivid, after = muted
    const addColors = stats.map((_, i) => i <= selIdx ? '#4ade80' : '#e2e8f0');
    const delColors = stats.map((_, i) => i <= selIdx ? '#f87171' : '#e2e8f0');

    return {
      legend: {
        data: ['Additions', 'Deletions'],
        top: 0,
        left: 'center',
        textStyle: { fontSize: 10, color: '#94a3b8' },
        itemWidth: 12,
        itemHeight: 10
      },
      grid: { left: 45, right: 15, top: 28, bottom: 55, containLabel: false },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: {dataIndex?: number;value?: number;seriesName?: string;}[]) => {
          if (!params || !params[0]) return '';
          const idx = params[0].dataIndex ?? 0;
          const s = stats[idx];
          const d = s.date ? new Date(s.date) : null;
          const dateStr = d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
          return `<div style="font-size:11px">
            <div style="font-weight:600;margin-bottom:4px">${dateStr}</div>
            <div style="color:#4ade80">+${s.additions} lines added</div>
            <div style="color:#f87171">&minus;${s.deletions} lines deleted</div>
            <div style="color:#94a3b8;margin-top:4px;font-family:monospace">${s.sha} &middot; ${s.authorLogin || s.author}</div>
            <div style="color:#6366f1;margin-top:2px;font-size:10px">Click to scrub to this commit</div>
          </div>`;
        }
      },
      xAxis: {
        type: 'category',
        data: dateLabels,
        axisLabel: {
          fontSize: 9,
          color: '#94a3b8',
          rotate: 45,
          interval: Math.max(0, Math.floor(stats.length / 8) - 1)
        },
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'value',
        name: 'Lines',
        nameTextStyle: { fontSize: 9, color: '#94a3b8' },
        axisLabel: { fontSize: 9, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLine: { show: false }
      },
      dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 14,
        bottom: 2,
        borderColor: '#e2e8f0',
        fillerColor: 'rgba(99,102,241,0.08)',
        handleStyle: { color: '#6366f1', borderColor: '#6366f1' },
        textStyle: { color: '#94a3b8', fontSize: 9 },
        filterMode: 'none'
      }],

      series: [
      {
        name: 'Additions',
        type: 'bar',
        stack: 'churn',
        color: '#4ade80',
        data: stats.map((s, i) => ({
          value: s.additions,
          itemStyle: { color: addColors[i] }
        })),
        barMaxWidth: 30,
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#6366f1', width: 2, type: 'solid' },
          data: [{ xAxis: selIdx }],
          label: { show: false }
        }
      },
      {
        name: 'Deletions',
        type: 'bar',
        stack: 'churn',
        color: '#f87171',
        data: stats.map((s, i) => ({
          value: -s.deletions,
          itemStyle: { color: delColors[i] }
        })),
        barMaxWidth: 30
      }]

    };
  }, [stats, dateLabels]);

  // Init chart
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    chart.setOption(buildOption(sliderIdx));

    chart.on('click', (params: {dataIndex?: number;}) => {
      if (params.dataIndex !== undefined) {
        onSliderChange(params.dataIndex);
      }
    });

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(chartRef.current);

    return () => {
      ro.disconnect();
      chart.dispose();
      chartInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  // Update chart when selection changes
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(buildOption(sliderIdx));
    }
  }, [sliderIdx, buildOption]);

  return (
    <div>
      {/* ── ECharts scrubber chart ── */}
      <div ref={chartRef} style={{ width: '100%', height: 220 }} />

      {/* Slider (below chart for fine control) */}
      <div className="px-1 mb-3">
        <input
          type="range"
          min={0}
          max={stats.length - 1}
          value={sliderIdx}
          onChange={(e) => onSliderChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500" />

        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>
            {stats[0]?.date ?
            new Date(stats[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
            ''}
          </span>
          <span className="text-indigo-500 font-medium">
            {currentDate ?
            currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
            ''}
            {' '}&middot; Commit {sliderIdx + 1} of {stats.length}
          </span>
          <span>
            {stats[stats.length - 1]?.date ?
            new Date(stats[stats.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
            ''}
          </span>
        </div>
      </div>

      {/* ── Dynamic cumulative metadata panel ── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Cumulative</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold text-slate-700 tabular-nums leading-none">
              {snapshot.netLines > 0 ? '+' : ''}{snapshot.netLines.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">net lines</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px]">
            <span className="text-green-600 font-medium">+{snapshot.totalAdditions.toLocaleString()}</span>
            <span className="text-red-500 font-medium">&minus;{snapshot.totalDeletions.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Progress</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold text-slate-700 tabular-nums leading-none">
              {snapshot.totalCommits}
            </span>
            <span className="text-[11px] text-slate-400">of {stats.length} commits</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-150"
                style={{ width: `${snapshot.totalCommits / stats.length * 100}%` }} />

            </div>
          </div>
        </div>
      </div>

      {/* ── Contributors up to this point ── */}
      <div className="mb-4">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
          Contributors at this point ({contribArray.length})
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {contribArray.map((c) =>
          <div key={c.login || c.name} className="group relative">
              <a
              href={c.login ? `${GITHUB_BASE_URL}/${c.login}` : undefined}
              target="_blank"
              rel="noopener noreferrer">

                <AvatarImg
                src={c.avatarUrl}
                name={c.name}
                size={28}
                className="border-2 transition-colors"
                borderColor={c.color} />

              </a>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {c.login ? `@${c.login}` : c.name} &middot; {c.commits}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Current commit detail ── */}
      <div className="bg-slate-50 rounded-lg px-3.5 py-3 border border-slate-100">
        <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400 uppercase tracking-wider">
          <span>Current Commit</span>
          {matchingCommit?.verified &&
          <span className="normal-case text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200">
              Verified
            </span>
          }
        </div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="text-[13px] text-slate-700 font-medium leading-snug flex-1">
            {matchingCommit?.message ?? snapshot.currentCommit.sha}
          </div>
          <span className="font-mono text-[12px] text-indigo-500 shrink-0">{snapshot.currentCommit.sha}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-slate-400 flex-wrap">
          <AvatarImg
            src={matchingCommit?.authorAvatarUrl ?? ''}
            name={snapshot.currentCommit.authorLogin || snapshot.currentCommit.author}
            size={16} />

          {snapshot.currentCommit.authorLogin ?
          <a
            href={`${GITHUB_BASE_URL}/${snapshot.currentCommit.authorLogin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:underline">

              @{snapshot.currentCommit.authorLogin}
            </a> :

          <span>{snapshot.currentCommit.author}</span>
          }
          <span className="text-slate-300">&middot;</span>
          <span>
            {currentDate ?
            currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) :
            '\u2014'}
          </span>
          <span className="text-slate-300">&middot;</span>
          <span className="text-green-600 font-medium">+{snapshot.currentCommit.additions}</span>
          <span className="text-red-500 font-medium">&minus;{snapshot.currentCommit.deletions}</span>
        </div>
        {/* Associated PRs */}
        {prMap[snapshot.currentCommit.sha] && prMap[snapshot.currentCommit.sha].length > 0 &&
        <div className="mt-2 flex flex-wrap gap-1.5">
            {prMap[snapshot.currentCommit.sha].map((pr) =>
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

                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" data-test-id="svg-98ef9946">
                  <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
                </svg>
                #{pr.number}
                <span className="text-[10px] opacity-70 max-w-[180px] truncate">{pr.title}</span>
              </a>
          )}
          </div>
        }
      </div>
    </div>);

}