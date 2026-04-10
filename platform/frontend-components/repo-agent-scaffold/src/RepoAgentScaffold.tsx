import { useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icons';
import type {
  RepoAgentScaffoldProps,
  AgentFile,
  Container,
  FileTypeConfig,
  StatItem,
  NavItem,
  Visibility,
  FileSelectPayload,
} from './types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function cls(...parts: (string | undefined | false | null)[]): string {
  return parts.filter(Boolean).join(' ');
}

interface FlatFile extends AgentFile {
  path: string[];
  containerId: string;
}

function flattenFiles(containers: Container[], parentPath: string[] = []): FlatFile[] {
  const result: FlatFile[] = [];
  for (const c of containers) {
    const currentPath = [...parentPath, c.name];
    for (const f of c.files) {
      result.push({ ...f, path: currentPath, containerId: c.id });
    }
    result.push(...flattenFiles(c.children, currentPath));
  }
  return result;
}

function getAllTags(files: FlatFile[]): string[] {
  const set = new Set<string>();
  for (const f of files) {
    for (const t of f.tags) set.add(t);
  }
  return Array.from(set).sort();
}

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */

function Badge({
  label,
  color,
  bg,
  className,
}: {
  label: string;
  color: string;
  bg: string;
  className?: string;
}) {
  return (
    <span
      className={cls(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
        className,
      )}
      style={{ color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  VisibilityBadge                                                    */
/* ------------------------------------------------------------------ */

const visibilityMap: Record<Visibility, { icon: 'globe' | 'lock' | 'users'; label: string; color: string }> = {
  public: { icon: 'globe', label: 'Public', color: '#a3e635' },
  private: { icon: 'lock', label: 'Private', color: '#f59e0b' },
  team: { icon: 'users', label: 'Team', color: '#c084fc' },
};

function VisibilityBadge({ visibility, className }: { visibility: Visibility; className?: string }) {
  const cfg = visibilityMap[visibility];
  return (
    <span
      className={cls(
        'inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider',
        className,
      )}
      style={{ color: cfg.color }}
    >
      <Icon name={cfg.icon} size={10} />
      {cfg.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Tag                                                                */
/* ------------------------------------------------------------------ */

function TagPill({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors border',
        active
          ? 'border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]'
          : 'border-white/5 bg-white/[0.03] text-[#94a3b8] hover:border-white/10 hover:bg-white/[0.06]',
        className,
      )}
    >
      <Icon name="tag" size={10} />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  StatCard                                                           */
/* ------------------------------------------------------------------ */

function StatCard({ stat, className }: { stat: StatItem; className?: string }) {
  return (
    <div
      className={cls(
        'relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-5',
        className,
      )}
    >
      <div
        className="absolute top-0 left-0 h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${stat.accent}, transparent)` }}
      />
      <p className="text-[11px] font-medium uppercase tracking-wider text-[#64748b] mb-1">
        {stat.label}
      </p>
      <p className="text-2xl font-bold text-[#f8fafc]">{stat.value}</p>
      <p className="text-[11px] text-[#475569] mt-1">{stat.sub}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ContainerNode                                                      */
/* ------------------------------------------------------------------ */

function ContainerNode({
  container,
  depth,
  fileTypes,
  onSelectFile,
  selectedFileId,
  className,
}: {
  container: Container;
  depth: number;
  fileTypes: Record<string, FileTypeConfig>;
  onSelectFile: (file: FlatFile) => void;
  selectedFileId: string | null;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(depth < 1);

  return (
    <div className={cls('select-none', className)}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-white/[0.04] group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={12} className="text-[#475569]" />
        <Icon
          name={expanded ? 'folderOpen' : 'folder'}
          size={14}
          className={expanded ? 'text-[#00d4ff]' : 'text-[#64748b]'}
        />
        <span className="text-[13px] font-medium text-[#e2e8f0] truncate">{container.name}</span>
        <VisibilityBadge visibility={container.visibility} />
        <span className="ml-auto text-[10px] text-[#475569]">{container.files.length}</span>
      </button>

      {expanded && (
        <div>
          {container.files.map((f) => {
            const ftCfg = fileTypes[f.file_type];
            const isSelected = f.id === selectedFileId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  onSelectFile({ ...f, path: [container.name], containerId: container.id })
                }
                className={cls(
                  'flex w-full items-center gap-2 px-2 py-1 rounded-lg text-left transition-colors',
                  isSelected ? 'bg-[#00d4ff]/10' : 'hover:bg-white/[0.03]',
                )}
                style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
              >
                <Icon name="file" size={12} className="text-[#475569]" />
                <span className="text-[12px] text-[#94a3b8] truncate">{f.filename}</span>
                {ftCfg && <Badge label={ftCfg.label} color={ftCfg.color} bg={ftCfg.bg} />}
              </button>
            );
          })}
          {container.children.map((child) => (
            <ContainerNode
              key={child.id}
              container={child}
              depth={depth + 1}
              fileTypes={fileTypes}
              onSelectFile={onSelectFile}
              selectedFileId={selectedFileId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CLIBuilder                                                         */
/* ------------------------------------------------------------------ */

function CLIBuilder({
  defaultOrg,
  fileTypes,
  onCopyCommand,
  className,
}: {
  defaultOrg: string;
  fileTypes: Record<string, FileTypeConfig>;
  onCopyCommand?: (cmd: string) => void;
  className?: string;
}) {
  const [action, setAction] = useState<'pull' | 'push' | 'validate' | 'list'>('pull');
  const [org, setOrg] = useState(defaultOrg);
  const [container, setContainer] = useState('');
  const [fileType, setFileType] = useState('');
  const [flags, setFlags] = useState({ verbose: false, dryRun: false, force: false });
  const [copied, setCopied] = useState(false);

  const command = useMemo(() => {
    const parts = ['repo-agent', action];
    if (org) parts.push(`--org ${org}`);
    if (container) parts.push(`--container ${container}`);
    if (fileType) parts.push(`--type ${fileType}`);
    if (flags.verbose) parts.push('--verbose');
    if (flags.dryRun) parts.push('--dry-run');
    if (flags.force) parts.push('--force');
    return parts.join(' ');
  }, [action, org, container, fileType, flags]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).catch(() => {});
    setCopied(true);
    onCopyCommand?.(command);
    setTimeout(() => setCopied(false), 2000);
  }, [command, onCopyCommand]);

  const actionOptions: { value: typeof action; label: string }[] = [
    { value: 'pull', label: 'Pull' },
    { value: 'push', label: 'Push' },
    { value: 'validate', label: 'Validate' },
    { value: 'list', label: 'List' },
  ];

  const inputCls =
    'w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-[13px] text-[#e2e8f0] placeholder-[#475569] outline-none transition-colors focus:border-[#00d4ff]/30 focus:bg-white/[0.05]';

  return (
    <div className={cls('space-y-5', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Icon name="terminal" size={18} className="text-[#00d4ff]" />
        <h3 className="text-[15px] font-semibold text-[#f8fafc]">CLI Command Builder</h3>
      </div>

      {/* Action selector */}
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-[#64748b] mb-2">
          Action
        </label>
        <div className="flex gap-2">
          {actionOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAction(opt.value)}
              className={cls(
                'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border',
                action === opt.value
                  ? 'border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]'
                  : 'border-white/5 bg-white/[0.03] text-[#94a3b8] hover:border-white/10',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Org */}
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-[#64748b] mb-2">
          Organization
        </label>
        <input
          type="text"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          placeholder="org-name"
          className={inputCls}
        />
      </div>

      {/* Container */}
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-[#64748b] mb-2">
          Container
        </label>
        <input
          type="text"
          value={container}
          onChange={(e) => setContainer(e.target.value)}
          placeholder="container-name"
          className={inputCls}
        />
      </div>

      {/* File type */}
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-[#64748b] mb-2">
          File Type
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(fileTypes).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFileType(fileType === key ? '' : key)}
              className={cls(
                'px-2 py-1 rounded text-[11px] font-medium transition-colors border',
                fileType === key
                  ? 'border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]'
                  : 'border-white/5 bg-white/[0.03] text-[#94a3b8] hover:border-white/10',
              )}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-[#64748b] mb-2">
          Flags
        </label>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(flags) as Array<keyof typeof flags>).map((key) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={flags[key]}
                onChange={() => setFlags((p) => ({ ...p, [key]: !p[key] }))}
                className="sr-only peer"
              />
              <span className="w-4 h-4 rounded border border-white/10 bg-white/[0.03] flex items-center justify-center peer-checked:border-[#00d4ff]/50 peer-checked:bg-[#00d4ff]/10 transition-colors">
                {flags[key] && <Icon name="check" size={10} className="text-[#00d4ff]" />}
              </span>
              <span className="text-[12px] text-[#94a3b8]">
                --{key.replace(/([A-Z])/g, '-$1').toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-[#64748b] mb-2">
          Command Preview
        </label>
        <div className="relative rounded-xl border border-white/5 bg-[#080c16] p-4 font-mono">
          <pre className="text-[13px] text-[#a3e635] whitespace-pre-wrap break-all">
            <span className="text-[#475569]">$</span> {command}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-lg border border-white/5 bg-white/[0.03] text-[#64748b] hover:text-[#00d4ff] hover:border-[#00d4ff]/20 transition-colors"
          >
            <Icon name={copied ? 'check' : 'copy'} size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FileDetail                                                         */
/* ------------------------------------------------------------------ */

function FileDetail({
  file,
  fileTypes,
  onClose,
  className,
}: {
  file: FlatFile;
  fileTypes: Record<string, FileTypeConfig>;
  onClose: () => void;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState<'frontmatter' | 'content'>('frontmatter');
  const ftCfg = fileTypes[file.file_type];

  return (
    <aside
      className={cls(
        'flex flex-col h-full bg-[#0a0f1c] border-l border-white/5 overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="file" size={16} className="text-[#64748b] shrink-0" />
          <span className="text-[14px] font-semibold text-[#f8fafc] truncate">{file.filename}</span>
          {ftCfg && <Badge label={ftCfg.label} color={ftCfg.color} bg={ftCfg.bg} />}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg border border-white/5 bg-white/[0.03] text-[#64748b] hover:text-[#f8fafc] hover:border-white/10 transition-colors shrink-0"
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      {/* Meta */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 flex-wrap">
        <span className="text-[11px] text-[#475569]">
          v{file.version}
        </span>
        <span className="text-[11px] text-[#334155]">|</span>
        <span className="text-[11px] text-[#475569]">
          {file.path.join(' / ')}
        </span>
        <div className="flex gap-1 ml-auto">
          {file.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-white/5 bg-white/[0.03] text-[#94a3b8]"
            >
              <Icon name="tag" size={8} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(['frontmatter', 'content'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cls(
              'flex-1 px-4 py-2.5 text-[12px] font-medium uppercase tracking-wider transition-colors border-b-2',
              activeTab === tab
                ? 'text-[#00d4ff] border-[#00d4ff]'
                : 'text-[#475569] border-transparent hover:text-[#94a3b8]',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'frontmatter' ? (
          <div className="space-y-2">
            {Object.entries(file.frontmatter).map(([k, v]) => (
              <div key={k} className="flex items-start gap-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#475569] shrink-0 w-28 pt-0.5">
                  {k}
                </span>
                <span className="text-[13px] text-[#e2e8f0] break-all">
                  {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <pre className="text-[12px] text-[#94a3b8] font-mono whitespace-pre-wrap break-all leading-relaxed">
            {file.content}
          </pre>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  RepoAgentScaffold (main)                                           */
/* ------------------------------------------------------------------ */

const defaultNavItems: NavItem[] = [
  { id: 'dashboard', icon: <Icon name="grid" size={16} />, label: 'Dashboard' },
  { id: 'containers', icon: <Icon name="layers" size={16} />, label: 'Containers' },
  { id: 'files', icon: <Icon name="file" size={16} />, label: 'Files' },
  { id: 'cli', icon: <Icon name="terminal" size={16} />, label: 'CLI Builder' },
];

export function RepoAgentScaffold({
  containers,
  fileTypes,
  stats = [],
  navItems = defaultNavItems,
  brandName = 'Agent Hub',
  brandSubtitle = 'Configuration Registry',
  logoIcon,
  statusLabel = 'Connected',
  statusConnected = true,
  onFileSelect,
  onCopyCommand,
  defaultOrg = 'my-org',
  className,
  title = 'Agent Hub',
  subtitle = 'Configuration Registry Dashboard',
}: RepoAgentScaffoldProps) {
  const [activeNav, setActiveNav] = useState(navItems[0]?.id ?? 'dashboard');
  const [selectedFile, setSelectedFile] = useState<FlatFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const allFiles = useMemo(() => flattenFiles(containers), [containers]);
  const allTags = useMemo(() => getAllTags(allFiles), [allFiles]);

  const filteredFiles = useMemo(() => {
    let result = allFiles;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.filename.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (typeFilter) {
      result = result.filter((f) => f.file_type === typeFilter);
    }
    if (tagFilter) {
      result = result.filter((f) => f.tags.includes(tagFilter));
    }
    return result;
  }, [allFiles, searchQuery, typeFilter, tagFilter]);

  const handleFileSelect = useCallback(
    (file: FlatFile) => {
      setSelectedFile(file);
      setShowDetail(true);
      onFileSelect?.(file);
    },
    [onFileSelect],
  );

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedFile(null);
  }, []);

  /* ---- View renderers ---- */

  function renderDashboard() {
    const recentFiles = allFiles.slice(0, 6);
    return (
      <div className="space-y-6">
        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatCard key={i} stat={s} />
            ))}
          </div>
        )}

        {/* Recent files */}
        <div>
          <h3 className="text-[13px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
            Recent Files
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentFiles.map((f) => {
              const ftCfg = fileTypes[f.file_type];
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFileSelect(f)}
                  className="text-left rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="file" size={14} className="text-[#475569]" />
                    <span className="text-[13px] font-medium text-[#e2e8f0] truncate">
                      {f.filename}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ftCfg && <Badge label={ftCfg.label} color={ftCfg.color} bg={ftCfg.bg} />}
                    <span className="text-[10px] text-[#475569]">v{f.version}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {f.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] text-[#64748b] px-1.5 py-0.5 rounded border border-white/5 bg-white/[0.03]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderContainers() {
    return (
      <div className="space-y-1">
        {containers.map((c) => (
          <ContainerNode
            key={c.id}
            container={c}
            depth={0}
            fileTypes={fileTypes}
            onSelectFile={handleFileSelect}
            selectedFileId={selectedFile?.id ?? null}
          />
        ))}
      </div>
    );
  }

  function renderFiles() {
    return (
      <div className="space-y-4">
        {/* Tag filter bar */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <TagPill
              label="All"
              active={tagFilter === null}
              onClick={() => setTagFilter(null)}
            />
            {allTags.map((t) => (
              <TagPill
                key={t}
                label={t}
                active={tagFilter === t}
                onClick={() => setTagFilter(tagFilter === t ? null : t)}
              />
            ))}
          </div>
        )}

        {/* File grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFiles.map((f) => {
            const ftCfg = fileTypes[f.file_type];
            const isSelected = f.id === selectedFile?.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFileSelect(f)}
                className={cls(
                  'text-left rounded-xl border p-4 transition-colors',
                  isSelected
                    ? 'border-[#00d4ff]/30 bg-[#00d4ff]/[0.06]'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="file" size={14} className="text-[#475569]" />
                  <span className="text-[13px] font-medium text-[#e2e8f0] truncate">
                    {f.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {ftCfg && <Badge label={ftCfg.label} color={ftCfg.color} bg={ftCfg.bg} />}
                  <span className="text-[10px] text-[#475569]">v{f.version}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {f.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] text-[#64748b] px-1.5 py-0.5 rounded border border-white/5 bg-white/[0.03]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#475569] mt-2 truncate">
                  {f.path.join(' / ')}
                </p>
              </button>
            );
          })}
          {filteredFiles.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Icon name="search" size={32} className="text-[#334155] mx-auto mb-3" />
              <p className="text-[13px] text-[#475569]">No files match current filters</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCLI() {
    return (
      <CLIBuilder
        defaultOrg={defaultOrg}
        fileTypes={fileTypes}
        onCopyCommand={onCopyCommand}
      />
    );
  }

  const viewMap: Record<string, () => ReactNode> = {
    dashboard: renderDashboard,
    containers: renderContainers,
    files: renderFiles,
    cli: renderCLI,
  };

  const renderView = viewMap[activeNav] ?? renderDashboard;

  return (
    <div
      className={cls(
        'flex h-screen w-full overflow-hidden bg-[#080c16] text-[#e2e8f0]',
        className,
      )}
    >
      {/* ---- Left sidebar ---- */}
      <aside className="flex flex-col w-64 shrink-0 bg-[#0a0f1c] border-r border-white/5">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            {logoIcon ?? (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#c084fc] flex items-center justify-center">
                <Icon name="sparkles" size={16} className="text-white" />
              </div>
            )}
            <div>
              <div className="text-[14px] font-bold text-[#f8fafc]">{brandName}</div>
              <div className="text-[10px] text-[#475569] uppercase tracking-wider">{brandSubtitle}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                className={cls(
                  'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'text-[#94a3b8] hover:bg-white/[0.04] hover:text-[#e2e8f0]',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* File type filters */}
        <div className="px-3 py-3 border-t border-white/5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#475569] px-3 mb-2">
            File Types
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setTypeFilter(null)}
              className={cls(
                'flex w-full items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] transition-colors',
                typeFilter === null
                  ? 'bg-white/[0.06] text-[#f8fafc]'
                  : 'text-[#64748b] hover:bg-white/[0.03] hover:text-[#94a3b8]',
              )}
            >
              All Types
            </button>
            {Object.entries(fileTypes).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTypeFilter(typeFilter === key ? null : key)}
                className={cls(
                  'flex w-full items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] transition-colors',
                  typeFilter === key
                    ? 'bg-white/[0.06] text-[#f8fafc]'
                    : 'text-[#64748b] hover:bg-white/[0.03] hover:text-[#94a3b8]',
                )}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="px-5 py-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span
              className={cls(
                'w-2 h-2 rounded-full',
                statusConnected ? 'bg-[#a3e635]' : 'bg-[#64748b]',
              )}
            />
            <span className="text-[11px] text-[#64748b]">{statusLabel}</span>
          </div>
        </div>
      </aside>

      {/* ---- Main content ---- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-bold text-[#f8fafc]">{title}</h1>
            <p className="text-[12px] text-[#475569]">{subtitle}</p>
          </div>
          <div className="relative w-72">
            <Icon
              name="search"
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files, tags..."
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-[13px] text-[#e2e8f0] placeholder-[#475569] outline-none transition-colors focus:border-[#00d4ff]/30 focus:bg-white/[0.05]"
            />
          </div>
        </header>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">{renderView()}</div>

          {/* Detail panel */}
          {showDetail && selectedFile && (
            <div className="w-96 shrink-0">
              <FileDetail
                file={selectedFile}
                fileTypes={fileTypes}
                onClose={handleCloseDetail}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
