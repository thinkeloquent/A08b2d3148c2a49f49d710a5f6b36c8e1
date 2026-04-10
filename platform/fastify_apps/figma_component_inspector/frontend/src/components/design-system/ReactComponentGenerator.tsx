/**
 * REACT COMPONENT GENERATOR
 * ==========================
 *
 * Generates React JSX/TSX code from Figma component data, combining:
 *   - Component Atlas (variant details, code, CSS properties)
 *   - Token Export (fills, strokes, typography, layout per node)
 *   - File Schema (token adherence, linkage, coverage)
 *   - Figma File (document tree for child traversal)
 *
 * Sections:
 *   1. Component Selector — React Select with search, grouped by atlas category
 *   2. Render Mode — partial | partial_depth | fully | by_component | by_regex
 *   3. Component Code Generator — dark-theme code preview
 *   4. Dev Readiness Score — readiness assessment with category breakdowns
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Select, { type StylesConfig, type GroupBase } from 'react-select';
import {
  Copy, Check, AlertCircle, CheckCircle2,
  XCircle, Layers, GitBranch, Component as ComponentIcon, Regex,
  Code2, Image as ImageIcon, Paintbrush, Variable, Zap, FileText,
  ExternalLink, RefreshCw } from
'lucide-react';
import * as api from '../../services/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface VariantDetail {
  instances: number;
  health: number;
  status: 'compliant' | 'partial' | 'detached';
  tokensCovered: number;
  nodeId: string;
  states: Array<{name: string;props: Record<string, unknown>;instances: number;}>;
  tokens: string[];
  sizes: string[];
  code: string;
  htmlTag?: string;
  cssProperties?: Record<string, string>;
}

interface AtlasCategory {
  id: string;
  label: string;
  color: string;
  count: number;
  instances: number;
  health: number;
  components: string[];
}

interface AtlasData {
  categories: AtlasCategory[];
  variantDetails: Record<string, Record<string, VariantDetail>>;
  totals: {
    activeComponents: number;
    totalInstances: number;
    orphaned: number;
    detached: number;
    designHealth: number;
    totalNodes: number;
    pages: number;
    maxDepth: number;
  };
  governance: {
    tokenCompliance: number;
    namingConvention: number;
    documentation: number;
    devResources: number;
  };
  devResourceLinks: Array<{
    nodeId: string;
    name: string;
    url: string;
    linkType: string;
  }>;
}

interface TokenNode {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  path: string;
  fills?: Array<{type: string;hex: string;rgba: Record<string, number>;opacity?: number;variableId?: string;}>;
  strokes?: Array<{type: string;hex: string;}>;
  typography?: {
    fontFamily: string;
    fontWeight: number;
    fontSize: number;
    lineHeightPx: number;
    letterSpacing: number;
    textCase?: string | null;
    textDecoration?: string | null;
  };
  layout?: {
    layoutMode: string;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    itemSpacing?: number;
  };
  cornerRadius?: {value: number;};
  dimensions?: {width: number;height: number;};
}

interface TokenExportData {
  nodes: Record<string, TokenNode>;
  meta: {fileName: string;lastModified: string;version: string;nodeCount: number;nodesWithTokens: number;};
}

/** Figma document tree node. */
interface FigmaTreeNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaTreeNode[];
  [key: string]: unknown;
}

interface ReactComponentGeneratorProps {
  fileId: string;
}

/** React Select option for the component dropdown. */
interface CompOption {
  value: string; // "category::componentName"
  label: string;
  category: string;
  categoryLabel: string;
  color: string;
  status: 'compliant' | 'partial' | 'detached';
  instances: number;
}

type RenderMode = 'partial' | 'partial_depth' | 'fully' | 'by_component' | 'by_regex';

const RENDER_MODES: Array<{id: RenderMode;label: string;description: string;icon: typeof Layers;}> = [
{ id: 'partial', label: 'Partial', description: 'Selected component only, no children', icon: ComponentIcon },
{ id: 'partial_depth', label: 'Partial + Depth', description: 'Component + N levels of child elements', icon: GitBranch },
{ id: 'fully', label: 'Full Tree', description: 'All descendant elements rendered recursively', icon: Layers },
{ id: 'by_component', label: 'By Component', description: 'Group by Figma component type — render all', icon: ComponentIcon },
{ id: 'by_regex', label: 'Custom Regex Group', description: 'Group by user-provided regex — render all', icon: Regex }];


type CodeGenTab = 'code' | 'preview' | 'css' | 'tokens' | 'states' | 'metadata';

const CODE_GEN_TABS: Array<{id: CodeGenTab;label: string;icon: typeof Code2;}> = [
{ id: 'code', label: 'Code', icon: Code2 },
{ id: 'preview', label: 'Preview', icon: ImageIcon },
{ id: 'css', label: 'CSS', icon: Paintbrush },
{ id: 'tokens', label: 'Tokens', icon: Variable },
{ id: 'states', label: 'States', icon: Zap },
{ id: 'metadata', label: 'Metadata', icon: FileText }];


// ── Helpers ────────────────────────────────────────────────────────────────────

function pxToTwSpacing(px: number): string {
  const val = Math.round(px);
  const map: Record<number, string> = {
    0: '0', 1: 'px', 2: '0.5', 4: '1', 6: '1.5', 8: '2', 10: '2.5',
    12: '3', 14: '3.5', 16: '4', 20: '5', 24: '6', 28: '7', 32: '8',
    36: '9', 40: '10', 44: '11', 48: '12'
  };
  return map[val] || `[${val}px]`;
}

function extractHex(background: string): string | null {
  const match = background.match(/#[0-9a-fA-F]{3,8}/);
  if (match) return match[0];
  const rgbMatch = background.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `#${[r, g, b].map((v) => parseInt(v).toString(16).padStart(2, '0')).join('')}`;
  }
  return null;
}

function cssToTailwind(css: Record<string, string>): string[] {
  const tw: string[] = [];
  if (css.display === 'flex') {
    tw.push('flex');
    if (css.flexDirection === 'column') tw.push('flex-col');
    if (css.alignItems === 'center') tw.push('items-center');
    if (css.justifyContent === 'center') tw.push('justify-center');
  }
  if (css.gap) {const g = parseFloat(css.gap);if (g > 0) tw.push(`gap-${pxToTwSpacing(g)}`);}
  const pl = parseFloat(css.paddingLeft || '0');
  const pr = parseFloat(css.paddingRight || '0');
  const pt = parseFloat(css.paddingTop || '0');
  const pb = parseFloat(css.paddingBottom || '0');
  if (pl > 0 && pl === pr && pl === pt && pl === pb) {tw.push(`p-${pxToTwSpacing(pl)}`);} else
  {
    if (pl > 0 && pl === pr) tw.push(`px-${pxToTwSpacing(pl)}`);else
    {if (pl > 0) tw.push(`pl-${pxToTwSpacing(pl)}`);if (pr > 0) tw.push(`pr-${pxToTwSpacing(pr)}`);}
    if (pt > 0 && pt === pb) tw.push(`py-${pxToTwSpacing(pt)}`);else
    {if (pt > 0) tw.push(`pt-${pxToTwSpacing(pt)}`);if (pb > 0) tw.push(`pb-${pxToTwSpacing(pb)}`);}
  }
  if (css.borderRadius) {
    const r = parseFloat(css.borderRadius);
    if (r >= 9999) tw.push('rounded-full');else if (r >= 12) tw.push('rounded-xl');else
    if (r >= 8) tw.push('rounded-lg');else if (r >= 6) tw.push('rounded-md');else
    if (r >= 4) tw.push('rounded');else if (r >= 2) tw.push('rounded-sm');
  }
  if (css.background) {const hex = extractHex(css.background);if (hex) tw.push(`bg-[${hex}]`);}
  if (css.borderWidth) {const bw = parseFloat(css.borderWidth);if (bw > 0) tw.push(bw <= 1 ? 'border' : `border-${Math.round(bw)}`);}
  if (css.width) {const w = parseFloat(css.width);if (w > 0 && w < 800) tw.push(`w-[${Math.round(w)}px]`);}
  if (css.height) {const h = parseFloat(css.height);if (h > 0 && h < 800) tw.push(`h-[${Math.round(h)}px]`);}
  return tw;
}

