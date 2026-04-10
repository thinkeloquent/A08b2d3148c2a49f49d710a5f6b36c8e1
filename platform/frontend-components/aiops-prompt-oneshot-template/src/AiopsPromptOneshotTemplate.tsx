import { useState, useCallback, useRef, useMemo, type ReactNode } from 'react';
import type {
  AiopsPromptOneshotTemplateProps,
  ImportPanelProps,
  StatusBadgeProps,
  VariableInputProps,
  LineNumbersProps,
  IconName,
  ThemeTokens,
} from './types';
import { DEFAULT_ICONS } from './default-icons';
import {
  extractVariables,
  resolveTemplate,
  highlightSyntax,
  parseSimpleYaml,
  flattenObject,
} from './template-engine';

// ─── Default theme tokens ─────────────────────────────────────────────────────
const DEFAULT_THEME: ThemeTokens = {
  bgPrimary: '#f8f9fb',
  bgSecondary: '#ffffff',
  surfaceCard: '#ffffff',
  surfaceElevated: '#f1f3f7',
  inputBg: '#f8f9fb',
  borderSubtle: '#e2e5eb',
  borderActive: '#5b5fc7',
  textPrimary: '#1a1d26',
  textSecondary: '#5a6070',
  textMuted: '#8b92a5',
  accentPrimary: '#5b5fc7',
  accentSecondary: '#4a4eb5',
  accentGlow: 'rgba(91,95,199,0.08)',
  previewBg: '#f4f5f8',
};

function mergeTheme(overrides?: Partial<ThemeTokens>): Record<string, string> {
  const merged = { ...DEFAULT_THEME, ...overrides };
  return {
    '--bg-primary': merged.bgPrimary,
    '--bg-secondary': merged.bgSecondary,
    '--surface-card': merged.surfaceCard,
    '--surface-elevated': merged.surfaceElevated,
    '--input-bg': merged.inputBg,
    '--border-subtle': merged.borderSubtle,
    '--border-active': merged.borderActive,
    '--text-primary': merged.textPrimary,
    '--text-secondary': merged.textSecondary,
    '--text-muted': merged.textMuted,
    '--accent-primary': merged.accentPrimary,
    '--accent-secondary': merged.accentSecondary,
    '--accent-glow': merged.accentGlow,
    '--preview-bg': merged.previewBg,
  };
}

function useIcons(overrides?: Partial<Record<IconName, ReactNode>>): Record<IconName, ReactNode> {
  return useMemo(() => ({ ...DEFAULT_ICONS, ...overrides }), [overrides]);
}

