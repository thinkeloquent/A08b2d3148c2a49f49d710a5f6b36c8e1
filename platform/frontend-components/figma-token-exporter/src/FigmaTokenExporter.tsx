import { useState, useEffect, useMemo } from 'react';
import type {
  FigmaTokenExporterProps,
  PrimitiveToken,
  SemanticToken,
  ComponentToken,
  ResolvedToken,
} from './types';
import {
  buildTokenMap,
  resolveValue,
  getCascade,
  getUpstream,
  getOrphans,
  genCode,
  isColor,
  getGraphNodes,
} from './token-utils';
import { Icons as I } from './icons';

const DEFAULT_THEMES = ['Light', 'Dark'];
const DEFAULT_PLATFORMS = ['Web', 'iOS', 'Android'];

const tierBg: Record<string, string> = {
  primitive: 'bg-emerald-500',
  semantic: 'bg-violet-500',
  component: 'bg-amber-500',
};

const tierBgLight: Record<string, string> = {
  primitive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  semantic: 'bg-violet-50 text-violet-700 border-violet-200',
  component: 'bg-amber-50 text-amber-700 border-amber-200',
};

export function FigmaTokenExporter({
  primitives,
  semantics,
  components,
  themes = DEFAULT_THEMES,
  platforms = DEFAULT_PLATFORMS,
  defaultTheme,
  defaultPlatform,
  versionHistory = [],
  onTokenSelect,
  className,
}: FigmaTokenExporterProps) {
  const [platform, setPlatform] = useState(defaultPlatform || platforms[0] || 'Web');
  const [theme, setTheme] = useState(defaultTheme || themes[0] || 'Light');
  const [canvasMode, setCanvasMode] = useState<'matrix' | 'graph'>('matrix');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set(['primitives', 'semantics', 'components']);
    primitives.forEach(p => initial.add(p.group));
    semantics.forEach(s => initial.add(s.cat));
    components.forEach(c => initial.add(c.comp));
    return initial;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showOrphans, setShowOrphans] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  const tokenMap = useMemo(
    () => buildTokenMap(primitives, semantics, components),
    [primitives, semantics, components],
  );

  const allTokens = useMemo(
    () => Object.values(tokenMap),
    [tokenMap],
  );

  const toggleExpand = (id: string) =>
    setExpanded(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setInspectorOpen(true);
    onTokenSelect?.(id);
  };

  const orphans = useMemo(() => getOrphans(primitives, semantics, components), [primitives, semantics, components]);
  const selected = selectedId ? tokenMap[selectedId] : null;
  const cascade = selectedId ? getCascade(tokenMap, selectedId, theme) : [];
  const upstream = selectedId ? getUpstream(tokenMap, allTokens, selectedId) : [];

  const doCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1400);
  };

  const q = search.toLowerCase();
  const filterTok = (t: { name: string; id: string }) =>
    !q || t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);

  const primGroups = useMemo(() => {
    const g: Record<string, PrimitiveToken[]> = {};
    primitives.filter(filterTok).forEach(p => {
      (g[p.group] = g[p.group] || []).push(p);
    });
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, primitives]);

  const semCats = useMemo(() => {
    const g: Record<string, SemanticToken[]> = {};
    semantics.filter(filterTok).forEach(s => {
      (g[s.cat] = g[s.cat] || []).push(s);
    });
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, semantics]);

  const compGroups = useMemo(() => {
    const g: Record<string, ComponentToken[]> = {};
    components.filter(filterTok).forEach(c => {
      (g[c.comp] = g[c.comp] || []).push(c);
    });
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, components]);

  const graphNodes = useMemo(() => {
    if (!selectedId) return { prims: [] as ResolvedToken[], sems: [] as ResolvedToken[], comps: [] as ResolvedToken[] };
    return getGraphNodes(tokenMap, semantics, components, selectedId);
  }, [selectedId, tokenMap, semantics, components]);

  const codeSnippets = selected ? genCode(tokenMap, selected, theme, platform) : {};

  /* ---- tree leaf ---- */
  const Leaf = ({ id, name, tier }: { id: string; name: string; tier: string }) => {
    const val = resolveValue(tokenMap, id, theme, platform);
    const color = isColor(val);
    return (
      <button
        onClick={() => handleSelect(id)}
        className={`w-full flex items-center gap-2 px-3 py-1 text-[11px] rounded hover:bg-white/5 transition-colors group ${selectedId === id ? 'bg-white/10 text-white' : 'text-slate-400'}`}
      >
        {color && <span className="w-2.5 h-2.5 rounded-sm border border-white/10 flex-shrink-0" style={{ background: val }} />}
        <span className="truncate flex-1 text-left">{name}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity ${tierBgLight[tier] || ''}`}>{tier.slice(0, 4)}</span>
      </button>
    );
  };

  /* ---- tree section ---- */
  const TreeSection = ({ id, label, badge, children }: { id: string; label: string; badge: number; children: React.ReactNode }) => (
    <div className="mb-1">
      <button onClick={() => toggleExpand(id)} className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold tracking-wide uppercase text-slate-500 hover:text-slate-300 transition-colors">
        <span className={`transition-transform ${expanded.has(id) ? 'rotate-90' : ''}`}>{I.chev}</span>
        {label}
        <span className="ml-auto text-[10px] text-slate-600 font-normal">{badge}</span>
      </button>
      {expanded.has(id) && children}
    </div>
  );

  /* ---- tree group ---- */
  const TreeGroup = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <div className="ml-2">
      <button onClick={() => toggleExpand(id)} className="w-full flex items-center gap-1.5 px-2 py-1 text-[10.5px] font-medium text-slate-500 hover:text-slate-300 transition-colors">
        <span className={`transition-transform ${expanded.has(id) ? 'rotate-90' : ''}`}>{I.chev}</span>
        {label}
      </button>
      {expanded.has(id) && <div className="ml-3">{children}</div>}
    </div>
  );

  /* ---- matrix row ---- */
  const MatrixRow = ({ tok, tier }: { tok: ResolvedToken; tier: string }) => {
    const val = resolveValue(tokenMap, tok.id, theme, platform);
    const color = isColor(val);
    return (
      <tr
        onClick={() => handleSelect(tok.id)}
        className={`cursor-pointer transition-colors ${selectedId === tok.id ? 'bg-white/[.06]' : 'hover:bg-white/[.03]'}`}
      >
        <td className="px-3 py-1.5 text-[11px] whitespace-nowrap">
          <div className="flex items-center gap-2">
            {color && <span className="w-3 h-3 rounded-sm border border-white/10 flex-shrink-0" style={{ background: val }} />}
            <span className="text-slate-300 font-medium">{tok.name}</span>
          </div>
        </td>
        <td className="px-3 py-1.5">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border ${tierBgLight[tier]}`}>{tier}</span>
        </td>
        <td className="px-3 py-1.5 text-[11px] text-slate-400 font-mono">{tok.type}</td>
        <td className="px-3 py-1.5 text-[11px] text-slate-400 font-mono">{val}</td>
        <td className="px-3 py-1.5 text-[11px] text-slate-500 font-mono">{tok.id}</td>
      </tr>
    );
  };

  /* ---- graph node ---- */
  const GNode = ({ tok, x, y }: { tok: ResolvedToken; x: number; y: number }) => {
    const val = resolveValue(tokenMap, tok.id, theme, platform);
    const color = isColor(val);
    const isSel = tok.id === selectedId;
    return (
      <g transform={`translate(${x},${y})`} onClick={() => handleSelect(tok.id)} className="cursor-pointer">
        <rect x={-70} y={-18} width={140} height={36} rx={8}
          fill={isSel ? '#1e293b' : '#141820'} stroke={isSel ? '#6366f1' : '#1e293b'} strokeWidth={isSel ? 1.5 : 1} />
        {color && <rect x={-60} y={-6} width={12} height={12} rx={3} fill={val} stroke="#ffffff15" strokeWidth={.5} />}
        <text x={color ? -42 : -60} y={1} fill="#e2e8f0" fontSize={10} fontWeight={500} dominantBaseline="middle">{tok.name.length > 14 ? tok.name.slice(0, 13) + '\u2026' : tok.name}</text>
        <text x={-60} y={13} fill="#64748b" fontSize={8} dominantBaseline="middle">{tok.tier}</text>
      </g>
    );
  };

  return (
    <div className={`h-screen flex flex-col bg-[#0c0e12] text-slate-300 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}>
      <style>{`
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:#334155}
        *{scrollbar-width:thin;scrollbar-color:#1e293b transparent}
        .tok-fade-in{animation:tokFadeIn .3s ease}
        @keyframes tokFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* ===== TOP BAR ===== */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-[#0e1015] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-violet-600" />
          <span className="text-sm font-semibold text-white tracking-tight">Token IDE</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">v2.0</span>
        </div>

        <div className="flex-1" />

        {/* theme / platform selectors */}
        <div className="flex items-center gap-1.5 text-[10.5px]">
          {themes.map(t => (
            <button key={t} onClick={() => setTheme(t)}
              className={`px-2 py-1 rounded transition-colors ${theme === t ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >{t}</button>
          ))}
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1.5 text-[10.5px]">
          {platforms.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-2 py-1 rounded transition-colors ${platform === p ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >{p}</button>
          ))}
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1 text-slate-500">
          <button onClick={() => setCanvasMode('matrix')} className={`p-1 rounded transition-colors ${canvasMode === 'matrix' ? 'bg-white/10 text-white' : 'hover:text-slate-300'}`}>{I.grid}</button>
          <button onClick={() => setCanvasMode('graph')} className={`p-1 rounded transition-colors ${canvasMode === 'graph' ? 'bg-white/10 text-white' : 'hover:text-slate-300'}`}>{I.graph}</button>
        </div>
      </header>

      {/* ===== MAIN 3-PANE ===== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ---- LEFT: Navigator tree ---- */}
        <aside className="w-56 flex-shrink-0 border-r border-white/5 flex flex-col bg-[#0d0f14]">
          {/* search */}
          <div className="px-2 py-2 border-b border-white/5">
            <div className="flex items-center gap-1.5 bg-white/5 rounded px-2 py-1.5 text-slate-500 focus-within:ring-1 focus-within:ring-indigo-500/50">
              {I.search}
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tokens..."
                className="bg-transparent text-[11px] text-slate-300 outline-none flex-1 placeholder:text-slate-600" />
              {search && <button onClick={() => setSearch('')} className="text-slate-600 hover:text-slate-400">{I.close}</button>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {/* Primitives */}
            <TreeSection id="primitives" label="Primitives" badge={primitives.length}>
              {Object.entries(primGroups).map(([group, toks]) => (
                <TreeGroup key={group} id={group} label={group}>
                  {toks.map(t => <Leaf key={t.id} id={t.id} name={t.name} tier="primitive" />)}
                </TreeGroup>
              ))}
            </TreeSection>

            {/* Semantics */}
            <TreeSection id="semantics" label="Semantics" badge={semantics.length}>
              {Object.entries(semCats).map(([cat, toks]) => (
                <TreeGroup key={cat} id={cat} label={cat}>
                  {toks.map(t => <Leaf key={t.id} id={t.id} name={t.name} tier="semantic" />)}
                </TreeGroup>
              ))}
            </TreeSection>

            {/* Components */}
            <TreeSection id="components" label="Components" badge={components.length}>
              {Object.entries(compGroups).map(([comp, toks]) => (
                <TreeGroup key={comp} id={comp} label={comp}>
                  {toks.map(t => <Leaf key={t.id} id={t.id} name={t.name} tier="component" />)}
                </TreeGroup>
              ))}
            </TreeSection>

            {/* Orphans */}
            {orphans.length > 0 && (
              <div className="mt-2 mx-2 rounded bg-amber-500/5 border border-amber-500/10 p-2">
                <button onClick={() => setShowOrphans(!showOrphans)} className="flex items-center gap-1.5 text-[10px] text-amber-400 font-medium w-full">
                  {I.warn}
                  <span>{orphans.length} orphan{orphans.length > 1 ? 's' : ''}</span>
                  <span className={`ml-auto transition-transform ${showOrphans ? 'rotate-180' : ''}`}>{I.chevD}</span>
                </button>
                {showOrphans && (
                  <div className="mt-1.5 space-y-0.5">
                    {orphans.map(o => <Leaf key={o.id} id={o.id} name={o.name} tier="primitive" />)}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ---- CENTER: Canvas ---- */}
        <main className="flex-1 overflow-auto bg-[#0c0e12] relative">
          {canvasMode === 'matrix' ? (
            /* ----- MATRIX VIEW ----- */
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#0e1015]">
                <tr className="border-b border-white/5">
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Token</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tier</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Value ({theme}/{platform})</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[.03]">
                {primitives.filter(filterTok).map(t => <MatrixRow key={t.id} tok={tokenMap[t.id]} tier="primitive" />)}
                {semantics.filter(filterTok).map(t => <MatrixRow key={t.id} tok={tokenMap[t.id]} tier="semantic" />)}
                {components.filter(filterTok).map(t => <MatrixRow key={t.id} tok={tokenMap[t.id]} tier="component" />)}
              </tbody>
            </table>
          ) : (
            /* ----- GRAPH VIEW ----- */
            <div className="flex items-center justify-center h-full">
              {!selectedId ? (
                <p className="text-slate-600 text-sm">Select a token to see its graph</p>
              ) : (
                <svg width={700} height={400} className="tok-fade-in">
                  {/* edges */}
                  {graphNodes.prims.map((p, i) =>
                    graphNodes.sems.map((s, j) => (
                      <line key={`${p.id}-${s.id}`}
                        x1={120} y1={60 + i * 50} x2={350} y2={60 + j * 50}
                        stroke="#334155" strokeWidth={1} strokeDasharray="4 3" />
                    )),
                  )}
                  {graphNodes.sems.map((s, i) =>
                    graphNodes.comps.map((c, j) => (
                      <line key={`${s.id}-${c.id}`}
                        x1={350} y1={60 + i * 50} x2={580} y2={60 + j * 50}
                        stroke="#334155" strokeWidth={1} strokeDasharray="4 3" />
                    )),
                  )}
                  {/* tier labels */}
                  <text x={120} y={25} fill="#475569" fontSize={10} textAnchor="middle" fontWeight={600}>PRIMITIVE</text>
                  <text x={350} y={25} fill="#475569" fontSize={10} textAnchor="middle" fontWeight={600}>SEMANTIC</text>
                  <text x={580} y={25} fill="#475569" fontSize={10} textAnchor="middle" fontWeight={600}>COMPONENT</text>
                  {/* nodes */}
                  {graphNodes.prims.map((t, i) => <GNode key={t.id} tok={t} x={120} y={60 + i * 50} />)}
                  {graphNodes.sems.map((t, i) => <GNode key={t.id} tok={t} x={350} y={60 + i * 50} />)}
                  {graphNodes.comps.map((t, i) => <GNode key={t.id} tok={t} x={580} y={60 + i * 50} />)}
                </svg>
              )}
            </div>
          )}
        </main>

        {/* ---- RIGHT: Inspector ---- */}
        {inspectorOpen && selected && (
          <aside className="w-72 flex-shrink-0 border-l border-white/5 bg-[#0d0f14] overflow-y-auto tok-fade-in">
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white">Inspector</span>
              <button onClick={() => setInspectorOpen(false)} className="text-slate-600 hover:text-slate-400 transition-colors">{I.close}</button>
            </div>

            <div className="p-3 space-y-4">
              {/* identity */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {isColor(resolveValue(tokenMap, selected.id, theme, platform)) && (
                    <span className="w-8 h-8 rounded-md border border-white/10" style={{ background: resolveValue(tokenMap, selected.id, theme, platform) }} />
                  )}
                  <div>
                    <p className="text-[13px] text-white font-semibold">{selected.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{selected.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border ${tierBgLight[selected.tier]}`}>{selected.tier}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700">{selected.type}</span>
                </div>
              </div>

              {/* resolved value */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Resolved Value</p>
                <div className="bg-white/[.03] rounded-md px-3 py-2 font-mono text-xs text-white">
                  {resolveValue(tokenMap, selected.id, theme, platform)}
                </div>
              </div>

              {/* cascade */}
              {cascade.length > 1 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Cascade</p>
                  <div className="space-y-1">
                    {cascade.map((step, i) => (
                      <div key={step.id} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-slate-600 text-[10px]">{I.arrow}</span>}
                        <button onClick={() => handleSelect(step.id)}
                          className={`text-[10.5px] px-1.5 py-0.5 rounded font-medium transition-colors ${step.id === selectedId ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          {step.name}
                        </button>
                        <span className={`text-[8px] px-1 py-0.5 rounded-full ${tierBgLight[step.tier]}`}>{step.tier.slice(0, 4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* upstream references */}
              {upstream.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Referenced By ({upstream.length})</p>
                  <div className="space-y-0.5">
                    {upstream.map(u => (
                      <button key={u.id} onClick={() => handleSelect(u.id)}
                        className="w-full text-left flex items-center gap-2 px-2 py-1 text-[10.5px] rounded hover:bg-white/5 transition-colors text-slate-400"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tierBg[u.tier]}`} />
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* code snippets */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Code</p>
                <div className="space-y-1.5">
                  {Object.entries(codeSnippets).map(([lang, code]) => (
                    <div key={lang} className="group relative bg-white/[.03] rounded-md overflow-hidden">
                      <div className="flex items-center justify-between px-2 py-1 border-b border-white/5">
                        <span className="text-[9px] uppercase font-semibold text-slate-600">{lang}</span>
                        <button onClick={() => doCopy(code, lang)}
                          className="text-slate-600 hover:text-slate-300 transition-colors"
                        >
                          {copied === lang ? I.check : I.copy}
                        </button>
                      </div>
                      <pre className="px-2 py-1.5 text-[10.5px] text-slate-300 font-mono overflow-x-auto">{code}</pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* version history */}
              {versionHistory.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">History</p>
                  <div className="space-y-1">
                    {versionHistory.map((v, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10.5px]">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5">{v.user}</span>
                        <div>
                          <p className="text-slate-400">{v.action}</p>
                          <p className="text-slate-600 text-[9.5px]">{v.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ===== BOTTOM STATUS BAR ===== */}
      <footer className="flex items-center gap-4 px-4 py-1.5 border-t border-white/5 bg-[#0e1015] text-[10px] text-slate-600 flex-shrink-0">
        <span>{primitives.length} primitives</span>
        <span>{semantics.length} semantics</span>
        <span>{components.length} components</span>
        <span className="ml-auto">{theme} / {platform}</span>
        {orphans.length > 0 && <span className="text-amber-500">{orphans.length} orphan{orphans.length > 1 ? 's' : ''}</span>}
        {selectedId && <span className="text-indigo-400">{selectedId}</span>}
      </footer>
    </div>
  );
}
