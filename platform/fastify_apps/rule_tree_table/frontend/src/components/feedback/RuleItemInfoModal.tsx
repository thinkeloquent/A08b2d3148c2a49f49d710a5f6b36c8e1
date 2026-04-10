import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Hash,
  Braces,
  FileText,
  GitBranch,
  GitCommit,
  Tag,
  ExternalLink,
  Variable,
  ScanLine,
  FolderTree,
} from 'lucide-react';
import type { RuleItem, RuleStructural, RuleGroup, RuleFolder, GitMetadata } from '../../types/rule.types';

interface RuleItemInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RuleItem | null;
  git: GitMetadata;
}

/** Extract file path from a source URL (strip host + /blob/branch/ prefix). */
function extractFilePath(url: string | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/blob\/[^/]+\/(.+?)(?:#|$)/);
  return m ? m[1].replace(/#.*$/, '') : null;
}

/** Extract line number from a GitHub source URL fragment (#L46). */
function extractLine(url: string | undefined): number | null {
  if (!url) return null;
  const m = url.match(/#L(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Build a clickable GitHub URL for repo + branch. */
function repoBranchUrl(repoUrl: string, branch: string): string {
  return `${repoUrl.replace(/\/$/, '')}/tree/${branch}`;
}

/** Build a clickable GitHub URL for repo + tag. */
function repoTagUrl(repoUrl: string, tag: string): string {
  return `${repoUrl.replace(/\/$/, '')}/releases/tag/${tag}`;
}

/** Build a clickable GitHub URL for repo + commit. */
function repoCommitUrl(repoUrl: string, sha: string): string {
  return `${repoUrl.replace(/\/$/, '')}/commit/${sha}`;
}

function LinkRow({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-800 hover:underline transition-colors break-all"
    >
      {children}
      <ExternalLink className="w-3 h-3 shrink-0" />
    </a>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm text-slate-700">{children}</div>
      </div>
    </div>
  );
}

export function RuleItemInfoModal({ isOpen, onClose, item, git }: RuleItemInfoModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Resolve data from the item + tree-level git metadata
  const sourceUrl = (item as unknown as Record<string, unknown>).source_url as string | undefined || item.sourceUrl;
  const filePath = extractFilePath(sourceUrl);
  const line = extractLine(sourceUrl);

  // AST context fields — parentScope is available on all types, nodeType/evaluatedVariables on structural
  const isStructural = item.type === 'structural';
  const structural = item as RuleStructural;
  const nodeType = isStructural ? structural.nodeType : null;
  const parentScope = (item as unknown as Record<string, unknown>).parent_scope as string | null
    || item.parentScope
    || (isStructural ? structural.parentScope : null);
  const evaluatedVars = isStructural ? structural.evaluatedVariables : null;

  // For containers, gather child info
  const isContainerType = item.type === 'group' || item.type === 'folder' || item.type === 'structural';

  // Folder/container name as file path fallback
  const containerName = isContainerType ? (item as RuleGroup | RuleFolder).name : null;

  // Git metadata from tree level
  const { repo_url, branch, commit_sha, git_tag } = git;

  // Type label
  const typeLabels: Record<string, string> = {
    condition: 'Condition',
    group: 'Group',
    folder: 'Folder',
    structural: 'Structural',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full animate-scale-in max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
              <Braces className="w-4 h-4 text-accent-600" />
            </div>
            <div>
              <h2 id="info-dialog-title" className="text-base font-semibold text-slate-900">
                Rule Item Details
              </h2>
              <p className="text-xs text-slate-400">{typeLabels[item.type] || item.type} &middot; {item.id.substring(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Content Hash (CAS) */}
          <InfoRow icon={<Hash className="w-4 h-4" />} label="Content Hash (CAS)">
            <span className="text-slate-400 italic text-xs">
              SHA-256 hash of the code block text. Enables deduplication of identical logic across files and detection of changes between commits.
            </span>
            <p className="font-mono text-xs text-slate-300 mt-1">Not yet computed</p>
          </InfoRow>

          {/* Evaluated Variables */}
          <InfoRow icon={<Variable className="w-4 h-4" />} label="Evaluated Variables">
            {evaluatedVars && evaluatedVars.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {evaluatedVars.map((v) => (
                  <span key={v} className="px-2 py-0.5 text-xs font-mono bg-violet-50 text-violet-700 border border-violet-200 rounded-md">
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 italic text-xs">
                Variables involved in the condition (e.g. isBrowser, noLinkStyle). Searchable to find everywhere a variable alters flow.
                {!isStructural && <span className="block mt-1 text-slate-300">Only available on structural nodes.</span>}
              </span>
            )}
          </InfoRow>

          {/* Node Type */}
          <InfoRow icon={<Braces className="w-4 h-4" />} label="Node Type">
            {nodeType ? (
              <span className="px-2 py-0.5 text-xs font-mono bg-violet-50 text-violet-700 border border-violet-200 rounded-md">
                {nodeType}
              </span>
            ) : (
              <span className="text-slate-400 italic text-xs">
                Logic block type (e.g. IfStatement, SwitchCase, WhileStatement, TryCatch).
                {!isStructural && <span className="block mt-1 text-slate-300">Only available on structural nodes.</span>}
              </span>
            )}
          </InfoRow>

          {/* Parent Scope / Node */}
          <InfoRow icon={<FolderTree className="w-4 h-4" />} label="Parent Scope / Node">
            {parentScope ? (
              <span className="font-mono text-sm">{parentScope}</span>
            ) : (
              <span className="text-slate-400 italic text-xs">
                Enclosing class, method, or function (e.g. createEmotionCache, MyApp). Not yet extracted for this item.
              </span>
            )}
          </InfoRow>

          {/* Line & Column Numbers */}
          <InfoRow icon={<ScanLine className="w-4 h-4" />} label="Line & Column Numbers">
            {line ? (
              <div>
                {sourceUrl ? (
                  <LinkRow href={sourceUrl}>
                    Line {line}
                  </LinkRow>
                ) : (
                  <span className="font-mono text-sm">Line {line}</span>
                )}
                <p className="text-slate-400 italic text-xs mt-1">
                  Column numbers and end positions not yet available. When present, enables direct clickable links to the exact code block.
                </p>
              </div>
            ) : (
              <span className="text-slate-400 italic text-xs">
                start_line, end_line, start_column, end_column. Enables direct clickable links to the exact code block in GitHub or an IDE.
              </span>
            )}
          </InfoRow>

          {/* File Path */}
          <InfoRow icon={<FileText className="w-4 h-4" />} label="File Path">
            {(filePath || containerName) ? (
              sourceUrl ? (
                <LinkRow href={sourceUrl}>
                  <span className="font-mono text-xs">{filePath || containerName}</span>
                </LinkRow>
              ) : (
                <span className="font-mono text-xs">{filePath || containerName}</span>
              )
            ) : (
              <span className="text-slate-400 italic text-xs">No file path available.</span>
            )}
          </InfoRow>

          {/* Divider for git section */}
          <div className="flex items-center gap-2 mt-4 mb-2">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Git Metadata</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Git Tag / Release Version */}
          <InfoRow icon={<Tag className="w-4 h-4" />} label="Git Tag / Release Version">
            {git_tag ? (
              repo_url ? (
                <LinkRow href={repoTagUrl(repo_url, git_tag)}>
                  <span className="px-2 py-0.5 text-xs font-mono bg-amber-50 text-amber-700 border border-amber-200 rounded-md">{git_tag}</span>
                </LinkRow>
              ) : (
                <span className="px-2 py-0.5 text-xs font-mono bg-amber-50 text-amber-700 border border-amber-200 rounded-md">{git_tag}</span>
              )
            ) : (
              <span className="text-slate-400 italic text-xs">
                Helps filter logic relevant to specific production releases (e.g. v1.0.4).
              </span>
            )}
          </InfoRow>

          {/* Commit SHA */}
          <InfoRow icon={<GitCommit className="w-4 h-4" />} label="Commit SHA">
            {commit_sha ? (
              repo_url ? (
                <LinkRow href={repoCommitUrl(repo_url, commit_sha)}>
                  <span className="font-mono text-xs">{commit_sha}</span>
                </LinkRow>
              ) : (
                <span className="font-mono text-xs">{commit_sha}</span>
              )
            ) : (
              <span className="text-slate-400 italic text-xs">
                Crucial for immutability. Branches move, but a commit hash gives the exact state when logic was extracted.
              </span>
            )}
          </InfoRow>

          {/* Repo URL and Branch */}
          <InfoRow icon={<GitBranch className="w-4 h-4" />} label="Repo URL & Branch">
            {(repo_url || branch) ? (
              <div className="space-y-1">
                {repo_url && branch ? (
                  <LinkRow href={repoBranchUrl(repo_url, branch)}>
                    <span className="font-mono text-xs">{repo_url.replace(/^https?:\/\//, '')}</span>
                    <span className="px-1.5 py-0.5 text-xs bg-slate-100 rounded ml-1">{branch}</span>
                  </LinkRow>
                ) : (
                  <>
                    {repo_url && (
                      <LinkRow href={repo_url}>
                        <span className="font-mono text-xs">{repo_url.replace(/^https?:\/\//, '')}</span>
                      </LinkRow>
                    )}
                    {branch && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-100 rounded font-mono">
                        <GitBranch className="w-3 h-3" />
                        {branch}
                      </span>
                    )}
                  </>
                )}
              </div>
            ) : (
              <span className="text-slate-400 italic text-xs">No repository information available.</span>
            )}
          </InfoRow>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-slate-50/80 rounded-b-2xl border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