// ─── Import Panel ─────────────────────────────────────────────────────────────
function ImportPanel({ onImport, onClose, icons: iconOverrides }: ImportPanelProps) {
  const icons = useIcons(iconOverrides);
  const [format, setFormat] = useState<'json' | 'yaml'>('json');
  const [rawInput, setRawInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SAMPLE_JSON = JSON.stringify(
    {
      vulnerabilityId: 'CVE-2024-1234',
      packageName: 'express',
      severity: 'CRITICAL',
      targetVersion: '4.19.2',
      filePath: '/src/server.js',
      repo: '/home/app/web-api',
      installCmd: 'npm install express@4.19.2',
      testCmd: 'npm test -- --coverage',
    },
    null,
    2,
  );

  const SAMPLE_YAML = `# Remediation payload
vulnerabilityId: CVE-2024-1234
packageName: express
severity: CRITICAL
targetVersion: "4.19.2"
filePath: /src/server.js
repo: /home/app/web-api
installCmd: "npm install express@4.19.2"
testCmd: "npm test -- --coverage"`;

  const handleParse = useCallback(() => {
    setError(null);
    setSuccess(false);
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setError('Input is empty. Paste your JSON or YAML payload above.');
      return;
    }
    try {
      let parsed: Record<string, unknown>;
      if (format === 'json') {
        parsed = JSON.parse(trimmed);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Expected a JSON object with key-value pairs.');
        }
      } else {
        parsed = parseSimpleYaml(trimmed);
        if (Object.keys(parsed).length === 0) {
          throw new Error('No valid key: value pairs found. Check YAML formatting.');
        }
      }
      const flat = flattenObject(parsed);
      onImport(flat);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to parse input.');
    }
  }, [rawInput, format, onImport]);

  const handleFileRead = useCallback((file: File) => {
    setError(null);
    const name = file.name.toLowerCase();
    if (name.endsWith('.json')) setFormat('json');
    else if (name.endsWith('.yaml') || name.endsWith('.yml')) setFormat('yaml');
    const reader = new FileReader();
    reader.onload = (e) => setRawInput(e.target?.result as string);
    reader.onerror = () => setError('Could not read file.');
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--accent-secondary)' }}>{icons.upload}</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Import Variables
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md transition-colors hover:bg-black/5"
          style={{ color: 'var(--text-muted)' }}
        >
          {icons.x}
        </button>
      </div>

      <div className="flex items-center gap-1 px-3 pt-3 pb-1">
        {(['json', 'yaml'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFormat(f);
              setError(null);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 uppercase tracking-wide"
            style={{
              background: format === f ? 'var(--accent-glow)' : 'transparent',
              color: format === f ? 'var(--accent-secondary)' : 'var(--text-muted)',
            }}
          >
            {icons.braces}
            {f}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setRawInput(format === 'json' ? SAMPLE_JSON : SAMPLE_YAML)}
          className="text-[10px] font-medium px-2 py-1 rounded transition-colors hover:bg-black/5"
          style={{ color: 'var(--text-muted)' }}
        >
          Paste sample
        </button>
      </div>

      <div
        className="flex-1 mx-3 mt-2 mb-2 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
      >
        {dragOver && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-lg pointer-events-none"
            style={{
              background: 'rgba(91,95,199,0.06)',
              border: '2px dashed var(--accent-primary)',
            }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>
              Drop file here
            </span>
          </div>
        )}
        <textarea
          value={rawInput}
          onChange={(e) => {
            setRawInput(e.target.value);
            setError(null);
            setSuccess(false);
          }}
          placeholder={
            format === 'json'
              ? '{\n  "vulnerabilityId": "CVE-2024-...",\n  "packageName": "lodash"\n}'
              : 'vulnerabilityId: CVE-2024-...\npackageName: lodash'
          }
          spellCheck={false}
          className="w-full h-full resize-none font-mono text-xs leading-5 p-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
          style={{
            background: 'var(--input-bg)',
            borderColor: error ? '#ef4444' : 'var(--border-subtle)',
            color: 'var(--text-primary)',
            // @ts-expect-error CSS custom property
            '--tw-ring-color': error ? '#ef4444' : 'var(--accent-primary)',
          }}
        />
      </div>

      {error && (
        <div
          className="mx-3 mb-2 flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
          style={{
            background: 'rgba(220,38,38,0.06)',
            color: '#dc2626',
            border: '1px solid rgba(220,38,38,0.15)',
          }}
        >
          {icons.alertCircle}
          <span className="leading-relaxed">{error}</span>
        </div>
      )}
      {success && (
        <div
          className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{
            background: 'rgba(22,163,74,0.06)',
            color: '#16a34a',
            border: '1px solid rgba(22,163,74,0.15)',
          }}
        >
          {icons.check}
          <span>Variables imported successfully!</span>
        </div>
      )}

      <div className="px-3 py-3 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.yaml,.yml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileRead(file);
            e.target.value = '';
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors hover:bg-black/5"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          {icons.fileUp}
          Upload .json / .yaml file
        </button>
        <button
          onClick={handleParse}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
          style={{
            background: 'var(--accent-primary)',
            color: '#fff',
            boxShadow: '0 1px 3px rgba(91,95,199,0.2)',
          }}
        >
          {icons.download}
          Import &amp; Apply Variables
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ saved, className }: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300',
        saved
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'w-1.5 h-1.5 rounded-full',
          saved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse',
        ].join(' ')}
      />
      {saved ? 'Saved' : 'Unsaved changes'}
    </span>
  );
}

