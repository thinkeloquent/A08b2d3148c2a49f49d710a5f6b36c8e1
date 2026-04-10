import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Term, TerminologyManagerProps, PriorityColorConfig } from './types';

/* ─── Default priority colors ─── */
const DEFAULT_PRIORITY_COLORS: Record<string, PriorityColorConfig> = {
  P0: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  P1: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  P2: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

/* ─── Icons (inline SVG — zero deps) ─── */
const Icon = ({ d, size = 18, className = '' }: { d: string; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const SearchIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />;
const PlusIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M12 5v14M5 12h14" />;
const ChevronIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M9 18l6-6-6-6" />;
const LinkIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />;
const BookIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />;
const EditIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;
const TrashIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />;
const XIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />;
const CopyIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />;
const LayersIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />;
const CheckIcon = (p: { size?: number; className?: string }) => <Icon {...p} d="M20 6L9 17l-5-5" />;

/* ─── Validation helpers ─── */
const validateName = (n: string) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(n) && n.length <= 64;
const genId = () => 't' + Math.random().toString(36).slice(2, 10);

const EMPTY_FORM: Omit<Term, 'id' | 'createdAt' | 'updatedAt'> = {
  term: '',
  aliases: [],
  definition: '',
  reference_urls: [],
  name: '',
  description: '',
  compatibility: '',
  metadata: {},
};

/* ─── Sub-Components ─── */

function Pill({ children, color = 'blue', onRemove }: { children: ReactNode; color?: 'blue' | 'gray' | 'green'; onRemove?: () => void }) {
  const colors = {
    blue: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={['inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', colors[color]].join(' ')}>
      {children}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:text-red-500 transition-colors">
          <XIcon size={12} />
        </button>
      )}
    </span>
  );
}

function PriorityBadge({ priority, colors }: { priority: string; colors: Record<string, PriorityColorConfig> }) {
  const c = colors[priority] || colors.P2 || DEFAULT_PRIORITY_COLORS.P2;
  return (
    <span className={['inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold', c.bg, c.text].join(' ')}>
      <span className={['w-1.5 h-1.5 rounded-full', c.dot].join(' ')} />
      {priority}
    </span>
  );
}

function EmptyState({ onAdd, icon }: { onAdd: () => void; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        {icon || <BookIcon size={28} className="text-gray-300" />}
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">No terms found</p>
      <p className="text-xs text-gray-400 mb-4">Add your first term to get started</p>
      <button onClick={onAdd} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
        <PlusIcon size={14} /> Add Term
      </button>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-2xl animate-[slideUp_0.25s_ease-out]">
      <CheckIcon size={15} className="text-emerald-400" />
      {message}
    </div>
  );
}

/* ─── Term Form Modal ─── */
function TermFormModal({ term, onSave, onClose }: { term: Term | null; onSave: (t: Term) => void; onClose: () => void }) {
  const [form, setForm] = useState<Term>(
    term
      ? { ...term }
      : { ...EMPTY_FORM, id: genId(), createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) },
  );
  const [aliasInput, setAliasInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [metaKey, setMetaKey] = useState('');
  const [metaVal, setMetaVal] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const set = (k: keyof Term, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const addAlias = () => {
    const a = aliasInput.trim();
    if (a && !form.aliases.includes(a)) {
      set('aliases', [...form.aliases, a]);
      setAliasInput('');
    }
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (u) {
      set('reference_urls', [...form.reference_urls, u]);
      setUrlInput('');
    }
  };

  const addMeta = () => {
    if (metaKey.trim() && metaVal.trim()) {
      set('metadata', { ...form.metadata, [metaKey.trim()]: metaVal.trim() });
      setMetaKey('');
      setMetaVal('');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.term.trim()) e.term = 'Term is required';
    if (!form.name.trim()) e.name = 'Name is required';
    else if (!validateName(form.name)) e.name = 'Lowercase, numbers, hyphens only. Max 64 chars.';
    if (!form.definition.trim()) e.definition = 'Definition is required';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.length > 1024) e.description = 'Max 1024 characters';
    if (form.compatibility && form.compatibility.length > 500) e.compatibility = 'Max 500 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ ...form, updatedAt: new Date().toISOString().slice(0, 10) });
    }
  };

  const Field = ({ label, error, children, hint }: { label: string; error?: string; children: ReactNode; hint?: string }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-600 tracking-wide uppercase">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );

  const inputCls = (err?: string) =>
    [
      'w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none',
      err ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
    ].join(' ');

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-12 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-[fadeScale_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-base font-bold text-gray-800">{term ? 'Edit Term' : 'New Term'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Display Term" error={errors.term}>
              <input className={inputCls(errors.term)} value={form.term} onChange={(e) => set('term', e.target.value)} placeholder="Project Phoenix" />
            </Field>
            <Field label="Slug Name" error={errors.name} hint="Lowercase, hyphens, max 64 chars">
              <input ref={nameRef} className={inputCls(errors.name)} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="project-phoenix" />
            </Field>
          </div>

          <Field label="Definition" error={errors.definition}>
            <textarea rows={3} className={inputCls(errors.definition) + ' resize-none'} value={form.definition} onChange={(e) => set('definition', e.target.value)} placeholder="What does this term mean in your organization?" />
          </Field>

          <Field label="Description" error={errors.description} hint={`${form.description.length}/1024`}>
            <textarea rows={2} className={inputCls(errors.description) + ' resize-none'} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="When and how this term should be used by the agent..." />
          </Field>

          <Field label="Compatibility" error={errors.compatibility} hint={`${(form.compatibility || '').length}/500 · Optional`}>
            <input className={inputCls(errors.compatibility)} value={form.compatibility || ''} onChange={(e) => set('compatibility', e.target.value)} placeholder="Node 20+, Postgres 15+, AWS S3..." />
          </Field>

          <Field label="Aliases">
            <div className="flex gap-2">
              <input className={inputCls() + ' flex-1'} value={aliasInput} onChange={(e) => setAliasInput(e.target.value)} placeholder="Add alias..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAlias())} />
              <button onClick={addAlias} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors">Add</button>
            </div>
            {form.aliases.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.aliases.map((a) => (
                  <Pill key={a} onRemove={() => set('aliases', form.aliases.filter((x) => x !== a))}>{a}</Pill>
                ))}
              </div>
            )}
          </Field>

          <Field label="Reference URLs">
            <div className="flex gap-2">
              <input className={inputCls() + ' flex-1'} value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())} />
              <button onClick={addUrl} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors">Add</button>
            </div>
            {form.reference_urls.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {form.reference_urls.map((u, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg group">
                    <LinkIcon size={13} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-indigo-600 truncate flex-1">{u}</span>
                    <button onClick={() => set('reference_urls', form.reference_urls.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                      <XIcon size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <Field label="Metadata">
            <div className="flex gap-2">
              <input className={inputCls() + ' flex-1'} value={metaKey} onChange={(e) => setMetaKey(e.target.value)} placeholder="Key" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMeta())} />
              <input className={inputCls() + ' flex-1'} value={metaVal} onChange={(e) => setMetaVal(e.target.value)} placeholder="Value" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMeta())} />
              <button onClick={addMeta} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors">Add</button>
            </div>
            {Object.keys(form.metadata).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(form.metadata).map(([k, v]) => (
                  <Pill key={k} color="green" onRemove={() => { const m = { ...form.metadata }; delete m[k]; set('metadata', m); }}>
                    {k}: {v}
                  </Pill>
                ))}
              </div>
            )}
          </Field>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
            {term ? 'Save Changes' : 'Create Term'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Panel ─── */
function DetailPanel({ term, onEdit, onDelete, onClose, priorityColors }: { term: Term; onEdit: (t: Term) => void; onDelete: (id: string) => void; onClose: () => void; priorityColors: Record<string, PriorityColorConfig> }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyJson = () => {
    const json = { term: term.term, aliases: term.aliases, definition: term.definition, reference_urls: term.reference_urls };
    navigator.clipboard?.writeText(JSON.stringify(json, null, 2));
    setCopied('json');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-800 truncate">{term.term}</h3>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{term.name}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(term)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit">
            <EditIcon size={15} />
          </button>
          <button onClick={() => onDelete(term.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
            <TrashIcon size={15} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-1">
            <XIcon size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          {term.metadata?.priority && <PriorityBadge priority={term.metadata.priority} colors={priorityColors} />}
          {term.metadata?.quarter && <Pill color="gray">{term.metadata.quarter}</Pill>}
          <span className="text-xs text-gray-400 ml-auto">Updated {term.updatedAt}</span>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Definition</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{term.definition}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{term.description}</p>
        </div>

        {term.aliases.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Aliases</h4>
            <div className="flex flex-wrap gap-1.5">
              {term.aliases.map((a) => <Pill key={a}>{a}</Pill>)}
            </div>
          </div>
        )}

        {term.compatibility && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Compatibility</h4>
            <div className="px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 leading-relaxed">{term.compatibility}</div>
          </div>
        )}

        {term.reference_urls.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">References</h4>
            <div className="space-y-1.5">
              {term.reference_urls.map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-indigo-50 rounded-lg group transition-colors">
                  <LinkIcon size={13} className="text-gray-400 group-hover:text-indigo-500 shrink-0" />
                  <span className="text-xs text-gray-600 group-hover:text-indigo-600 truncate">{u}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {Object.keys(term.metadata).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Metadata</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(term.metadata).map(([k, v]) => (
                <div key={k} className="px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-400 block">{k}</span>
                  <span className="text-sm text-gray-700 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <button onClick={copyJson} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            {copied === 'json' ? <><CheckIcon size={13} className="text-emerald-500" /> Copied!</> : <><CopyIcon size={13} /> Copy as JSON</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function TerminologyManager({
  terms,
  onSave,
  onDelete,
  title = 'Terminology Manager',
  subtitle = 'Internal Knowledge Base',
  headerIcon,
  emptyStateIcon,
  priorityColors = DEFAULT_PRIORITY_COLORS,
  className,
}: TerminologyManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<'new' | Term | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');

  const filtered = terms.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.term.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.aliases.some((a) => a.toLowerCase().includes(q)) ||
      t.definition.toLowerCase().includes(q)
    );
  });

  const selected = terms.find((t) => t.id === selectedId);

  const handleSave = (t: Term) => {
    onSave(t);
    setModal(null);
    setSelectedId(t.id);
    setToast(modal === 'new' ? 'Term created' : 'Term updated');
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    if (selectedId === id) setSelectedId(null);
    setDeleteConfirm(null);
    setToast('Term deleted');
  };

  return (
    <div className={['h-screen flex flex-col bg-gray-50/80', className].filter(Boolean).join(' ')} style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeScale { from { opacity:0; transform: scale(0.97) translateY(-8px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform: translateX(24px); } to { opacity:1; transform: translateX(0); } }
      `}</style>

      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200/80 px-6 py-3 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200">
            {headerIcon || <LayersIcon size={16} className="text-white" />}
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-tight">{title}</h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">{subtitle}</p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="relative w-72">
          <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400"
            placeholder="Search terms, aliases, definitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(['list', 'grid'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={['px-3 py-1.5 rounded-md text-xs font-semibold transition-all', view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'].join(' ')}
            >
              {v === 'list' ? 'List' : 'Grid'}
            </button>
          ))}
        </div>

        <button onClick={() => setModal('new')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
          <PlusIcon size={14} /> Add Term
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-4 mb-4 px-1">
            <span className="text-xs text-gray-500 font-medium">{filtered.length} term{filtered.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-3">
              {Object.keys(priorityColors).slice(0, 2).map((p) => {
                const count = filtered.filter((t) => t.metadata?.priority === p).length;
                if (!count) return null;
                return <span key={p} className="flex items-center gap-1 text-xs text-gray-400"><span className={['w-1.5 h-1.5 rounded-full', priorityColors[p].dot].join(' ')} />{count} {p}</span>;
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState onAdd={() => setModal('new')} icon={emptyStateIcon} />
          ) : view === 'list' ? (
            <div className="space-y-2">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(selectedId === t.id ? null : t.id); } }}
                  className={['w-full text-left px-4 py-3.5 rounded-xl border transition-all cursor-pointer group', selectedId === t.id ? 'bg-indigo-50/60 border-indigo-200 shadow-sm ring-1 ring-indigo-200' : 'bg-white border-gray-200/80 hover:border-gray-300 hover:shadow-sm'].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">{t.term}</span>
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">{t.name}</span>
                        {t.metadata?.priority && <PriorityBadge priority={t.metadata.priority} colors={priorityColors} />}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{t.definition}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {t.aliases.slice(0, 3).map((a) => <Pill key={a} color="gray">{a}</Pill>)}
                        {t.aliases.length > 3 && <span className="text-[10px] text-gray-400">+{t.aliases.length - 3}</span>}
                      </div>
                    </div>
                    <ChevronIcon size={16} className={['mt-1 shrink-0 transition-all', selectedId === t.id ? 'text-indigo-500 rotate-90' : 'text-gray-300 group-hover:text-gray-400'].join(' ')} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(selectedId === t.id ? null : t.id); } }}
                  className={['text-left p-4 rounded-xl border transition-all cursor-pointer', selectedId === t.id ? 'bg-indigo-50/60 border-indigo-200 shadow-sm ring-1 ring-indigo-200' : 'bg-white border-gray-200/80 hover:border-gray-300 hover:shadow-sm'].join(' ')}
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{t.term}</span>
                    {t.metadata?.priority && <PriorityBadge priority={t.metadata.priority} colors={priorityColors} />}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{t.definition}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{t.name}</span>
                    {t.reference_urls.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400"><LinkIcon size={10} />{t.reference_urls.length}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <>
            <div className="absolute inset-0 bg-black/10 z-10" onClick={() => setSelectedId(null)} />
            <div className="absolute top-0 right-0 bottom-0 w-full max-w-md z-20 shadow-2xl shadow-gray-400/20 animate-[slideIn_0.2s_ease-out] bg-white border-l border-gray-200/80">
              <DetailPanel
                term={selected}
                onEdit={(t) => setModal(t)}
                onDelete={(id) => setDeleteConfirm(id)}
                onClose={() => setSelectedId(null)}
                priorityColors={priorityColors}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <TermFormModal
          term={modal !== 'new' ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-[fadeScale_0.2s_ease-out]">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Delete this term?</h3>
            <p className="text-xs text-gray-500 mb-5">This action cannot be undone. The term and all associated data will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
