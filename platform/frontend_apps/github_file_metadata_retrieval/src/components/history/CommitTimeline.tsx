import { useRef, useEffect, useState, useCallback } from 'react';
import * as echarts from 'echarts/core';
import { ScatterChart, BarChart } from 'echarts/charts';
import {
  GridComponent, TooltipComponent, DataZoomComponent,
  MarkLineComponent, LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { GitHubCommitHistoryEntry } from '@/types';
import { hashColor } from '@/utils/colors';
import { GITHUB_BASE_URL } from '@/api/github';
import { AvatarImg } from '@/components/AvatarImg';

echarts.use([
  ScatterChart, BarChart, GridComponent, TooltipComponent,
  DataZoomComponent, MarkLineComponent, LegendComponent, CanvasRenderer,
]);


interface CommitTimelineProps {
  commits: GitHubCommitHistoryEntry[];
}

export function CommitTimeline({ commits }: CommitTimelineProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Oldest-first
  const ordered = [...commits].reverse();

  // Group by author for colored series
  const authorMap = new Map<string, number[]>();
  ordered.forEach((c, i) => {
    const key = c.authorLogin || c.author;
    if (!authorMap.has(key)) authorMap.set(key, []);
    authorMap.get(key)!.push(i);
  });

  const buildOption = useCallback((selIdx: number) => {
    const series: echarts.EChartsCoreOption[] = [];

    // One scatter series per author
    for (const [authorKey, indices] of authorMap) {
      const color = hashColor(authorKey);
      series.push({
        type: 'scatter',
        name: authorKey,
        symbolSize: (_val: number[], params: { dataIndex: number }) => {
          const globalIdx = indices[params.dataIndex];
          return globalIdx === selIdx ? 16 : 10;
        },
        data: indices.map(i => {
          const c = ordered[i];
          const d = new Date(c.date);
          return [d.getTime(), 0, i, c.message, authorKey, c.sha];
        }),
        itemStyle: { color, borderColor: '#fff', borderWidth: 1.5 },
        emphasis: { scale: 1.4 },
        z: 2,
      });
    }

    // Mark line for selected commit
    const selDate = new Date(ordered[selIdx]?.date ?? 0).getTime();
    series.push({
      type: 'scatter',
      data: [],
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#6366f1', width: 2, type: 'solid' },
        data: [{ xAxis: selDate }],
        label: { show: false },
      },
      z: 1,
    });

    return {
      grid: { left: 10, right: 10, top: 10, bottom: 50, containLabel: false },
      tooltip: {
        trigger: 'item',
        formatter: (p: { value?: unknown[] }) => {
          if (!p.value) return '';
          const [ts, , , msg, author, sha] = p.value as [number, number, number, string, string, string];
          const d = new Date(ts);
          return `<div style="max-width:280px">
            <div style="font-weight:600;margin-bottom:4px;white-space:normal;word-break:break-word">${msg}</div>
            <div style="color:#6366f1;font-family:monospace;font-size:11px">${sha}</div>
            <div style="color:#94a3b8;font-size:11px;margin-top:2px">${author} &middot; ${d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>`;
        },
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        show: false,
        min: -1,
        max: 1,
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'none',
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          height: 18,
          bottom: 4,
          borderColor: '#e2e8f0',
          fillerColor: 'rgba(99,102,241,0.08)',
          handleStyle: { color: '#6366f1', borderColor: '#6366f1' },
          textStyle: { color: '#94a3b8', fontSize: 9 },
          filterMode: 'none',
        },
      ],
      series,
    };
  }, [ordered, authorMap]);

  // Init chart
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    chart.setOption(buildOption(selectedIdx));

    chart.on('click', (params: unknown) => {
      const p = params as { value?: unknown[] };
      if (p.value && Array.isArray(p.value) && p.value.length >= 3) {
        const idx = p.value[2] as number;
        setSelectedIdx(idx);
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
  }, [commits]);

  // Update chart when selection changes
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(buildOption(selectedIdx));
    }
  }, [selectedIdx, buildOption]);

  const selected = ordered[selectedIdx];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
        Commit Timeline &middot; Click to inspect
      </div>

      {/* ECharts container */}
      <div ref={chartRef} style={{ width: '100%', height: 160 }} />

      {/* Selected commit detail */}
      {selected && (
        <div className="bg-slate-50 rounded-lg px-3.5 py-3 border border-slate-100 mt-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="text-[13px] text-slate-700 font-medium leading-snug flex-1">{selected.message}</div>
            <span className="font-mono text-[12px] text-indigo-500 shrink-0">{selected.sha}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-400">
            <AvatarImg src={selected.authorAvatarUrl} name={selected.authorLogin || selected.author} size={16} />
            {selected.authorLogin ? (
              <a
                href={`${GITHUB_BASE_URL}/${selected.authorLogin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:underline"
              >
                @{selected.authorLogin}
              </a>
            ) : (
              <span>{selected.author}</span>
            )}
            <span className="text-slate-300">&middot;</span>
            <span>
              {selected.date
                ? new Date(selected.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '\u2014'}
            </span>
            {selected.verified && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200">
                Verified
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