function tokenNodeToTailwind(node: TokenNode): string[] {
  const tw: string[] = [];
  if (node.fills?.length) {
    const primary = node.fills.find((f) => f.type === 'SOLID' && (f.opacity ?? 1) > 0.5);
    if (primary?.hex) tw.push(`bg-[${primary.hex}]`);
  }
  if (node.typography) {
    const { fontSize, fontWeight, fontFamily } = node.typography;
    if (fontSize) {
      if (fontSize <= 12) tw.push('text-xs');else if (fontSize <= 14) tw.push('text-sm');else
      if (fontSize <= 16) tw.push('text-base');else if (fontSize <= 18) tw.push('text-lg');else
      if (fontSize <= 20) tw.push('text-xl');else if (fontSize <= 24) tw.push('text-2xl');else
      if (fontSize <= 30) tw.push('text-3xl');else tw.push('text-4xl');
    }
    if (fontWeight) {
      if (fontWeight >= 700) tw.push('font-bold');else if (fontWeight >= 600) tw.push('font-semibold');else
      if (fontWeight >= 500) tw.push('font-medium');
    }
    if (fontFamily) tw.push(`font-['${fontFamily}']`);
  }
  if (node.layout) {
    const { layoutMode, paddingLeft, paddingRight, paddingTop, paddingBottom, itemSpacing } = node.layout;
    if (layoutMode === 'HORIZONTAL') {tw.push('flex', 'flex-row');}
    if (layoutMode === 'VERTICAL') {tw.push('flex', 'flex-col');}
    if (paddingLeft && paddingLeft === paddingRight) tw.push(`px-${pxToTwSpacing(paddingLeft)}`);
    if (paddingTop && paddingTop === paddingBottom) tw.push(`py-${pxToTwSpacing(paddingTop)}`);
    if (itemSpacing) tw.push(`gap-${pxToTwSpacing(itemSpacing)}`);
  }
  if (node.cornerRadius?.value) {
    const r = node.cornerRadius.value;
    if (r >= 9999) tw.push('rounded-full');else if (r >= 12) tw.push('rounded-xl');else
    if (r >= 8) tw.push('rounded-lg');else if (r >= 6) tw.push('rounded-md');else
    if (r >= 4) tw.push('rounded');else if (r >= 2) tw.push('rounded-sm');
  }
  return tw;
}

function toPascalCase(name: string): string {
  return name.replace(/[^a-zA-Z0-9\s_-]/g, '').split(/[\s_-]+/).filter(Boolean).
  map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

/** Merge CSS-derived and token-derived Tailwind classes, deduping by prefix. */
function mergeTailwind(cssTw: string[], tokenTw: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const cls of [...tokenTw, ...cssTw]) {
    const prefix = cls.split('-')[0].replace(/^(hover|focus|active):/, '');
    if (!seen.has(prefix) || cls.includes(':')) {seen.add(prefix);result.push(cls);}
  }
  return result;
}

/** Determine HTML tag for a Figma node type. */
function figmaTypeToTag(type: string, name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('button') || lower.includes('btn')) return 'button';
  if (lower.includes('input') || lower.includes('field')) return 'input';
  if (lower.includes('image') || lower.includes('img') || lower.includes('avatar')) return 'img';
  if (type === 'TEXT') return 'span';
  if (type === 'VECTOR' || type === 'LINE') return 'svg';
  return 'div';
}

/** Find a node by ID in the Figma tree. */
function findNodeById(root: FigmaTreeNode, id: string): FigmaTreeNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

/** Collect all nodes matching a regex on their name, grouped by match. */
function collectByRegex(root: FigmaTreeNode, regex: RegExp): Map<string, FigmaTreeNode[]> {
  const groups = new Map<string, FigmaTreeNode[]>();
  function walk(node: FigmaTreeNode) {
    const match = node.name.match(regex);
    if (match) {
      const key = match[0];
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(node);
    }
    for (const child of node.children ?? []) walk(child);
  }
  walk(root);
  return groups;
}

/** Collect all nodes grouped by Figma node type (COMPONENT, COMPONENT_SET, INSTANCE, etc.). */
function collectByComponentType(root: FigmaTreeNode): Map<string, FigmaTreeNode[]> {
  const groups = new Map<string, FigmaTreeNode[]>();
  function walk(node: FigmaTreeNode) {
    const t = node.type;
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t)!.push(node);
    for (const child of node.children ?? []) walk(child);
  }
  walk(root);
  return groups;
}

/** Find the atlas variant for a given tree node. */
function findVariantForNode(node: FigmaTreeNode, atlas: AtlasData | null): VariantDetail | null {
  if (!atlas) return null;
  for (const cat of atlas.categories) {
    const vd = atlas.variantDetails[cat.id]?.[node.name];
    if (vd && vd.nodeId === node.id) return vd;
  }
  return null;
}

/**
 * Collect all tree nodes relevant to the current render mode.
 *
 * - partial:       root + direct children (children shown in States/Metadata)
 * - partial_depth: root + descendants up to `depth` levels
 * - fully:         root + all descendants recursively
 */
function collectNodesForMode(
root: FigmaTreeNode,
mode: RenderMode,
depth: number)
: FigmaTreeNode[] {
  const nodes: FigmaTreeNode[] = [root];
  if (mode === 'partial') {
    for (const child of root.children ?? []) nodes.push(child);
    return nodes;
  }
  const maxDepth = mode === 'partial_depth' ? depth : -1;
  function walk(node: FigmaTreeNode, currentDepth: number) {
    if (maxDepth !== -1 && currentDepth >= maxDepth) return;
    for (const child of node.children ?? []) {
      nodes.push(child);
      walk(child, currentDepth + 1);
    }
  }
  walk(root, 0);
  return nodes;
}

// ── Code Generation ────────────────────────────────────────────────────────────

/** Generate JSX lines for a single node (one element, no children recursion). */
function nodeToJsx(
node: FigmaTreeNode,
tokenNodes: Record<string, TokenNode>,
atlasVariant: VariantDetail | null,
indent: number)
: string[] {
  const pad = '  '.repeat(indent);
  const tag = figmaTypeToTag(node.type, node.name);
  const tokenNode = tokenNodes[node.id];

  // Build tailwind classes
  const cssTw = atlasVariant?.cssProperties ? cssToTailwind(atlasVariant.cssProperties) : [];
  const tokenTw = tokenNode ? tokenNodeToTailwind(tokenNode) : [];
  const tw = mergeTailwind(cssTw, tokenTw);

  if (tag === 'img') {
    return [`${pad}<img className="${tw.join(' ')}" alt="${node.name}" />`];
  }
  if (tag === 'svg') {
    return [`${pad}<svg className="${tw.join(' ')}">{/* ${node.name} */}</svg>`];
  }
  if (tag === 'input') {
    return [`${pad}<input className="${tw.join(' ')}" placeholder="${node.name}" />`];
  }
  if (node.type === 'TEXT') {
    const text = (node as any).characters || node.name;
    if (tw.length === 0) return [`${pad}<span>${text}</span>`];
    return [`${pad}<span className="${tw.join(' ')}">${text}</span>`];
  }
  return tw.length > 0 ?
  [`${pad}<${tag} className="${tw.join(' ')}">`] :
  [`${pad}<${tag}>`];
}

/** Recursively generate JSX for a tree node and its children up to maxDepth. */
function treeToJsx(
node: FigmaTreeNode,
tokenNodes: Record<string, TokenNode>,
atlas: AtlasData | null,
indent: number,
currentDepth: number,
maxDepth // -1 = unlimited
: number): string[] {
  const pad = '  '.repeat(indent);
  const tag = figmaTypeToTag(node.type, node.name);

  // Find atlas variant for this node
  let variant: VariantDetail | null = null;
  if (atlas) {
    for (const cat of atlas.categories) {
      const vd = atlas.variantDetails[cat.id]?.[node.name];
      if (vd && vd.nodeId === node.id) {variant = vd;break;}
    }
  }

  const opening = nodeToJsx(node, tokenNodes, variant, indent);
  const isVoid = ['img', 'input', 'svg'].includes(tag) || node.type === 'TEXT';
  if (isVoid) return opening;

  const children = node.children ?? [];
  const atLimit = maxDepth !== -1 && currentDepth >= maxDepth;

  if (children.length === 0 || atLimit) {
    if (children.length > 0 && atLimit) {
      return [
      ...opening,
      `${pad}  {/* ${children.length} children (depth limit) */}`,
      `${pad}</${tag}>`];

    }
    return [
    ...opening,
    `${pad}  {children}`,
    `${pad}</${tag}>`];

  }

  const lines = [...opening];
  for (const child of children) {
    lines.push(...treeToJsx(child, tokenNodes, atlas, indent + 1, currentDepth + 1, maxDepth));
  }
  lines.push(`${pad}</${tag}>`);
  return lines;
}

