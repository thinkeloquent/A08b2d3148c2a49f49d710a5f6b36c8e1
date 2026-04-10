import type { GitHubCommitHistoryEntry } from '@/types';

interface CalendarHeatmapProps {
  commits: GitHubCommitHistoryEntry[];
}

function getDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CELL = 12;
const GAP = 2;
const LABEL_W = 28;

export function CalendarHeatmap({ commits }: CalendarHeatmapProps) {
  // Count commits per day & find date range
  const counts = new Map<string, number>();
  let minTs = Infinity;
  let maxTs = -Infinity;

  for (const c of commits) {
    const d = new Date(c.date);
    if (isNaN(d.getTime())) continue;
    const key = getDateKey(d);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    const ts = d.getTime();
    if (ts < minTs) minTs = ts;
    if (ts > maxTs) maxTs = ts;
  }

  if (counts.size === 0) return null;

  const maxCount = Math.max(...counts.values());

  function getColor(count: number): string {
    if (count === 0) return '#ebedf0';
    const intensity = count / maxCount;
    if (intensity <= 0.25) return '#9be9a8';
    if (intensity <= 0.5) return '#40c463';
    if (intensity <= 0.75) return '#30a14e';
    return '#216e39';
  }

  // Build grid from first commit date to last commit date (+ padding to complete weeks)
  const earliest = new Date(minTs);
  const latest = new Date(maxTs);

  // Start on the Sunday of the week containing the earliest commit
  const startDate = new Date(earliest.getFullYear(), earliest.getMonth(), earliest.getDate());
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // End on the Saturday of the week containing the latest commit
  const endDate = new Date(latest.getFullYear(), latest.getMonth(), latest.getDate());
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const weeks: {date: Date;count: number;}[][] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const week: {date: Date;count: number;}[] = [];
    for (let d = 0; d < 7; d++) {
      if (cursor > endDate) break;
      const key = getDateKey(cursor);
      week.push({ date: new Date(cursor), count: counts.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const svgW = LABEL_W + weeks.length * (CELL + GAP);
  const svgH = 20 + 7 * (CELL + GAP);

  // Month labels
  const monthLabels: {label: string;x: number;}[] = [];
  let lastMonthYear = '';
  weeks.forEach((week, wi) => {
    const first = week[0];
    if (first) {
      const key = `${first.date.getFullYear()}-${first.date.getMonth()}`;
      if (key !== lastMonthYear) {
        const m = first.date.getMonth();
        // Show year on January or first label
        const label = m === 0 || monthLabels.length === 0 ?
        `${MONTHS[m]} '${String(first.date.getFullYear()).slice(2)}` :
        MONTHS[m];
        monthLabels.push({ label, x: LABEL_W + wi * (CELL + GAP) });
        lastMonthYear = key;
      }
    }
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
        Activity Heatmap
      </div>
      <div className="overflow-x-auto">
        <svg width={svgW} height={svgH} className="block" data-test-id="svg-411d50e0">
          {/* Month labels */}
          {monthLabels.map((m, i) =>
          <text key={i} x={m.x} y={10} fontSize="10" fill="#94a3b8" fontFamily="system-ui">
              {m.label}
            </text>
          )}
          {/* Day labels */}
          {[1, 3, 5].map((d) =>
          <text key={d} x={0} y={20 + d * (CELL + GAP) + CELL - 2} fontSize="9" fill="#94a3b8" fontFamily="system-ui">
              {DAYS[d]}
            </text>
          )}
          {/* Cells */}
          {weeks.map((week, wi) =>
          week.map((day, di) =>
          <rect
            key={`${wi}-${di}`}
            x={LABEL_W + wi * (CELL + GAP)}
            y={20 + di * (CELL + GAP)}
            width={CELL}
            height={CELL}
            rx={2}
            fill={getColor(day.count)}
            className="transition-colors">

                <title>
                  {getDateKey(day.date)}: {day.count} commit{day.count !== 1 ? 's' : ''}
                </title>
              </rect>
          )
          )}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
        <span>Less</span>
        {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((c) =>
        <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
        )}
        <span>More</span>
      </div>
    </div>);

}