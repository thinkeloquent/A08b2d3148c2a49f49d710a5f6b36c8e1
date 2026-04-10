import type { TreeNode } from '@/types';
import { FileIcon } from '@/components/icons';
import { formatSize } from '@/utils/format';

export type SortPreset = 'default' | 'largest' | 'smallest' | 'name-asc' | 'name-desc' | 'oldest' | 'newest';

interface FileTableProps {
  entries: [string, TreeNode][];
  selectedName: string | null;
  onRowClick: (name: string, node: TreeNode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortPreset: SortPreset;
  onSortPreset: (p: SortPreset) => void;
  commitDates?: Record<string, string>;
  datesLoading?: boolean;
}

const PRESETS: {value: SortPreset;label: string;}[] = [
{ value: 'default', label: 'Default' },
{ value: 'largest', label: 'Largest' },
{ value: 'smallest', label: 'Smallest' },
{ value: 'oldest', label: 'Oldest' },
{ value: 'newest', label: 'Newest' },
{ value: 'name-asc', label: 'A \u2192 Z' },
{ value: 'name-desc', label: 'Z \u2192 A' }];


function formatDate(iso: string): string {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function FileTable({ entries, selectedName, onRowClick, searchQuery, onSearchChange, sortPreset, onSortPreset, commitDates, datesLoading }: FileTableProps) {
  return (
    <div className="flex-1 px-5 pb-5">
      {/* Search + filter bar */}
      <div className="mt-4 mb-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder-slate-300" />

          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-test-id="svg-2895340d">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          {searchQuery &&
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-sm">

              &times;
            </button>
          }
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {PRESETS.map((p) =>
          <button
            key={p.value}
            onClick={() => onSortPreset(p.value)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors ${
            sortPreset === p.value ?
            'bg-indigo-50 border-indigo-200 text-indigo-600' :
            'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'}`
            }>

              {p.label}
            </button>
          )}
          {datesLoading && (sortPreset === 'oldest' || sortPreset === 'newest') &&
          <span className="text-[11px] text-slate-400 ml-1">Fetching dates...</span>
          }
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {['Name', 'Type', 'Mode', 'Size', 'Modified', 'SHA'].map((h) =>
              <th
                key={h}
                className="px-4 py-2.5 text-left text-[11px] text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">

                  {h}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, node]) => {
              const isSelected = selectedName === name;
              const isDir = node.type === 'dir';
              const lang = isDir ? 'Folder' : node.lang;
              const size = isDir ? '\u2014' : formatSize(node.size);
              const sha = isDir ? node.hash ?? '\u2014' : node.commit;
              const mode = node.mode ?? (isDir ? '040000' : '100644');
              const modeLabel = mode === '100755' ? 'exec' : mode === '120000' ? 'link' : mode === '160000' ? 'sub' : '';

              return (
                <tr
                  key={name}
                  onClick={() => onRowClick(name, node)}
                  className={`border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`
                  }>

                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5 relative">
                      {isSelected &&
                      <span className="absolute -left-4 w-[3px] h-5 bg-indigo-500 rounded-r" />
                      }
                      <FileIcon type={node.type} lang={isDir ? undefined : node.lang} />
                      <span className={`text-[13px] ${isDir ? 'text-indigo-600 font-medium' : 'text-slate-700'}`}>
                        {name}{isDir ? '/' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[12.5px] text-slate-400">
                    {lang}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] text-slate-400 font-mono">{mode}</span>
                    {modeLabel &&
                    <span className={`ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    mode === '100755' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                    mode === '120000' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                    'bg-slate-50 text-slate-500 border border-slate-200'}`
                    }>
                        {modeLabel}
                      </span>
                    }
                  </td>
                  <td className="px-4 py-2.5 text-[12.5px] text-slate-400 font-mono whitespace-nowrap">
                    {size}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-400 whitespace-nowrap">
                    {commitDates?.[name] ? formatDate(commitDates[name]) : '\u2014'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[12px] text-indigo-500 font-mono">{sha}</span>
                  </td>
                </tr>);

            })}
            {entries.length === 0 &&
            <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-slate-400">
                  {searchQuery ? 'No files match your search' : 'Empty directory'}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>);

}