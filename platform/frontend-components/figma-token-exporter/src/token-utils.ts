import type { PrimitiveToken, SemanticToken, ComponentToken, ResolvedToken, CascadeStep } from './types';

export function buildTokenMap(
  primitives: PrimitiveToken[],
  semantics: SemanticToken[],
  components: ComponentToken[],
): Record<string, ResolvedToken> {
  const allTokens: ResolvedToken[] = [
    ...primitives.map(p => ({ ...p, tier: 'primitive' as const })),
    ...semantics.map(s => ({ ...s, tier: 'semantic' as const })),
    ...components.map(c => ({ ...c, tier: 'component' as const })),
  ];
  return Object.fromEntries(allTokens.map(t => [t.id, t]));
}

export function resolveValue(
  tokenMap: Record<string, ResolvedToken>,
  tokenId: string,
  theme = 'Light',
  platform = 'Web',
): string {
  const tok = tokenMap[tokenId];
  if (!tok) return '\u2014';
  if (tok.tier === 'primitive') {
    const val = tok as unknown as PrimitiveToken;
    return val.value[platform] || val.value['*'] || '\u2014';
  }
  const refMap = (tok as unknown as SemanticToken | ComponentToken).ref;
  const refId = refMap[theme] || refMap['*'];
  if (!refId) return '\u2014';
  return resolveValue(tokenMap, refId, theme, platform);
}

export function getCascade(
  tokenMap: Record<string, ResolvedToken>,
  tokenId: string,
  theme = 'Light',
): CascadeStep[] {
  const chain: CascadeStep[] = [];
  let current: string | null = tokenId;
  let depth = 0;
  while (current && depth < 10) {
    const tok = tokenMap[current];
    if (!tok) break;
    chain.push({ id: tok.id, name: tok.name || tok.id, tier: tok.tier });
    if (tok.tier === 'primitive') break;
    const refMap = (tok as unknown as SemanticToken | ComponentToken).ref;
    current = refMap?.[theme] || refMap?.['*'] || null;
    depth++;
  }
  return chain;
}

export function getUpstream(
  tokenMap: Record<string, ResolvedToken>,
  allTokens: ResolvedToken[],
  tokenId: string,
): ResolvedToken[] {
  return allTokens.filter(t => {
    if (t.tier === 'primitive') return false;
    const refs = Object.values((t as unknown as SemanticToken | ComponentToken).ref || {});
    return refs.includes(tokenId);
  });
}

export function getOrphans(
  primitives: PrimitiveToken[],
  semantics: SemanticToken[],
  components: ComponentToken[],
): PrimitiveToken[] {
  const referenced = new Set<string>();
  [...semantics, ...components].forEach(t => {
    Object.values((t as unknown as SemanticToken | ComponentToken).ref || {}).forEach(r => referenced.add(r));
  });
  return primitives.filter(p => !referenced.has(p.id));
}

export function genCode(
  tokenMap: Record<string, ResolvedToken>,
  tok: ResolvedToken,
  theme: string,
  platform: string,
): Record<string, string> {
  const val = resolveValue(tokenMap, tok.id, theme, platform);
  const varName = tok.name.replace(/[.\s]/g, '-');
  return {
    css: `--${varName}: ${val};`,
    tailwind: tok.type === 'color' ? `bg-[var(--${varName})]` : `[var(--${varName})]`,
    swift: tok.type === 'color' ? `Color("${varName}")` : `Token.${varName.replace(/-/g, '_')}`,
    js: `tokens.${varName.replace(/-/g, '.')}`,
  };
}

export function isColor(v: string | undefined): boolean {
  return !!v && (v.startsWith('#') || v.startsWith('rgb'));
}

export function getGraphNodes(
  tokenMap: Record<string, ResolvedToken>,
  semantics: SemanticToken[],
  components: ComponentToken[],
  selectedId: string,
): { prims: ResolvedToken[]; sems: ResolvedToken[]; comps: ResolvedToken[] } {
  const sel = tokenMap[selectedId];
  if (!sel) return { prims: [], sems: [], comps: [] };

  if (sel.tier === 'primitive') {
    const upSem = semantics.filter(s => Object.values(s.ref).includes(selectedId));
    const upSemIds = new Set(upSem.map(s => s.id));
    const upComp = components.filter(c =>
      Object.values(c.ref).some(r => r === selectedId || upSemIds.has(r)),
    );
    return {
      prims: [sel],
      sems: upSem.map(s => tokenMap[s.id]).filter(Boolean),
      comps: upComp.map(c => tokenMap[c.id]).filter(Boolean),
    };
  }

  if (sel.tier === 'semantic') {
    const semTok = sel as unknown as SemanticToken;
    const downPrims = [...new Set(Object.values(semTok.ref))]
      .map(id => tokenMap[id])
      .filter(Boolean);
    const upComp = components.filter(c => Object.values(c.ref).includes(selectedId));
    return {
      prims: downPrims,
      sems: [sel],
      comps: upComp.map(c => tokenMap[c.id]).filter(Boolean),
    };
  }

  const compTok = sel as unknown as ComponentToken;
  const refSems = [...new Set(Object.values(compTok.ref))]
    .map(id => tokenMap[id])
    .filter(Boolean);
  const refPrims = refSems.flatMap(s => {
    const semRef = (s as unknown as SemanticToken).ref;
    if (!semRef) return [];
    return [...new Set(Object.values(semRef))].map(id => tokenMap[id]).filter(Boolean);
  });
  return { prims: refPrims, sems: refSems, comps: [sel] };
}
