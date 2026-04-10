import type { TreeNode, GitHubCommitInfo, GitHubRepoDetails } from '@/types';
import { FILE_MODES } from '@/types';
import { GitBranch, History, Lightbulb, ShieldAlert } from '@/components/icons';
import type { VulnerabilityAlerts } from '@/api/github';
import { LANG_COLORS } from '@/utils/colors';
import { formatSize } from '@/utils/format';
import { GITHUB_BASE_URL } from '@/api/github';
import { AvatarImg } from '@/components/AvatarImg';

interface MetaRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function MetaRow({ label, value, mono }: MetaRowProps) {
  return (
    <div className="flex justify-between items-start mb-2.5 gap-2">
      <span className="text-[12px] text-slate-400 shrink-0">{label}</span>
      <span className={`text-[12px] text-slate-700 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

interface MetaPanelProps {
  item: TreeNode;
  name: string;
  repoDetails?: GitHubRepoDetails | null;
  commitInfo?: GitHubCommitInfo | null;
  commitLoading?: boolean;
  contentLoading?: boolean;
  vulnAlerts?: VulnerabilityAlerts | null;
  onViewContent?: () => void;
  onViewHistory?: () => void;
  onViewIntelligence?: () => void;
  onClose: () => void;
}

export function MetaPanel({ item, name, repoDetails, commitInfo, commitLoading, contentLoading, vulnAlerts, onViewContent, onViewHistory, onViewIntelligence, onClose }: MetaPanelProps) {
  const isFile = item.type === 'file';
  const lang = isFile ? item.lang : 'Unknown';
  const color = LANG_COLORS[lang] ?? '#94a3b8';
  const mode = item.mode ?? (isFile ? '100644' : '040000');
  const modeInfo = FILE_MODES[mode];

  // Use lazy commit info if available, fallback to node data
  const modified = commitInfo?.date
    ? new Date(commitInfo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : (isFile ? item.modified : item.date) ?? '\u2014';
  const author = commitInfo?.author ?? (isFile ? item.author : item.author) ?? '\u2014';
  const authorLogin = commitInfo?.authorLogin ?? '';
  const commitHash = commitInfo?.sha ?? (isFile ? item.commit : item.hash) ?? '\u2014';
  const commitMsg = commitInfo?.message ?? (isFile ? item.message : item.lastCommit);

  const authorProfileUrl = authorLogin ? `${GITHUB_BASE_URL}/${authorLogin}` : null;

  return (
    <div className="w-[300px] min-w-[300px] h-full bg-white border-l border-slate-200 flex flex-col overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex justify-between items-start shrink-0">
        <div>
          <div className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider mb-1">
            {isFile ? 'File Intelligence' : 'Folder Info'}
          </div>
          <div className="text-[13px] text-slate-800 font-semibold break-all">{name}</div>
          {isFile && (
            <div className="flex items-center gap-1 mt-1.5">
              <button
                onClick={onViewHistory}
                title="View file history"
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-500 transition-colors"
              >
                <History size={14} />
              </button>
              <button
                onClick={onViewIntelligence}
                title="File intelligence"
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors"
              >
                <Lightbulb size={14} />
              </button>
              {vulnAlerts && (
                <span
                  title={vulnAlerts.enabled ? 'Vulnerability alerts enabled' : 'Vulnerability alerts disabled'}
                  className={`p-1 rounded ${
                    vulnAlerts.enabled
                      ? 'text-red-500 bg-red-50'
                      : 'text-slate-300'
                  }`}
                >
                  <ShieldAlert size={14} />
                </span>
              )}
            </div>
          )}
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-lg leading-none px-1 -mt-0.5 transition-colors">
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4 overflow-y-auto flex-1">
        {/* ── Core Object ─────────────────── */}
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2.5">Core Object</div>
        <MetaRow label="Name" value={name} mono />
        {isFile && (
          <MetaRow
            label="Type"
            value={
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                {lang}
              </span>
            }
          />
        )}
        {isFile && item.mimeType && (
          <MetaRow label="MIME" value={item.mimeType} mono />
        )}
        {isFile && <MetaRow label="Size" value={formatSize(item.size)} mono />}
        {isFile && <MetaRow label="Lines of Code (LOC)" value={item.loc ? `${item.loc.toLocaleString()} lines` : 'N/A'} mono />}
        {!isFile && item.items && (
          <MetaRow label="Contents" value={`${Object.keys(item.items).length} items`} mono />
        )}

        {/* File Mode */}
        <MetaRow
          label="Mode"
          value={
            <span className="flex items-center gap-1.5">
              <span className="font-mono">{mode}</span>
              {modeInfo && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  mode === '100755' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  mode === '120000' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                  mode === '160000' ? 'bg-red-50 text-red-600 border border-red-200' :
                  'bg-slate-50 text-slate-500 border border-slate-200'
                }`}>
                  {modeInfo.label}
                </span>
              )}
            </span>
          }
        />
        {modeInfo && (
          <div className="text-[11px] text-slate-400 mb-3 -mt-1">{modeInfo.description}</div>
        )}
        <MetaRow label="SHA" value={<span className="font-mono text-indigo-500">{isFile ? item.commit : (item.hash ?? '\u2014')}</span>} />

        <div className="h-px bg-slate-100 my-3" />

        {/* ── Authorship ─────────────────── */}
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2.5">Authorship</div>
        {commitLoading ? (
          <div className="text-[12px] text-slate-300 py-2">Loading commit info...</div>
        ) : (
          <>
            <MetaRow
              label="Modified"
              value={<span>{modified}</span>}
            />
            <MetaRow
              label="Author"
              value={
                <span className="flex items-center gap-1.5">
                  <AvatarImg src={commitInfo?.authorAvatarUrl ?? ''} name={authorLogin || author} size={16} />
                  {authorProfileUrl ? (
                    <a
                      href={authorProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 hover:underline"
                    >
                      @{authorLogin || author}
                    </a>
                  ) : (
                    <span>{author}</span>
                  )}
                </span>
              }
            />
            <MetaRow
              label="Commit"
              value={<span className="font-mono text-indigo-500 text-[12px]">{commitHash}</span>}
            />

            {/* Signature Verification */}
            {commitInfo && (
              <MetaRow
                label="Signature"
                value={
                  <span className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                    commitInfo.verified
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                  }`}>
                    {commitInfo.verified ? 'Verified' : 'Unverified'}
                    {commitInfo.verifiedReason !== 'unsigned' && commitInfo.verifiedReason !== 'valid' && (
                      <span className="text-[10px] text-slate-400 ml-1">({commitInfo.verifiedReason})</span>
                    )}
                  </span>
                }
              />
            )}

            {commitMsg && commitMsg !== '\u2014' && (
              <div className="mt-2 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                <div className="text-[11px] text-slate-400 mb-1">Message</div>
                <div className="text-[12.5px] text-slate-600 leading-relaxed">&ldquo;{commitMsg}&rdquo;</div>
              </div>
            )}
          </>
        )}

        <div className="h-px bg-slate-100 my-3" />

        {/* ── Branch / Linguist ─────────── */}
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2.5">Context</div>
        <MetaRow
          label="Branch"
          value={
            <span className="flex items-center gap-1 text-indigo-500">
              <GitBranch size={13} /> {repoDetails?.default_branch ?? 'main'}
            </span>
          }
        />
        {isFile && item.mimeType && (
          <MetaRow
            label="Detectable"
            value={
              <span className={`text-[11px] px-1.5 py-0.5 rounded border ${
                item.mimeType.startsWith('text/') || item.mimeType === 'application/json'
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                {item.mimeType.startsWith('text/') || item.mimeType === 'application/json' ? 'Yes' : 'No'}
              </span>
            }
          />
        )}

        {/* ── Actions ─────────────────── */}
        {isFile && (
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={onViewContent}
              disabled={contentLoading}
              className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-indigo-600 text-[12.5px] text-left hover:bg-indigo-100/70 transition-colors flex items-center justify-between"
            >
              <span>{contentLoading ? 'Loading...' : 'View Content'}</span>
              <span className="text-[11px] text-indigo-400 font-mono">{formatSize(item.size)}</span>
            </button>
            <button className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 text-[12.5px] text-left hover:bg-slate-50 transition-colors shadow-sm">
              ↓ Download raw file
            </button>
            <button className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 text-[12.5px] text-left hover:bg-slate-50 transition-colors shadow-sm">
              ⎘ Copy file path
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