function VariableInput({ name, value, type, onChange, className }: VariableInputProps) {
  return (
    <div className={['group', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between mb-1.5">
        <label
          className="text-xs font-semibold tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          {name}
        </label>
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
        >
          {type}
        </span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        spellCheck={false}
        className="w-full text-sm font-mono px-3 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
        style={{
          background: 'var(--input-bg)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
          // @ts-expect-error CSS custom property
          '--tw-ring-color': 'var(--accent-primary)',
        }}
      />
    </div>
  );
}

function LineNumbers({ count, className }: LineNumbersProps) {
  return (
    <div
      className={[
        'select-none text-right pr-3 pt-4 pb-4 text-xs font-mono leading-6 flex-shrink-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ color: 'var(--text-muted)', minWidth: '3rem' }}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}

// ─── Default template ─────────────────────────────────────────────────────────
const BUILTIN_DEFAULT_TEMPLATE = `Remediation Task: {{{ vulnerabilityId }}}

Feature: Remediate {{{ vulnerabilityId }}} in {{{ packageName }}}
Severity: {{{ severity }}}
Package: {{{ packageName }}} -> {{{ targetVersion }}}

@if(filePath)
File: {{{ filePath }}}
@end

@if(componentName)
Component: {{{ componentName }}}
@end

@if(businessService)
Business Service: {{{ businessService }}}
@end

@if(owner)
Owner: {{{ owner }}}
@end

---

## Steps to Remediate

\`\`\`bash
cd {{{ repo }}}
git checkout -b fix/{{{ vulnerabilityIdLower }}}
{{{ installCmd }}}
\`\`\`

\`\`\`bash
{{{ testCmd }}}
\`\`\`

\`\`\`bash
git add .
git commit -m "fix: remediate {{{ vulnerabilityId }}} - update {{{ packageName }}} to {{{ targetVersion }}}"
git push origin fix/{{{ vulnerabilityIdLower }}}
\`\`\`

---
Generated: {{{ timestamp }}}`;

const BUILTIN_DEFAULT_MOCK_DATA: Record<string, string> = {
  vulnerabilityId: 'CVE-2024-9999',
  packageName: 'lodash',
  severity: 'HIGH',
  targetVersion: '4.17.21',
  filePath: '/src/utils/helpers.js',
  componentName: 'data-pipeline',
  businessService: 'Payment Processing',
  owner: 'platform-team@acme.io',
  repo: '/home/app/service-api',
  vulnerabilityIdLower: 'cve-2024-9999',
  installCmd: 'npm install lodash@4.17.21 --save-exact',
  testCmd: 'npm test',
  timestamp: new Date().toISOString(),
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function AiopsPromptOneshotTemplate({
  className,
  defaultTemplate = BUILTIN_DEFAULT_TEMPLATE,
  defaultMockData = BUILTIN_DEFAULT_MOCK_DATA,
  defaultTemplateName = 'Remediation_Task.edge',
  defaultVersion = 'v3.1',
  onSave,
  onCopy,
  icons: iconOverrides,
  theme,
}: AiopsPromptOneshotTemplateProps) {
  const icons = useIcons(iconOverrides);
  const themeVars = useMemo(() => mergeTheme(theme), [theme]);

  const [template, setTemplate] = useState(defaultTemplate);
  const [mockData, setMockData] = useState<Record<string, string>>(defaultMockData);
  const [saved, setSaved] = useState(true);
  const [version, setVersion] = useState(defaultVersion);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'split' | 'preview'>('editor');
  const [templateName] = useState(defaultTemplateName);
  const [showImport, setShowImport] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const variables = useMemo(() => extractVariables(template), [template]);
  const resolvedOutput = useMemo(() => resolveTemplate(template, mockData), [template, mockData]);
  const highlightedLines = useMemo(() => highlightSyntax(template), [template]);
  const lineCount = template.split('\n').length;

  const handleTemplateChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
    setSaved(false);
  }, []);

  const handleMockDataChange = useCallback((key: string, value: string) => {
    setMockData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    setSaved(true);
    const vParts = version.split('.');
    const minor = parseInt(vParts[1] || '0') + 1;
    const newVersion = `${vParts[0]}.${minor}`;
    setVersion(newVersion);
    onSave?.(template, mockData, newVersion);
  }, [version, template, mockData, onSave]);

  const handleCopyOutput = useCallback(() => {
    navigator.clipboard?.writeText(resolvedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(resolvedOutput);
  }, [resolvedOutput, onCopy]);

  const handleImportVariables = useCallback((imported: Record<string, string>) => {
    setMockData((prev) => ({ ...prev, ...imported }));
  }, []);

  const handleEditorScroll = useCallback(() => {
    if (editorRef.current && textareaRef.current) {
      editorRef.current.scrollTop = textareaRef.current.scrollTop;
      editorRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const target = e.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const val = target.value;
        setTemplate(val.substring(0, start) + '  ' + val.substring(end));
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        }, 0);
        setSaved(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave],
  );

  return (
    <div
      className={['min-h-screen w-full', className].filter(Boolean).join(' ')}
      style={{
        ...themeVars,
        fontFamily:
          "'DM Sans', 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      } as React.CSSProperties}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'var(--accent-glow)' }}
          >
            <span style={{ color: 'var(--accent-secondary)' }}>{icons.code}</span>
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Prompt Template Workspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors hover:bg-black/5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {icons.clock}
            History
          </button>
          <div
            className="text-xs font-mono px-2 py-1 rounded-md"
            style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
          >
            {version} {saved ? '' : '(Draft)'}
          </div>
          <StatusBadge saved={saved} />
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{
              background: 'var(--accent-primary)',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(91,95,199,0.18)',
            }}
          >
            {icons.save}
            Save Changes
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex" style={{ height: 'calc(100vh - 52px)' }}>
        {/* Left: Editor + Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor toolbar */}
          <div
            className="flex items-center justify-between px-4 py-2 border-b"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
          >
            <div className="flex items-center gap-1">
              {(['editor', 'split', 'preview'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setShowPreview(tab === 'split' || tab === 'preview');
                  }}
                  className="text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200"
                  style={{
                    background: activeTab === tab ? 'var(--accent-glow)' : 'transparent',
                    color: activeTab === tab ? 'var(--accent-secondary)' : 'var(--text-muted)',
                  }}
                >
                  {tab === 'editor' ? 'Editor' : tab === 'split' ? 'Split View' : 'Preview'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {icons.fileText} {templateName}
              </span>
            </div>
          </div>

          {/* Editor sub-header */}
          {activeTab !== 'preview' && (
          <div
            className="flex items-center justify-between px-4 py-1.5 border-b"
            style={{ borderColor: 'var(--border-subtle)', background: 'rgba(241,243,247,0.6)' }}
          >
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Authoring Editor
            </span>
            <div
              className="flex items-center gap-2 text-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>{lineCount} lines</span>
              <span>&bull;</span>
              <span>{variables.length} tokens</span>
            </div>
          </div>
          )}

          {/* Code editor */}
          {activeTab !== 'preview' && (
          <div
            className="flex-1 flex relative overflow-hidden"
            style={{
              background: 'var(--surface-card)',
              minHeight: showPreview ? '40%' : '100%',
              maxHeight: showPreview ? '55%' : '100%',
            }}
          >
            <LineNumbers count={lineCount} />
            <div className="flex-1 relative overflow-hidden">
              <div
                ref={editorRef}
                className="absolute inset-0 overflow-auto pointer-events-none whitespace-pre font-mono text-sm leading-6 pt-4 pb-4 pr-4"
                aria-hidden="true"
              >
                {highlightedLines.map((html, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={template}
                onChange={handleTemplateChange}
                onScroll={handleEditorScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="absolute inset-0 w-full h-full resize-none font-mono text-sm leading-6 pt-4 pb-4 pr-4 focus:outline-none"
                style={{
                  background: 'transparent',
                  color: 'transparent',
                  caretColor: 'var(--accent-secondary)',
                  WebkitTextFillColor: 'transparent',
                }}
              />
            </div>
          </div>
          )}

          {/* Live preview */}
          {showPreview && (
            <div className="flex flex-col" style={{ flex: activeTab === 'preview' ? '1 1 100%' : '1 1 45%', minHeight: 0 }}>
              <div
                className="flex items-center justify-between px-4 py-2 border-t border-b"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
              >
                <span
                  className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: '#16a34a' }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Resolved Output
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded"
                    style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a' }}
                  >
                    Auto-updating
                  </span>
                  <button
                    onClick={handleCopyOutput}
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors hover:bg-black/5"
                    style={{ color: copied ? '#16a34a' : 'var(--text-muted)' }}
                  >
                    {copied ? icons.check : icons.copy}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div
                ref={previewRef}
                className="flex-1 overflow-auto font-mono text-sm leading-6 p-4 whitespace-pre-wrap"
                style={{ background: 'var(--preview-bg)', color: '#3a4252' }}
              >
                {resolvedOutput}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: Test Variables */}
        <aside
          className="flex flex-col border-l overflow-hidden relative"
          style={{
            width: '320px',
            minWidth: '280px',
            borderColor: 'var(--border-subtle)',
            background: 'var(--bg-secondary)',
            boxShadow: '-1px 0 3px rgba(0,0,0,0.03)',
          }}
        >
          {showImport && (
            <ImportPanel
              onImport={handleImportVariables}
              onClose={() => setShowImport(false)}
              icons={iconOverrides}
            />
          )}

          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--accent-secondary)' }}>{icons.layers}</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Test Variables
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all hover:bg-black/5"
                style={{ color: 'var(--accent-secondary)' }}
                title="Import from JSON or YAML"
              >
                {icons.upload}
                Import
              </button>
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded-md"
                style={{ background: 'var(--accent-glow)', color: 'var(--accent-secondary)' }}
              >
                {variables.length}
              </span>
            </div>
          </div>

          <div
            className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-lg text-xs leading-relaxed"
            style={{
              background: 'var(--surface-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Variables are automatically extracted from the template. Provide mock data to test the
            output.
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {variables.map((v) => (
              <VariableInput
                key={v}
                name={v}
                value={mockData[v] || ''}
                type="String"
                onChange={handleMockDataChange}
              />
            ))}
          </div>

          <div
            className="px-3 py-3 border-t space-y-2"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <button
              onClick={() => setShowImport(true)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-lg transition-all duration-200 hover:brightness-110"
              style={{
                background: 'var(--accent-glow)',
                color: 'var(--accent-secondary)',
                border: '1px solid rgba(91,95,199,0.15)',
              }}
            >
              {icons.upload}
              Import from JSON / YAML
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const fresh: Record<string, string> = {};
                  variables.forEach((v) => {
                    fresh[v] = '';
                  });
                  setMockData(fresh);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors hover:bg-black/5"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {icons.refreshCw}
                Reset
              </button>
              <button
                onClick={() => {
                  const exportObj: Record<string, string> = {};
                  variables.forEach((v) => {
                    if (mockData[v]) exportObj[v] = mockData[v];
                  });
                  const json = JSON.stringify(exportObj, null, 2);
                  navigator.clipboard?.writeText(json);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors hover:bg-black/5"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                title="Copy current variables as JSON"
              >
                {icons.copy}
                Export
              </button>
            </div>
            <button
              onClick={() => setMockData(defaultMockData)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-all hover:brightness-110 hover:bg-black/5"
              style={{ color: 'var(--text-muted)' }}
            >
              {icons.zap}
              Load Sample Payload
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