/** Generate a full React component file for a single component. */
function generateSingleComponent(
name: string,
variant: VariantDetail,
treeNode: FigmaTreeNode | null,
tokenNodes: Record<string, TokenNode>,
atlas: AtlasData | null,
mode: RenderMode,
depth: number)
: string {
  const compName = toPascalCase(name);
  const lines: string[] = [`import React from 'react';`, ''];

  const maxDepth = mode === 'partial' ? 0 : mode === 'partial_depth' ? depth : -1;

  if (treeNode) {
    const jsxLines = treeToJsx(treeNode, tokenNodes, atlas, 2, 0, maxDepth);
    lines.push(`function ${compName}({ children }) {`);
    lines.push('  return (');
    lines.push(...jsxLines);
    lines.push('  );');
    lines.push('}');
  } else {
    // Fallback: no tree node found, use variant CSS only
    const tag = variant.htmlTag === 'Flex' ? 'div' : (variant.htmlTag || 'div').toLowerCase();
    const cssTw = variant.cssProperties ? cssToTailwind(variant.cssProperties) : [];
    const tokenTw = tokenNodes[variant.nodeId] ? tokenNodeToTailwind(tokenNodes[variant.nodeId]) : [];
    const tw = mergeTailwind(cssTw, tokenTw);
    if (variant.status === 'compliant') {
      if (!tw.some((c) => c.startsWith('hover:'))) tw.push('hover:opacity-90');
      if (!tw.some((c) => c.startsWith('focus:'))) tw.push('focus:outline-none', 'focus:ring-2');
    }
    lines.push(`function ${compName}({ children }) {`);
    lines.push('  return (');
    lines.push(`    <${tag}`);
    lines.push(`      className="${tw.join('\n            ')}"`);
    lines.push('    >');
    lines.push('      {children}');
    lines.push(`    </${tag}>`);
    lines.push('  );');
    lines.push('}');
  }

  lines.push('', `export default ${compName};`);
  return lines.join('\n');
}

/** Generate multi-component file for by_component or by_regex modes. */
function generateGroupedComponents(
groups: Map<string, FigmaTreeNode[]>,
tokenNodes: Record<string, TokenNode>,
atlas: AtlasData | null,
mode: 'by_component' | 'by_regex')
: string {
  const lines: string[] = [`import React from 'react';`, ''];

  for (const [groupKey, nodes] of groups) {
    const groupName = toPascalCase(groupKey);
    if (nodes.length === 0) continue;

    lines.push(`// ── ${groupKey} (${nodes.length} nodes) ──`, '');

    // Generate up to 10 components per group to keep output manageable
    const slice = nodes.slice(0, 10);
    for (const node of slice) {
      const compName = toPascalCase(node.name) || `${groupName}Node`;
      // Dedupe name if needed
      const jsxLines = treeToJsx(node, tokenNodes, atlas, 2, 0, 2); // depth 2 for grouped
      lines.push(`export function ${compName}({ children }) {`);
      lines.push('  return (');
      lines.push(...jsxLines);
      lines.push('  );');
      lines.push('}', '');
    }

    if (nodes.length > 10) {
      lines.push(`// ... +${nodes.length - 10} more ${groupKey} nodes`, '');
    }
  }

  return lines.join('\n');
}

/** Generate raw CSS block from a variant's cssProperties + token node data. */
function generateCssBlock(
componentName: string,
variant: VariantDetail,
tokenNode?: TokenNode)
: string {
  const selector = `.${componentName.replace(/\s+/g, '-').toLowerCase()}`;
  const props: string[] = [];

  // From variant cssProperties
  if (variant.cssProperties) {
    for (const [key, val] of Object.entries(variant.cssProperties)) {
      const cssProp = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      props.push(`  ${cssProp}: ${val};`);
    }
  }

  // Enrich from token node
  if (tokenNode) {
    if (tokenNode.fills?.length) {
      const primary = tokenNode.fills.find((f) => f.type === 'SOLID' && (f.opacity ?? 1) > 0.5);
      if (primary?.hex && !props.some((p) => p.includes('background'))) {
        props.push(`  background-color: ${primary.hex};`);
      }
      if (primary && primary.opacity !== undefined && primary.opacity < 1) {
        props.push(`  opacity: ${primary.opacity};`);
      }
    }
    if (tokenNode.strokes?.length) {
      const stroke = tokenNode.strokes[0];
      if (stroke?.hex) props.push(`  border-color: ${stroke.hex};`);
    }
    if (tokenNode.typography) {
      const t = tokenNode.typography;
      if (t.fontFamily && !props.some((p) => p.includes('font-family'))) props.push(`  font-family: '${t.fontFamily}', sans-serif;`);
      if (t.fontSize && !props.some((p) => p.includes('font-size'))) props.push(`  font-size: ${t.fontSize}px;`);
      if (t.fontWeight && !props.some((p) => p.includes('font-weight'))) props.push(`  font-weight: ${t.fontWeight};`);
      if (t.lineHeightPx && !props.some((p) => p.includes('line-height'))) props.push(`  line-height: ${Math.round(t.lineHeightPx)}px;`);
      if (t.letterSpacing && !props.some((p) => p.includes('letter-spacing'))) props.push(`  letter-spacing: ${t.letterSpacing.toFixed(2)}px;`);
      if (t.textCase) props.push(`  text-transform: ${t.textCase.toLowerCase()};`);
      if (t.textDecoration) props.push(`  text-decoration: ${t.textDecoration.toLowerCase()};`);
    }
    if (tokenNode.layout) {
      const l = tokenNode.layout;
      if (l.layoutMode === 'HORIZONTAL' && !props.some((p) => p.includes('display'))) {props.push('  display: flex;');props.push('  flex-direction: row;');}
      if (l.layoutMode === 'VERTICAL' && !props.some((p) => p.includes('display'))) {props.push('  display: flex;');props.push('  flex-direction: column;');}
      if (l.paddingLeft != null && !props.some((p) => p.includes('padding-left'))) props.push(`  padding-left: ${l.paddingLeft}px;`);
      if (l.paddingRight != null && !props.some((p) => p.includes('padding-right'))) props.push(`  padding-right: ${l.paddingRight}px;`);
      if (l.paddingTop != null && !props.some((p) => p.includes('padding-top'))) props.push(`  padding-top: ${l.paddingTop}px;`);
      if (l.paddingBottom != null && !props.some((p) => p.includes('padding-bottom'))) props.push(`  padding-bottom: ${l.paddingBottom}px;`);
      if (l.itemSpacing != null && !props.some((p) => p.includes('gap'))) props.push(`  gap: ${l.itemSpacing}px;`);
    }
    if (tokenNode.cornerRadius?.value && !props.some((p) => p.includes('border-radius'))) {
      props.push(`  border-radius: ${tokenNode.cornerRadius.value}px;`);
    }
    if (tokenNode.dimensions) {
      if (!props.some((p) => p.includes('width'))) props.push(`  width: ${Math.round(tokenNode.dimensions.width)}px;`);
      if (!props.some((p) => p.includes('height'))) props.push(`  height: ${Math.round(tokenNode.dimensions.height)}px;`);
    }
  }

  return `${selector} {\n${props.join('\n')}\n}`;
}

// ── React Select styles ────────────────────────────────────────────────────────

const compSelectStyles: StylesConfig<CompOption, false, GroupBase<CompOption>> = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    fontSize: '0.875rem',
    borderColor: state.isFocused ? '#22C55E' : '#E5E7EB',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(34,197,94,0.2)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#22C55E' : '#D1D5DB' },
    borderRadius: 10,
    backgroundColor: '#fff'
  }),
  valueContainer: (base) => ({ ...base, padding: '2px 10px' }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, padding: '0 8px', color: '#9CA3AF' }),
  placeholder: (base) => ({ ...base, color: '#9CA3AF' }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.8125rem',
    padding: '8px 12px',
    backgroundColor: state.isSelected ? '#22C55E' : state.isFocused ? '#F0FDF4' : 'transparent',
    color: state.isSelected ? '#fff' : '#374151',
    '&:active': { backgroundColor: '#DCFCE7' }
  }),
  groupHeading: (base) => ({
    ...base,
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#6B7280',
    padding: '6px 12px 4px'
  }),
  menu: (base) => ({ ...base, borderRadius: 10, overflow: 'hidden', zIndex: 30, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }),
  menuList: (base) => ({ ...base, maxHeight: 320, padding: 0 }),
  singleValue: (base) => ({ ...base, fontSize: '0.875rem' })
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreBadge({ value, size = 'md' }: {value: number;size?: 'sm' | 'md' | 'lg';}) {
  const color = value >= 80 ? 'text-green-600' : value >= 50 ? 'text-yellow-600' : 'text-red-600';
  const bgColor = value >= 80 ? 'bg-green-50 border-green-200' : value >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  const sz = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-12 h-12 text-base' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sz} ${bgColor} ${color} border-2 rounded-full flex items-center justify-center font-bold`}>
      {Math.round(value)}%
    </div>);

}

function ReadinessCategory({ label, percentage, description }: {label: string;percentage: number;description: string;}) {
  const Icon = percentage >= 80 ? CheckCircle2 : XCircle;
  const iconColor = percentage >= 80 ? 'text-green-500' : 'text-red-500';
  const badgeColor = percentage >= 80 ? 'bg-green-100 text-green-700' : percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{label}</span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${badgeColor}`}>{Math.round(percentage)}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>);

}

function ReadinessBar({ segments }: {segments: Array<{label: string;value: number;color: string;}>;}) {
  const total = segments.reduce((s, seg) => s + Math.max(seg.value, 5), 0);
  return (
    <div className="space-y-1.5">
      <div className="flex h-4 rounded-full overflow-hidden">
        {segments.map((seg) =>
        <div key={seg.label} className="h-full transition-all"
        style={{ width: `${Math.max(seg.value, 5) / total * 100}%`, backgroundColor: seg.color }}
        title={`${seg.label}: ${Math.round(seg.value)}%`} />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
        {segments.map((seg) => <span key={seg.label}>{seg.label}</span>)}
      </div>
    </div>);

}

function DoItem({ text }: {text: string;}) {
  return (
    <li className="flex items-start gap-2 text-xs text-gray-700">
      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </li>);

}

function DontItem({ text }: {text: string;}) {
  return (
    <li className="flex items-start gap-2 text-xs text-gray-700">
      <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </li>);

}

/** Token data section with title and items. */
function TokenSection({ title, items


}: {title: string;items: Array<{label: string;entries: Array<[string, string]>;swatch?: string;}>;}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map((item, i) =>
        <div key={i} className="bg-gray-50 rounded-lg border border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              {item.swatch &&
            <span className="w-4 h-4 rounded border border-gray-200 flex-shrink-0" style={{ backgroundColor: item.swatch }} />
            }
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {item.entries.map(([key, val]) =>
            <div key={key} className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-400 w-20 flex-shrink-0">{key}</span>
                  <span className="font-mono text-gray-600 truncate">{val}</span>
                </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>);

}

/** Metadata label-value row. */
function MetaRow({ label, value, mono, badge }: {label: string;value: string;mono?: boolean;badge?: 'green' | 'yellow' | 'red';}) {
  const badgeCls = badge === 'green' ? 'bg-green-100 text-green-700' : badge === 'yellow' ? 'bg-yellow-100 text-yellow-700' : badge === 'red' ? 'bg-red-100 text-red-700' : '';
  return (
    <div className="flex items-center gap-2 text-xs py-1">
      <span className="text-gray-400 w-28 flex-shrink-0">{label}</span>
      {badge ?
      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${badgeCls}`}>{value}</span> :

      <span className={`text-gray-700 truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
      }
    </div>);

}

/** Governance score mini card. */
function GovernanceCard({ label, value }: {label: string;value: number;}) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';
  const bg = pct >= 80 ? 'bg-green-50 border-green-200' : pct >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  return (
    <div className={`${bg} border rounded-lg px-3 py-2 flex items-center justify-between`}>
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{pct}%</span>
    </div>);

}

/** Syntax-highlighted CSS line for the dark theme preview. */
function CssLine({ line }: {line: string;}) {
  const parts: Array<{type: string;text: string;}> = [];
  // Match: selectors, properties, values, braces, comments
  const regex = /(\.[a-zA-Z][\w-]*)|([a-z-]+)(?=\s*:)|(:\s*)([^;]+)(;)|(\/\*.*?\*\/)|([{}])/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'plain', text: line.slice(lastIndex, match.index) });
    if (match[1]) parts.push({ type: 'selector', text: match[0] });else
    if (match[2]) {parts.push({ type: 'property', text: match[2] });} else
    if (match[3] && match[4] && match[5]) {parts.push({ type: 'plain', text: match[3] });parts.push({ type: 'value', text: match[4] });parts.push({ type: 'plain', text: match[5] });} else
    if (match[6]) parts.push({ type: 'comment', text: match[0] });else
    if (match[7]) parts.push({ type: 'brace', text: match[0] });else
    parts.push({ type: 'plain', text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) parts.push({ type: 'plain', text: line.slice(lastIndex) });

  const colorMap: Record<string, string> = {
    selector: 'text-yellow-300', property: 'text-blue-400', value: 'text-green-400',
    brace: 'text-gray-400', comment: 'text-gray-600', plain: 'text-gray-300'
  };
  return (
    <code className="flex-1">
      {parts.map((p, i) => <span key={i} className={colorMap[p.type] || 'text-gray-300'}>{p.text}</span>)}
    </code>);

}

/** Syntax-highlighted code line for the dark theme preview. */
function CodeLine({ line }: {line: string;}) {
  const parts: Array<{type: string;text: string;}> = [];
  const regex = /\b(import|from|function|return|export|default|const|let)\b|('[^']*')|(className)|(<\/?[a-zA-Z]+)|(\{[^}]+\})/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'plain', text: line.slice(lastIndex, match.index) });
    if (match[1]) parts.push({ type: 'keyword', text: match[0] });else
    if (match[2]) parts.push({ type: 'string', text: match[0] });else
    if (match[3]) parts.push({ type: 'attr', text: match[0] });else
    if (match[4]) parts.push({ type: 'tag', text: match[0] });else
    if (match[5]) parts.push({ type: 'expr', text: match[0] });else
    parts.push({ type: 'plain', text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) parts.push({ type: 'plain', text: line.slice(lastIndex) });

  const colorMap: Record<string, string> = {
    keyword: 'text-purple-400', string: 'text-green-400', attr: 'text-yellow-300',
    tag: 'text-blue-400', expr: 'text-cyan-300', plain: 'text-gray-300'
  };
  return (
    <code className="flex-1">
      {parts.map((p, i) => <span key={i} className={colorMap[p.type] || 'text-gray-300'}>{p.text}</span>)}
    </code>);

}

/** Custom formatOptionLabel for the component react-select. */
function CompOptionLabel({ data }: {data: CompOption;}) {
  const statusColor = data.status === 'compliant' ? 'bg-green-400' : data.status === 'partial' ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: data.color }} />
      <span className="truncate">{data.label}</span>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor}`} />
      <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">{data.instances}x</span>
    </div>);

}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ReactComponentGenerator({ fileId }: ReactComponentGeneratorProps) {
  const [atlas, setAtlas] = useState<AtlasData | null>(null);
  const [tokenExport, setTokenExport] = useState<TokenExportData | null>(null);
  const [schema, setSchema] = useState<api.FileSchemaSummary | null>(null);
  const [fileTree, setFileTree] = useState<FigmaTreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Selection state
  const [selectedOption, setSelectedOption] = useState<CompOption | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>('partial');
  const [depthLimit, setDepthLimit] = useState(2);
  const [regexPattern, setRegexPattern] = useState('');
  const [regexError, setRegexError] = useState('');
  const [codeGenTab, setCodeGenTab] = useState<CodeGenTab>('code');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewIsPlaceholder, setPreviewIsPlaceholder] = useState(false);
  const [previewLoadError, setPreviewLoadError] = useState(false);
  const [previewDecoding, setPreviewDecoding] = useState(false);

  // Fetch all four data sources in parallel
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!fileId) return;
      setLoading(true);
      setError('');
      try {
        const [atlasData, tokenData, schemaData, fileData] = await Promise.all([
        api.getComponentAtlas(fileId) as Promise<AtlasData>,
        api.getTokenExport(fileId),
        api.getFileSchema(fileId),
        api.getFigmaFile(fileId) as Promise<any>]
        );
        if (!active) return;
        setAtlas(atlasData);
        setTokenExport(tokenData);
        setSchema(schemaData);
        setFileTree(fileData?.document ?? null);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Failed to load data');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {active = false;};
  }, [fileId]);

  // Build grouped options for React Select
  const selectGroups = useMemo(() => {
    if (!atlas) return [];
    return atlas.categories.
    filter((cat) => cat.components.some((c) => atlas.variantDetails[cat.id]?.[c])).
    map((cat) => ({
      label: `${cat.label} (${cat.components.length})`,
      options: cat.components.
      filter((c) => atlas.variantDetails[cat.id]?.[c]).
      map((comp): CompOption => {
        const vd = atlas.variantDetails[cat.id][comp];
        return {
          value: `${cat.id}::${comp}`,
          label: comp,
          category: cat.id,
          categoryLabel: cat.label,
          color: cat.color,
          status: vd.status,
          instances: vd.instances
        };
      })
    }));
  }, [atlas]);

  // Auto-select first option
  useEffect(() => {
    if (!selectedOption && selectGroups.length > 0 && selectGroups[0].options.length > 0) {
      setSelectedOption(selectGroups[0].options[0]);
    }
  }, [selectGroups, selectedOption]);

  // Flatten all component options for readiness calculations
  const allOptions = useMemo(() => selectGroups.flatMap((g) => g.options), [selectGroups]);

  // Current variant detail
  const currentVariant = useMemo(() => {
    if (!atlas || !selectedOption) return null;
    return atlas.variantDetails[selectedOption.category]?.[selectedOption.label] ?? null;
  }, [atlas, selectedOption]);

  // Locate the tree node for the selected component
  const currentTreeNode = useMemo(() => {
    if (!fileTree || !currentVariant) return null;
    return findNodeById(fileTree, currentVariant.nodeId);
  }, [fileTree, currentVariant]);

  // Parsed regex
  const parsedRegex = useMemo(() => {
    if (renderMode !== 'by_regex' || !regexPattern.trim()) return null;
    try {
      const rx = new RegExp(regexPattern, 'i');
      setRegexError('');
      return rx;
    } catch (e: any) {
      setRegexError(e?.message || 'Invalid regex');
      return null;
    }
  }, [renderMode, regexPattern]);

  const isGroupMode = renderMode === 'by_component' || renderMode === 'by_regex';

  // Nodes relevant to the current render mode (non-group modes)
  const modeNodes = useMemo(() => {
    if (isGroupMode || !currentTreeNode) return [];
    return collectNodesForMode(currentTreeNode, renderMode, depthLimit);
  }, [currentTreeNode, renderMode, depthLimit, isGroupMode]);

  // Grouped nodes for by_component / by_regex modes
  const modeGroups = useMemo(() => {
    if (!fileTree) return new Map<string, FigmaTreeNode[]>();
    if (renderMode === 'by_component') {
      const groups = collectByComponentType(fileTree);
      const interesting = new Map<string, FigmaTreeNode[]>();
      for (const [type, list] of groups) {
        if (['COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'FRAME', 'TEXT'].includes(type)) {
          interesting.set(type, list);
        }
      }
      return interesting;
    }
    if (renderMode === 'by_regex' && parsedRegex) {
      return collectByRegex(fileTree, parsedRegex);
    }
    return new Map<string, FigmaTreeNode[]>();
  }, [fileTree, renderMode, parsedRegex]);

  // Generated code
  const generatedCode = useMemo(() => {
    if (!atlas || !tokenExport) return '';
    const nodes = tokenExport.nodes;

    if (renderMode === 'by_component' && fileTree) {
      const groups = collectByComponentType(fileTree);
      // Filter to interesting types only
      const interesting = new Map<string, FigmaTreeNode[]>();
      for (const [type, list] of groups) {
        if (['COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'FRAME', 'TEXT'].includes(type)) {
          interesting.set(type, list);
        }
      }
      return generateGroupedComponents(interesting, nodes, atlas, 'by_component');
    }

    if (renderMode === 'by_regex' && fileTree && parsedRegex) {
      const groups = collectByRegex(fileTree, parsedRegex);
      if (groups.size === 0) return `// No nodes matched pattern: /${regexPattern}/i`;
      return generateGroupedComponents(groups, nodes, atlas, 'by_regex');
    }

    if (!currentVariant || !selectedOption) return '';
    return generateSingleComponent(
      selectedOption.label,
      currentVariant,
      currentTreeNode,
      nodes,
      atlas,
      renderMode,
      depthLimit
    );
  }, [atlas, tokenExport, fileTree, selectedOption, currentVariant, currentTreeNode, renderMode, depthLimit, parsedRegex, regexPattern]);

  // ── Dev Readiness Score ──
  const readiness = useMemo(() => {
    if (!atlas || !schema) return null;
    const totalComponents = allOptions.length;
    if (totalComponents === 0) return null;

    const allAdherence = schema.tokenAdherence || [];
    let tokenBoundTotal = 0;
    let hardCodedTotal = 0;
    for (const entry of allAdherence) {
      for (const cat of Object.values(entry.categories)) {
        tokenBoundTotal += cat.tokenBound;
        hardCodedTotal += cat.hardCoded;
      }
    }
    const tokenBindingPct = tokenBoundTotal + hardCodedTotal > 0 ?
    tokenBoundTotal / (tokenBoundTotal + hardCodedTotal) * 100 : 0;

    const interactiveStateNames = new Set(['hover', 'focus', 'disabled', 'active', 'loading', 'error', 'pressed', 'selected']);
    let withStates = 0;
    for (const comp of allOptions) {
      const vd = atlas.variantDetails[comp.category]?.[comp.label];
      if (vd?.states?.some((s) => interactiveStateNames.has(s.name.toLowerCase()))) withStates++;
    }
    const interactiveStatePct = withStates / totalComponents * 100;

    let linked = 0;
    for (const comp of allOptions) {
      const vd = atlas.variantDetails[comp.category]?.[comp.label];
      if (vd && vd.status !== 'detached') linked++;
    }
    const linkagePct = linked / totalComponents * 100;

    let withVariants = 0;
    for (const comp of allOptions) {
      const vd = atlas.variantDetails[comp.category]?.[comp.label];
      if (vd?.states && vd.states.length > 1) withVariants++;
    }
    const variantPropPct = withVariants / totalComponents * 100;

    let withSizes = 0;
    for (const comp of allOptions) {
      const vd = atlas.variantDetails[comp.category]?.[comp.label];
      if (vd?.sizes && vd.sizes.length > 0) withSizes++;
    }
    const sizeVariantPct = withSizes / totalComponents * 100;

    const overall = tokenBindingPct * 0.3 + interactiveStatePct * 0.2 + linkagePct * 0.2 + variantPropPct * 0.15 + sizeVariantPct * 0.15;

    const critical = allOptions.filter((c) => atlas.variantDetails[c.category]?.[c.label]?.status === 'detached').length;
    const warning = allOptions.filter((c) => atlas.variantDetails[c.category]?.[c.label]?.status === 'partial').length;
    const notice = totalComponents - critical - warning;

    return {
      overall, tokenBindingPct, interactiveStatePct, linkagePct, variantPropPct, sizeVariantPct,
      totalComponents, withStates, linked, withVariants, withSizes,
      critical, warning, notice, detachedCount: totalComponents - linked
    };
  }, [atlas, schema, allOptions]);

  // Load preview image when selected component changes (respects image_rendering_type)
  useEffect(() => {
    if (!currentVariant || isGroupMode) {setPreviewSrc(null);setPreviewIsPlaceholder(false);setPreviewLoadError(false);setPreviewDecoding(false);return;}
    let active = true;
    setPreviewLoading(true);
    setPreviewIsPlaceholder(false);
    setPreviewLoadError(false);
    setPreviewDecoding(false);
    api.loadImageSrc(fileId, currentVariant.nodeId, { scale: 2, format: 'png' }).then((result) => {
      if (active) {
        setPreviewSrc(result.src);
        setPreviewIsPlaceholder(result.isPlaceholder);
        setPreviewLoading(false);
        if (result.src && !result.isPlaceholder) setPreviewDecoding(true);
      }
    }).catch(() => {if (active) {setPreviewSrc(null);setPreviewLoadError(true);setPreviewLoading(false);}});
    return () => {active = false;};
  }, [fileId, currentVariant, isGroupMode]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedCode]);

  // ── Loading / Error states ──

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 rounded bg-gray-200" />
          <div className="h-4 w-96 rounded bg-gray-100" />
          <div className="h-10 rounded-lg bg-gray-100" />
          <div className="h-96 rounded-lg bg-gray-100" />
        </div>
      </div>);

  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Failed to load data</span>
        </div>
        <p className="text-sm text-red-600 mt-2">{error}</p>
      </div>);

  }

  return (
    <div className="space-y-6">

      {/* ── Section 1: Component Selector ── */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3" data-test-id="div-0fc9cf1c">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <ComponentIcon className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Figma Component</h3>
            <p className="text-xs text-gray-500">
              {tokenExport?.meta.fileName || 'document.fig'} — {allOptions.length} components
            </p>
          </div>
        </div>
        <Select<CompOption, false, GroupBase<CompOption>>
          value={selectedOption}
          onChange={(opt) => setSelectedOption(opt)}
          options={selectGroups}
          isSearchable
          placeholder="Search components..."
          styles={compSelectStyles}
          formatOptionLabel={(data) => <CompOptionLabel data={data} />}
          noOptionsMessage={() => 'No components found'}
          isDisabled={isGroupMode} data-test-id="select-3c44cc12" />

        {isGroupMode &&
        <p className="text-[11px] text-gray-400 mt-1.5 italic">
            Component selector is disabled in grouped render modes — all matching components are rendered.
          </p>
        }

        {/* Selected component summary */}
        {selectedOption && currentVariant && !isGroupMode &&
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedOption.color }} />
              {selectedOption.categoryLabel}
            </span>
            <span>
              Status: <span className={
            currentVariant.status === 'compliant' ? 'text-green-600 font-medium' :
            currentVariant.status === 'partial' ? 'text-yellow-600 font-medium' : 'text-red-600 font-medium'
            }>{currentVariant.status}</span>
            </span>
            <span>{currentVariant.instances} instances</span>
            <span>Health: {currentVariant.health}%</span>
            {currentTreeNode &&
          <span>{currentTreeNode.children?.length ?? 0} direct children</span>
          }
          </div>
        }
      </section>

      {/* ── Section 2: Render Mode ── */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3" data-test-id="h3-e9ae2141">Render Mode</h3>
        <div className="grid grid-cols-5 gap-2" data-test-id="div-7f498c00">
          {RENDER_MODES.map((mode) => {
            const active = renderMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setRenderMode(mode.id)}
                className={`relative flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-all ${
                active ?
                'border-green-500 bg-green-50 ring-1 ring-green-200' :
                'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`
                }>

                <Icon className={`w-4 h-4 ${active ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-xs font-medium leading-tight ${active ? 'text-green-700' : 'text-gray-700'}`}>
                  {mode.label}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight">{mode.description}</span>
              </button>);

          })}
        </div>

        {/* Depth slider for partial_depth */}
        {renderMode === 'partial_depth' &&
        <div className="mt-4 flex items-center gap-4">
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
              Depth: <span className="text-green-600 font-semibold">{depthLimit}</span>
            </label>
            <input
            type="range"
            min={1}
            max={Math.min(atlas?.totals.maxDepth ?? 10, 20)}
            value={depthLimit}
            onChange={(e) => setDepthLimit(Number(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-500" />

            <span className="text-[10px] text-gray-400 whitespace-nowrap">
              max {Math.min(atlas?.totals.maxDepth ?? 10, 20)}
            </span>
          </div>
        }

        {/* Regex input for by_regex */}
        {renderMode === 'by_regex' &&
        <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">/</span>
              <input
              type="text"
              value={regexPattern}
              onChange={(e) => setRegexPattern(e.target.value)}
              placeholder="e.g. Button|Icon|Card"
              className={`flex-1 text-sm font-mono border rounded-lg px-3 py-1.5 outline-none transition-colors ${
              regexError ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200' : 'border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-200'}`
              } />

              <span className="text-xs text-gray-500 font-mono">/i</span>
            </div>
            {regexError &&
          <p className="text-xs text-red-500 mt-1">{regexError}</p>
          }
            {parsedRegex && fileTree &&
          <p className="text-xs text-gray-400 mt-1">
                {collectByRegex(fileTree, parsedRegex).size} groups matched
              </p>
          }
          </div>
        }
      </section>

      {/* ── Section 3: Component Code Generator (Tabbed) ── */}
      <section>
        <div className="mb-3" data-test-id="div-338594b8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Component Code Generator</h2>
          <p className="text-sm text-gray-500">
            {isGroupMode ?
            `Grouped output — ${renderMode === 'by_component' ? 'by Figma node type' : `by /${regexPattern || '...'}/i`}` :
            `${selectedOption?.label || 'Select a component'} — ${renderMode} render`
            }
          </p>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-200 bg-white" data-test-id="div-54c70d2e">
          {/* Tab bar */}
          <div className="flex items-center border-b border-gray-200 bg-gray-50/80">
            {CODE_GEN_TABS.map((tab) => {
              const active = codeGenTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCodeGenTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  active ?
                  'border-green-500 text-green-700 bg-white' :
                  'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/60'}`
                  }>

                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>);

            })}
            {/* Copy button pinned right */}
            {codeGenTab === 'code' &&
            <button
              onClick={handleCopy}
              className="ml-auto mr-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">

                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            }
          </div>

          {/* ── Tab: Code ── */}
          {codeGenTab === 'code' &&
          <div className="bg-[#1e1e2e]">
              <div className="px-4 py-2 border-b border-gray-700/40 flex items-center gap-3">
                <span className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-0.5 rounded">[React (JSX/TSX)]</span>
                <span className="text-xs text-gray-500">{generatedCode.split('\n').length} lines</span>
              </div>
              <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  {generatedCode.split('\n').map((line, i) =>
                <div key={i} className="flex">
                      <span className="text-gray-600 select-none w-8 text-right mr-4 flex-shrink-0">{i + 1}</span>
                      <CodeLine line={line} />
                    </div>
                )}
                </pre>
              </div>
            </div>
          }

          {/* ── Tab: Preview ── */}
          {codeGenTab === 'preview' &&
          <div className="p-6">
              {currentVariant && !isGroupMode ?
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Node Preview</span>
                    <span className="text-[11px] text-gray-400 font-mono">{currentVariant.nodeId}</span>
                  </div>
                  <div className="relative flex items-center justify-center bg-[#f8f8f8] rounded-lg border border-gray-100 min-h-[320px] p-4">
                    {previewIsPlaceholder || previewLoadError ?
                <div className="text-center py-8">
                        <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 font-medium">No preview available</p>
                        <p className="text-xs text-gray-300 mt-1">
                          {previewLoadError ? 'Image failed to load' : 'This node type cannot be rendered'}
                        </p>
                      </div> :
                previewSrc ?
                <>
                        {previewDecoding &&
                  <div className="absolute inset-0 flex items-center justify-center bg-[#f8f8f8]/80 rounded-lg z-10">
                            <div className="text-center">
                              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-xs text-gray-400">Rendering...</p>
                            </div>
                          </div>
                  }
                        <img
                    src={previewSrc}
                    alt={selectedOption?.label || 'Preview'}
                    className="max-w-full max-h-[480px] object-contain rounded"
                    onLoad={() => setPreviewDecoding(false)}
                    onError={() => {setPreviewDecoding(false);setPreviewLoadError(true);}} />

                      </> :
                previewLoading ?
                <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs text-gray-400">Fetching image...</p>
                      </div> :

                <div className="text-xs text-gray-400">No preview available</div>
                }
                  </div>
                  {currentTreeNode &&
              <div className="text-xs text-gray-400">
                      <span className="font-medium text-gray-600">{currentTreeNode.name}</span>
                      {' · '}{currentTreeNode.type}
                      {currentTreeNode.children && ` · ${currentTreeNode.children.length} children`}
                    </div>
              }
                </div> :

            <div className="text-center py-12 text-sm text-gray-400">
                  {isGroupMode ? 'Preview is not available in grouped render modes.' : 'Select a component to see its preview.'}
                </div>
            }
            </div>
          }

          {/* ── Tab: CSS ── */}
          {codeGenTab === 'css' &&
          <div className="bg-[#1e1e2e]">
              <div className="px-4 py-2 border-b border-gray-700/40 flex items-center gap-3">
                <span className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-0.5 rounded">[CSS]</span>
                <span className="text-xs text-gray-500">
                  {isGroupMode ?
                `${renderMode === 'by_component' ? 'by type' : `by /${regexPattern || '...'}/i`}` :
                `${renderMode} — ${modeNodes.length} node${modeNodes.length !== 1 ? 's' : ''}`
                }
                </span>
              </div>
              <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto">
                {!isGroupMode && currentVariant && tokenExport ? (() => {
                const blocks: string[] = [];
                for (const node of modeNodes) {
                  const variant = findVariantForNode(node, atlas);
                  const tokenNode = tokenExport.nodes[node.id];
                  if (variant) {
                    blocks.push(generateCssBlock(node.name, variant, tokenNode));
                  } else if (tokenNode) {
                    blocks.push(generateCssBlock(node.name, {
                      instances: 0, health: 0, status: 'detached', tokensCovered: 0,
                      nodeId: node.id, states: [], tokens: [], sizes: [], code: ''
                    }, tokenNode));
                  }
                }
                const cssText = blocks.join('\n\n');
                return (
                  <pre className="text-sm font-mono leading-relaxed">
                      {cssText.split('\n').map((line, i) =>
                    <div key={i} className="flex">
                          <span className="text-gray-600 select-none w-8 text-right mr-4 flex-shrink-0">{i + 1}</span>
                          <CssLine line={line} />
                        </div>
                    )}
                    </pre>);

              })() : isGroupMode && tokenExport ? (() => {
                const blocks: string[] = [];
                for (const [groupKey, nodes] of modeGroups) {
                  blocks.push(`/* ── ${groupKey} (${nodes.length} nodes) ── */`);
                  for (const node of nodes.slice(0, 10)) {
                    const variant = findVariantForNode(node, atlas);
                    const tokenNode = tokenExport.nodes[node.id];
                    if (variant) {
                      blocks.push(generateCssBlock(node.name, variant, tokenNode));
                    } else if (tokenNode) {
                      blocks.push(generateCssBlock(node.name, {
                        instances: 0, health: 0, status: 'detached', tokensCovered: 0,
                        nodeId: node.id, states: [], tokens: [], sizes: [], code: ''
                      }, tokenNode));
                    }
                  }
                  if (nodes.length > 10) blocks.push(`/* ... +${nodes.length - 10} more ${groupKey} nodes */`);
                }
                const cssText = blocks.join('\n\n');
                return (
                  <pre className="text-sm font-mono leading-relaxed">
                      {cssText.split('\n').map((line, i) =>
                    <div key={i} className="flex">
                          <span className="text-gray-600 select-none w-8 text-right mr-4 flex-shrink-0">{i + 1}</span>
                          <CssLine line={line} />
                        </div>
                    )}
                    </pre>);

              })() :
              <p className="text-sm text-gray-500 py-8 text-center">Select a component to see its CSS.</p>
              }
              </div>
            </div>
          }

          {/* ── Tab: Tokens ── */}
          {codeGenTab === 'tokens' &&
          <div className="p-5 max-h-[600px] overflow-y-auto">
              {tokenExport ? (() => {
              const nodesToShow = isGroupMode ?
              Array.from(modeGroups.values()).flat().slice(0, 50) :
              modeNodes;
              if (nodesToShow.length === 0) return <p className="text-sm text-gray-400 text-center py-8">Select a component to see its tokens.</p>;
              const nodesWithTokens = nodesToShow.filter((n) => tokenExport.nodes[n.id]);
              if (nodesWithTokens.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No token data found for the selected nodes.</p>;
              return (
                <div className="space-y-6">
                    <p className="text-xs text-gray-500">
                      {nodesWithTokens.length} of {nodesToShow.length} node{nodesToShow.length !== 1 ? 's' : ''} with token data
                      {isGroupMode ? ` (${modeGroups.size} groups)` : ` (${renderMode})`}
                    </p>
                    {nodesWithTokens.map((node, nodeIdx) => {
                    const tNode = tokenExport.nodes[node.id];
                    const isRoot = nodeIdx === 0 && !isGroupMode;
                    return (
                      <div key={node.id} className={isRoot ? '' : 'border-t border-gray-100 pt-4'}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs font-semibold ${isRoot ? 'text-gray-900' : 'text-gray-600'}`}>{node.name}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{node.type}</span>
                            {isRoot && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">root</span>}
                          </div>
                          <div className="space-y-4 pl-3 border-l-2 border-gray-100">
                            {tNode.fills && tNode.fills.length > 0 &&
                          <TokenSection title="Fills" items={tNode.fills.map((f, i) => ({
                            label: `Fill ${i + 1}`,
                            entries: [
                            ['Type', f.type], ['Hex', f.hex], ['Opacity', String(f.opacity ?? 1)],
                            ...(f.variableId ? [['Variable ID', f.variableId] as [string, string]] : [])],

                            swatch: f.hex
                          }))} />
                          }
                            {tNode.strokes && tNode.strokes.length > 0 &&
                          <TokenSection title="Strokes" items={tNode.strokes.map((s, i) => ({
                            label: `Stroke ${i + 1}`, entries: [['Type', s.type], ['Hex', s.hex]], swatch: s.hex
                          }))} />
                          }
                            {tNode.typography &&
                          <TokenSection title="Typography" items={[{
                            label: 'Font',
                            entries: [
                            ['Family', tNode.typography.fontFamily], ['Weight', String(tNode.typography.fontWeight)],
                            ['Size', `${tNode.typography.fontSize}px`], ['Line Height', `${Math.round(tNode.typography.lineHeightPx)}px`],
                            ['Letter Spacing', `${tNode.typography.letterSpacing?.toFixed(2) ?? 0}px`],
                            ...(tNode.typography.textCase ? [['Text Case', tNode.typography.textCase] as [string, string]] : []),
                            ...(tNode.typography.textDecoration ? [['Decoration', tNode.typography.textDecoration] as [string, string]] : [])]

                          }]} />
                          }
                            {tNode.layout &&
                          <TokenSection title="Layout" items={[{
                            label: tNode.layout.layoutMode || 'Layout',
                            entries: [
                            ['Mode', tNode.layout.layoutMode],
                            ...(tNode.layout.paddingLeft != null ? [['Padding L', `${tNode.layout.paddingLeft}px`] as [string, string]] : []),
                            ...(tNode.layout.paddingRight != null ? [['Padding R', `${tNode.layout.paddingRight}px`] as [string, string]] : []),
                            ...(tNode.layout.paddingTop != null ? [['Padding T', `${tNode.layout.paddingTop}px`] as [string, string]] : []),
                            ...(tNode.layout.paddingBottom != null ? [['Padding B', `${tNode.layout.paddingBottom}px`] as [string, string]] : []),
                            ...(tNode.layout.itemSpacing != null ? [['Item Spacing', `${tNode.layout.itemSpacing}px`] as [string, string]] : [])]

                          }]} />
                          }
                            {tNode.cornerRadius &&
                          <TokenSection title="Corner Radius" items={[{ label: 'Radius', entries: [['Value', `${tNode.cornerRadius.value}px`]] }]} />
                          }
                            {tNode.dimensions &&
                          <TokenSection title="Dimensions" items={[{
                            label: 'Size', entries: [['Width', `${Math.round(tNode.dimensions.width)}px`], ['Height', `${Math.round(tNode.dimensions.height)}px`]]
                          }]} />
                          }
                          </div>
                        </div>);

                  })}
                  </div>);

            })() :
            <p className="text-sm text-gray-400 text-center py-8">Select a component to see its tokens.</p>
            }
            </div>
          }

          {/* ── Tab: States ── */}
          {codeGenTab === 'states' &&
          <div className="p-5 max-h-[600px] overflow-y-auto">
              {(() => {
              const nodesToShow = isGroupMode ?
              Array.from(modeGroups.values()).flat().slice(0, 50) :
              modeNodes;
              if (nodesToShow.length === 0) {
                return <p className="text-sm text-gray-400 text-center py-8">Select a component to see its states.</p>;
              }
              return (
                <div className="space-y-6">
                    <p className="text-xs text-gray-500">
                      {nodesToShow.length} node{nodesToShow.length !== 1 ? 's' : ''}
                      {isGroupMode ? ` across ${modeGroups.size} groups` : ` (${renderMode})`}
                    </p>
                    {nodesToShow.map((node, nodeIdx) => {
                    const variant = findVariantForNode(node, atlas);
                    const tokenNode = tokenExport?.nodes[node.id];
                    const isRoot = nodeIdx === 0 && !isGroupMode;
                    return (
                      <div key={node.id} className={nodeIdx > 0 ? 'border-t border-gray-100 pt-4' : ''}>
                          {/* Node header */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs font-semibold ${isRoot ? 'text-gray-900' : 'text-gray-600'}`}>{node.name}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{node.type}</span>
                            {isRoot && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">root</span>}
                            {!isRoot && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{node.id}</span>}
                            {node.children && <span className="text-[10px] text-gray-400">{node.children.length} children</span>}
                          </div>

                          <div className="pl-3 border-l-2 border-gray-100 space-y-4">
                            {/* States & Properties */}
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">States & Properties</h4>
                              {variant && variant.states.length > 0 ?
                            <div className="space-y-2">
                                  {variant.states.map((state, i) =>
                              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                      <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-gray-800">{state.name}</span>
                                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{state.instances} instances</span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                          {Object.entries(state.props).map(([key, val]) =>
                                    <span key={key} className="text-[11px] font-mono bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                                              {key}: {String(val)}
                                            </span>
                                    )}
                                        </div>
                                      </div>
                                    </div>
                              )}
                                </div> :

                            <p className="text-xs text-gray-400 italic">No states defined.</p>
                            }
                            </div>

                            {/* Interactive states assessment (show for root or nodes with variants) */}
                            {variant &&
                          <div>
                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Interactive State Coverage</h4>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {['hover', 'focus', 'disabled', 'active', 'loading', 'error', 'pressed', 'selected'].map((stateName) => {
                                const hasState = variant.states.some((s) => s.name.toLowerCase() === stateName);
                                return (
                                  <div key={stateName} className={`flex items-center gap-1.5 text-[11px] px-2 py-1.5 rounded-lg border ${
                                  hasState ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`
                                  }>
                                        {hasState ?
                                    <CheckCircle2 className="w-3 h-3 text-green-500" /> :
                                    <XCircle className="w-3 h-3 text-gray-300" />
                                    }
                                        {stateName}
                                      </div>);

                              })}
                                </div>
                              </div>
                          }

                            {/* Size Variants */}
                            {variant &&
                          <div>
                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Size Variants</h4>
                                {variant.sizes.length > 0 ?
                            <div className="flex flex-wrap gap-2">
                                    {variant.sizes.map((size) =>
                              <span key={size} className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg">{size}</span>
                              )}
                                  </div> :

                            <p className="text-xs text-gray-400 italic">No size variants.</p>
                            }
                              </div>
                          }

                            {/* Bound Tokens */}
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Bound Tokens</h4>
                              {variant && variant.tokens.length > 0 ?
                            <div className="flex flex-wrap gap-2">
                                  {variant.tokens.map((token) =>
                              <span key={token} className="text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded">{token}</span>
                              )}
                                </div> :
                            tokenNode ?
                            <div className="flex flex-wrap gap-2">
                                  {tokenNode.fills?.filter((f) => f.variableId).map((f, i) =>
                              <span key={`fill-${i}`} className="text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded">{f.variableId}</span>
                              )}
                                  {(!tokenNode.fills || !tokenNode.fills.some((f) => f.variableId)) &&
                              <p className="text-xs text-gray-400 italic">No design tokens bound — values are hard-coded.</p>
                              }
                                </div> :

                            <p className="text-xs text-gray-400 italic">No token data.</p>
                            }
                            </div>
                          </div>
                        </div>);

                  })}
                  </div>);

            })()}
            </div>
          }

          {/* ── Tab: Metadata ── */}
          {codeGenTab === 'metadata' &&
          <div className="p-5 max-h-[600px] overflow-y-auto">
              {(() => {
              const nodesToShow = isGroupMode ?
              Array.from(modeGroups.values()).flat().slice(0, 50) :
              modeNodes;
              if (nodesToShow.length === 0) {
                return <p className="text-sm text-gray-400 text-center py-8">Select a component to see its metadata.</p>;
              }
              return (
                <div className="space-y-6">
                    <p className="text-xs text-gray-500">
                      {nodesToShow.length} node{nodesToShow.length !== 1 ? 's' : ''}
                      {isGroupMode ? ` across ${modeGroups.size} groups` : ` (${renderMode})`}
                    </p>
                    {nodesToShow.map((node, nodeIdx) => {
                    const variant = findVariantForNode(node, atlas);
                    const tokenNode = tokenExport?.nodes[node.id];
                    const isRoot = nodeIdx === 0 && !isGroupMode;
                    return (
                      <div key={node.id} className={nodeIdx > 0 ? 'border-t border-gray-100 pt-4' : ''}>
                          {/* Node header */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs font-semibold ${isRoot ? 'text-gray-900' : 'text-gray-600'}`}>{node.name}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{node.type}</span>
                            {isRoot && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">root</span>}
                          </div>

                          <div className="pl-3 border-l-2 border-gray-100 space-y-4">
                            {/* Component Info */}
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Component Info</h4>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                <MetaRow label="Name" value={node.name} />
                                <MetaRow label="Node ID" value={node.id} mono />
                                <MetaRow label="Type" value={node.type} />
                                <MetaRow label="HTML Tag" value={variant?.htmlTag || figmaTypeToTag(node.type, node.name)} mono />
                                {variant &&
                              <>
                                    <MetaRow label="Status" value={variant.status} badge={
                                variant.status === 'compliant' ? 'green' : variant.status === 'partial' ? 'yellow' : 'red'
                                } />
                                    <MetaRow label="Health" value={`${variant.health}%`} />
                                    <MetaRow label="Instances" value={String(variant.instances)} />
                                    <MetaRow label="Tokens Covered" value={String(variant.tokensCovered)} />
                                  </>
                              }
                                {node.children && <MetaRow label="Children" value={String(node.children.length)} />}
                                {tokenNode?.dimensions &&
                              <>
                                    <MetaRow label="Width" value={`${Math.round(tokenNode.dimensions.width)}px`} />
                                    <MetaRow label="Height" value={`${Math.round(tokenNode.dimensions.height)}px`} />
                                  </>
                              }
                              </div>
                            </div>

                            {/* Figma Path */}
                            {tokenNode?.path &&
                          <div>
                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Figma Path</h4>
                                <p className="text-xs font-mono text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                  {tokenNode.path}
                                </p>
                              </div>
                          }

                            {/* Dev Resources */}
                            {atlas?.devResourceLinks && (() => {
                            const links = atlas.devResourceLinks.filter((l) => l.nodeId === node.id);
                            if (links.length === 0) return null;
                            return (
                              <div>
                                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Dev Resources</h4>
                                  <div className="space-y-2">
                                    {links.map((link, i) =>
                                  <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 hover:border-green-300 hover:bg-green-50/50 transition-colors group">

                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-600" />
                                        <div className="flex-1 min-w-0">
                                          <span className="font-medium text-gray-700 group-hover:text-green-700">{link.name}</span>
                                          <span className="ml-2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">{link.linkType}</span>
                                        </div>
                                      </a>
                                  )}
                                  </div>
                                </div>);

                          })()}
                          </div>
                        </div>);

                  })}

                    {/* Governance scores (shown once at the bottom) */}
                    {atlas?.governance &&
                  <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Governance</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <GovernanceCard label="Token Compliance" value={atlas.governance.tokenCompliance} />
                          <GovernanceCard label="Naming Convention" value={atlas.governance.namingConvention} />
                          <GovernanceCard label="Documentation" value={atlas.governance.documentation} />
                          <GovernanceCard label="Dev Resources" value={atlas.governance.devResources} />
                        </div>
                      </div>
                  }

                    {/* File metadata (shown once at the bottom) */}
                    {tokenExport?.meta &&
                  <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">File</h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          <MetaRow label="File Name" value={tokenExport.meta.fileName} />
                          <MetaRow label="Version" value={tokenExport.meta.version} mono />
                          <MetaRow label="Last Modified" value={tokenExport.meta.lastModified} />
                          <MetaRow label="Total Nodes" value={String(tokenExport.meta.nodeCount)} />
                          <MetaRow label="Nodes w/ Tokens" value={String(tokenExport.meta.nodesWithTokens)} />
                        </div>
                      </div>
                  }
                  </div>);

            })()}
            </div>
          }

          {/* Footer status bar (shown for all tabs when a component is selected) */}
          {currentVariant && !isGroupMode &&
          <div className="border-t border-gray-200 px-4 py-2 flex items-center gap-4 text-[11px] text-gray-400 bg-gray-50/50">
              <span>
                <span className={
              currentVariant.status === 'compliant' ? 'text-green-600' :
              currentVariant.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
              }>{currentVariant.status}</span>
              </span>
              <span>{currentVariant.instances} instances</span>
              <span>Health: {currentVariant.health}%</span>
              <span className="font-mono">{currentVariant.nodeId}</span>
            </div>
          }
        </div>
      </section>

      {/* ── Section 4: Dev Readiness Score ── */}
      {readiness &&
      <section>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" data-test-id="div-a79a82cd">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ScoreBadge value={readiness.overall} size="lg" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dev Readiness Score</h3>
                    <p className="text-xs text-gray-500">{readiness.totalComponents} components evaluated</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="font-semibold text-gray-700">{readiness.critical}</span>
                    <span className="text-gray-500">Critical</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="font-semibold text-gray-700">{readiness.warning}</span>
                    <span className="text-gray-500">Warning</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="font-semibold text-gray-700">{readiness.notice}</span>
                    <span className="text-gray-500">Notice</span>
                  </span>
                </div>
              </div>
              <ReadinessBar segments={[
            { label: 'Token Bindings', value: readiness.tokenBindingPct, color: '#dc2626' },
            { label: 'Interactive States', value: readiness.interactiveStatePct, color: readiness.interactiveStatePct >= 50 ? '#d97706' : '#dc2626' },
            { label: 'Component Linkage', value: readiness.linkagePct, color: readiness.linkagePct >= 80 ? '#16a34a' : '#d97706' },
            { label: 'Variant Properties', value: readiness.variantPropPct, color: readiness.variantPropPct >= 80 ? '#16a34a' : '#d97706' },
            { label: 'Size Variants', value: readiness.sizeVariantPct, color: readiness.sizeVariantPct >= 50 ? '#16a34a' : '#dc2626' }]
            } />
            </div>

            <div className="px-6 py-4 divide-y divide-gray-100">
              <ReadinessCategory label="Token Bindings" percentage={readiness.tokenBindingPct}
            description={`${readiness.totalComponents - Math.round(readiness.totalComponents * readiness.tokenBindingPct / 100)} of ${readiness.totalComponents} components need more token bindings (fills, strokes, spacing)`} />
              <ReadinessCategory label="Interactive States" percentage={readiness.interactiveStatePct}
            description={`${readiness.totalComponents - readiness.withStates} components are missing states (hover, focused, disabled, error, loading)`} />
              <ReadinessCategory label="Component Linkage" percentage={readiness.linkagePct}
            description={`${readiness.detachedCount} detached — re-link so upstream updates propagate`} />
              <ReadinessCategory label="Variant Properties" percentage={readiness.variantPropPct}
            description={readiness.variantPropPct >= 80 ? 'All components define variant properties for prop mapping' : `${readiness.totalComponents - readiness.withVariants} components need variant properties for prop mapping`} />
              <ReadinessCategory label="Size Variants" percentage={readiness.sizeVariantPct}
            description={`${readiness.totalComponents - readiness.withSizes} components have no size variants (S/M/L)`} />
            </div>

            <div className="border-t border-gray-200 grid grid-cols-2 divide-x divide-gray-200">
              <div className="px-6 py-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-700 mb-3">DO</h4>
                <ul className="space-y-2">
                  {readiness.tokenBindingPct < 80 && <DoItem text={`Fix token bindings: ${readiness.totalComponents - Math.round(readiness.totalComponents * readiness.tokenBindingPct / 100)} of ${readiness.totalComponents} components need more token bindings (fills, strokes, spacing)`} />}
                  {readiness.interactiveStatePct < 80 && <DoItem text={`Fix interactive states: ${readiness.totalComponents - readiness.withStates} components are missing states (hover, focused, disabled, error, loading)`} />}
                  {readiness.detachedCount > 0 && <DoItem text={`Fix component linkage: ${readiness.detachedCount} detached`} />}
                  {readiness.sizeVariantPct < 80 && <DoItem text={`Fix size variants: ${readiness.totalComponents - readiness.withSizes} components have no size variants (s/m/l)`} />}
                  <DoItem text="Review each critical finding and apply its action plan" />
                </ul>
              </div>
              <div className="px-6 py-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3">DON'T</h4>
                <ul className="space-y-2">
                  {readiness.detachedCount > 0 && <DontItem text={`Don't hand off the ${readiness.detachedCount} blocked components to engineering`} />}
                  <DontItem text="Don't hard-code colors or spacing — always bind to design tokens" />
                  <DontItem text="Don't fork components — fix the source component instead" />
                  <DontItem text="Don't skip states — missing hover/disabled/error causes rework" />
                </ul>
              </div>
            </div>
          </div>
        </section>
      }
    </div>);

}