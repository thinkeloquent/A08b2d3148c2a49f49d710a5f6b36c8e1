/**
 * FIGMA COMPONENT INSPECTOR
 * ===========================
 *
 * Integrated with backend API for real Figma data
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ChevronDown, Search, Component, Box, File, Layers,
  Download, RefreshCw, Info, ZoomIn, ZoomOut, Hash, Copy, Check,
  Palette, Variable, Send, ExternalLink, Settings, GitBranch,
  Type, PenTool, Circle, Scissors, GitMerge, Filter, X,
  Network, SwatchBook, Code2, Brain, Briefcase, History, FileJson,
  Pin, Plus, Tag, Trash2, MoreHorizontal, Image as ImageIcon } from
'lucide-react';
import Select, { type StylesConfig, type SingleValue } from 'react-select';
import * as api from '../services/api';
import { formatRelativeTime } from '../utils/formatters';
import DesignSystemAnalysis from './design-system/DesignSystemAnalysis';
import ComponentAtlas from './design-system/ComponentAtlas';
import ComponentCoverageInsights from './design-system/ComponentCoverageInsights';
import ReactComponentGenerator from './design-system/ReactComponentGenerator';

// Types
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

/** Walk the tree and return the path of node names from root to the target id. */
function findNodePath(root: FigmaNode, targetId: string): string[] | null {
  if (root.id === targetId) return [root.name];
  if (!root.children) return null;
  for (const child of root.children) {
    const path = findNodePath(child, targetId);
    if (path) return [root.name, ...path];
  }
  return null;
}

/** Format a value for display — handles RGBA objects, arrays, and primitives. */
function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return '–';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) {
    return value.map(formatDisplayValue).join(', ');
  }
  const obj = value as Record<string, unknown>;
  // RGBA color object
  if ('r' in obj && 'g' in obj && 'b' in obj) {
    const r = Math.round(Number(obj.r) * 255);
    const g = Math.round(Number(obj.g) * 255);
    const b = Math.round(Number(obj.b) * 255);
    const a = obj.a !== undefined ? Number(obj.a) : 1;
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`;
  }
  // Fill / stroke / effect objects
  if ('type' in obj && 'color' in obj) {
    const colorStr = obj.color ? formatDisplayValue(obj.color) : 'none';
    return `${obj.type} ${colorStr}`;
  }
  return JSON.stringify(value);
}

/** Convert RGBA (0-1 float) to hex string. */
function rgbaToHex(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  if (!('r' in obj && 'g' in obj && 'b' in obj)) return null;
  const r = Math.round(Number(obj.r) * 255);
  const g = Math.round(Number(obj.g) * 255);
  const b = Math.round(Number(obj.b) * 255);
  return `#${r.toString(16).padStart(2, '0').toUpperCase()}${g.toString(16).padStart(2, '0').toUpperCase()}${b.toString(16).padStart(2, '0').toUpperCase()}`;
}

/** Convert RGBA to CSS color string for swatch background. */
function rgbaToCss(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  if (!('r' in obj && 'g' in obj && 'b' in obj)) return null;
  const r = Math.round(Number(obj.r) * 255);
  const g = Math.round(Number(obj.g) * 255);
  const b = Math.round(Number(obj.b) * 255);
  const a = obj.a !== undefined ? Number(obj.a) : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Map Figma resolvedType to a friendly display type. */
function getTokenDisplayType(type: string): string {
  const map: Record<string, string> = {
    COLOR: 'Color',
    FLOAT: 'Value',
    STRING: 'Font',
    BOOLEAN: 'Boolean',
    VARIABLE_ALIAS: 'Variable'
  };
  return map[type] || type;
}

/** Generate a short description for tokens based on name and type. */
function inferTokenDescription(name: string, type: string): string {
  const lower = name.toLowerCase().replace(/\//g, '-');
  if (type === 'COLOR') {
    if (lower.includes('brand') || lower.includes('primary')) return 'Color used for brand identity';
    if (lower.includes('text') || lower.includes('body')) return 'Color used for body text';
    if (lower.includes('outline') || lower.includes('border')) return 'Color used for outlines and borders';
    if (lower.includes('surface') || lower.includes('bg') || lower.includes('background')) return 'Color used for surface background';
    if (lower.includes('error') || lower.includes('danger')) return 'Color used for error states';
    if (lower.includes('success')) return 'Color used for success states';
    if (lower.includes('warning')) return 'Color used for warnings';
    return 'Color token';
  }
  if (type === 'FLOAT') {
    if (lower.includes('spacing')) return 'Spacing token';
    if (lower.includes('radius') || lower.includes('corner')) return 'Border radius token';
    if (lower.includes('size') || lower.includes('font')) return 'Size / typography token';
    if (lower.includes('shadow') || lower.includes('elevation')) return 'Shadow / elevation token';
    return 'Numeric value token';
  }
  if (type === 'STRING') {
    if (lower.includes('font') || lower.includes('family')) return 'Font family token';
    return 'String token';
  }
  if (type === 'BOOLEAN') {
    if (lower.includes('show') || lower.includes('visible')) return 'Visibility toggle';
    return 'Boolean toggle';
  }
  return '';
}

// ── Token & Variable Registry + Export Panel ──
type ExportStructure = 'by-component' | 'by-node-type';
type ExportFormat = 'json' | 'yaml' | 'jsonl' | 'csv';

function TokensAndExportPanel({ variables, fileId }: {variables: any[];fileId: string;}) {
  const [tokenFilter, setTokenFilter] = useState('');
  const [exportStructure, setExportStructure] = useState<ExportStructure>('by-component');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [isExporting, setIsExporting] = useState(false);

  const filtered = useMemo(() => {
    let list = variables;
    if (tokenFilter.trim()) {
      const q = tokenFilter.toLowerCase();
      list = variables.filter((v: any) =>
      v.name.toLowerCase().includes(q) ||
      (v.type || '').toLowerCase().includes(q) ||
      (v.description || '').toLowerCase().includes(q) ||
      (v.collectionName || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [variables, tokenFilter]);

  // Group by collectionName for section headers
  const grouped = useMemo(() => {
    const groups: {name: string;tokens: any[];}[] = [];
    const map = new Map<string, any[]>();
    for (const v of filtered) {
      const key = v.collectionName || 'Ungrouped';
      if (!map.has(key)) {
        map.set(key, []);
        groups.push({ name: key, tokens: map.get(key)! });
      }
      map.get(key)!.push(v);
    }
    return groups;
  }, [filtered]);

  const isExtracted = variables.length > 0 && (variables[0]?.source === 'file-extracted' || variables[0]?.source === 'file-bound');

  // ── Export helpers ──

  /** Convert object to YAML string (simple 2-level). */
  const toYaml = (obj: any, indent = 0): string => {
    const pad = '  '.repeat(indent);
    if (obj === null || obj === undefined) return `${pad}null\n`;
    if (typeof obj !== 'object') {
      if (typeof obj === 'string') return `${pad}"${obj}"\n`;
      return `${pad}${obj}\n`;
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return `${pad}[]\n`;
      return obj.map((item) => `${pad}- ${typeof item === 'object' ? '\n' + toYaml(item, indent + 2).trimStart() : typeof item === 'string' ? `"${item}"` : item}\n`).join('');
    }
    const entries = Object.entries(obj);
    if (entries.length === 0) return `${pad}{}\n`;
    return entries.map(([k, v]) => {
      if (v === null || v === undefined) return `${pad}${k}: null\n`;
      if (typeof v === 'object') return `${pad}${k}:\n${toYaml(v, indent + 1)}`;
      if (typeof v === 'string') return `${pad}${k}: "${v}"\n`;
      return `${pad}${k}: ${v}\n`;
    }).join('');
  };

  /** Convert array of flat objects to CSV. */
  const toCsv = (rows: Record<string, any>[]): string => {
    if (rows.length === 0) return '';
    const allKeys = new Set<string>();
    for (const row of rows) Object.keys(row).forEach((k) => allKeys.add(k));
    const keys = [...allKeys];
    const escape = (v: any) => {
      const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = keys.map(escape).join(',');
    const body = rows.map((row) => keys.map((k) => escape(row[k])).join(',')).join('\n');
    return `${header}\n${body}`;
  };

  /** Build the token registry array with name, type, value, description for each variable. */
  const buildTokenRegistry = () => {
    return variables.map((v: any) => {
      const isColor = v.type === 'COLOR';
      const hex = isColor ? rgbaToHex(v.value) : null;
      const displayValue = isColor && hex ? hex : formatDisplayValue(v.value);
      const desc = v.description || inferTokenDescription(v.name, v.type);
      return {
        name: v.name,
        type: getTokenDisplayType(v.type),
        value: displayValue,
        description: desc,
        ...(v.collectionName && { collection: v.collectionName }),
        ...(v.source && { source: v.source }),
        ...(isColor && v.value && typeof v.value === 'object' && 'r' in v.value && {
          rgba: { r: v.value.r, g: v.value.g, b: v.value.b, a: v.value.a ?? 1 }
        })
      };
    });
  };

  /** Reshape token-node map by structure type, always including the token registry. */
  const reshapeData = (data: {nodes: Record<string, any>;meta: any;}) => {
    const { nodes, meta } = data;
    const nodeList = Object.values(nodes);
    const tokenRegistry = buildTokenRegistry();

    const makeMeta = () => ({
      structure: exportStructure,
      format: exportFormat,
      ...meta,
      tokenCount: tokenRegistry.length,
      exportedAt: new Date().toISOString()
    });

    /** Attach tokens sub-object to a node record. */
    const nodeTokens = (node: any) => ({
      ...(node.fills && { fills: node.fills }),
      ...(node.strokes && { strokes: node.strokes }),
      ...(node.typography && { typography: node.typography }),
      ...(node.layout && { layout: node.layout }),
      ...(node.cornerRadius != null && { cornerRadius: node.cornerRadius }),
      ...(node.effects && { effects: node.effects })
      // variableId fields are merged directly into fills/strokes/typography/layout/effects entries
    });

    if (exportStructure === 'by-component') {
      const componentTypes = new Set(['COMPONENT', 'COMPONENT_SET', 'INSTANCE']);
      const components: Record<string, any> = {};
      const otherNodes: Record<string, any> = {};

      for (const node of nodeList) {
        const record = {
          nodeId: node.nodeId,
          nodeName: node.nodeName,
          nodeType: node.nodeType,
          path: node.path,
          ...(node.dimensions && { dimensions: node.dimensions }),
          ...(node.componentId && { componentId: node.componentId }),
          ...(node.componentProperties && { componentProperties: node.componentProperties }),
          tokens: nodeTokens(node)
        };
        if (componentTypes.has(node.nodeType)) {
          components[node.nodeId] = record;
        } else {
          otherNodes[node.nodeId] = record;
        }
      }

      return {
        _exportMeta: makeMeta(),
        tokenRegistry,
        components,
        otherNodes
      };
    }

    // by-node-type
    const byType: Record<string, any[]> = {};
    for (const node of nodeList) {
      const t = node.nodeType || 'UNKNOWN';
      if (!byType[t]) byType[t] = [];
      byType[t].push({
        nodeId: node.nodeId,
        nodeName: node.nodeName,
        path: node.path,
        ...(node.dimensions && { dimensions: node.dimensions }),
        ...(node.componentId && { componentId: node.componentId }),
        tokens: nodeTokens(node)
      });
    }

    return {
      _exportMeta: makeMeta(),
      tokenRegistry,
      nodeTypes: byType
    };
  };

  /** Flatten for CSV: token registry rows + node rows in one sheet. */
  const flattenForCsv = (data: {nodes: Record<string, any>;meta: any;}) => {
    const tokenRows = buildTokenRegistry().map((t) => ({
      _section: 'token',
      name: t.name,
      type: t.type,
      value: t.value,
      description: t.description,
      collection: t.collection ?? '',
      source: t.source ?? '',
      nodeId: '',
      nodeName: '',
      nodeType: '',
      path: '',
      width: '',
      height: '',
      componentId: '',
      fills: '',
      strokes: '',
      typography: '',
      layout: '',
      cornerRadius: '',
      effects: ''
    }));

    const nodeRows = Object.values(data.nodes).map((node: any) => ({
      _section: 'node',
      name: node.nodeName,
      type: node.nodeType,
      value: '',
      description: '',
      collection: '',
      source: '',
      nodeId: node.nodeId,
      nodeName: node.nodeName,
      nodeType: node.nodeType,
      path: node.path,
      width: node.dimensions?.width ?? '',
      height: node.dimensions?.height ?? '',
      componentId: node.componentId ?? '',
      fills: node.fills ? JSON.stringify(node.fills) : '',
      strokes: node.strokes ? JSON.stringify(node.strokes) : '',
      typography: node.typography ? JSON.stringify(node.typography) : '',
      layout: node.layout ? JSON.stringify(node.layout) : '',
      cornerRadius: node.cornerRadius != null ? JSON.stringify(node.cornerRadius) : '',
      effects: node.effects ? JSON.stringify(node.effects) : ''
    }));

    return [...tokenRows, ...nodeRows];
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = (await api.getTokenExport(fileId)) as any;
      let content: string;
      let ext: string;
      let mime: string;

      const shaped = reshapeData(data);

      switch (exportFormat) {
        case 'json':
          content = JSON.stringify(shaped, null, 2);
          ext = 'json';
          mime = 'application/json';
          break;
        case 'yaml':
          content = toYaml(shaped);
          ext = 'yaml';
          mime = 'text/yaml';
          break;
        case 'jsonl':{
            // Line 1: meta, Line 2+: each token registry entry, then each node
            const tokenRegistry = buildTokenRegistry();
            const nodes = Object.values(data.nodes);
            const lines = [
            JSON.stringify({ _exportMeta: shaped._exportMeta }),
            ...tokenRegistry.map((t: any) => JSON.stringify({ _type: 'token', ...t })),
            ...nodes.map((n: any) => JSON.stringify({ _type: 'node', ...n }))];

            content = lines.join('\n');
            ext = 'jsonl';
            mime = 'application/x-ndjson';
            break;
          }
        case 'csv':{
            const rows = flattenForCsv(data);
            content = toCsv(rows);
            ext = 'csv';
            mime = 'text/csv';
            break;
          }
      }

      const structLabel = exportStructure === 'by-component' ? 'components' : 'node-types';
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tokens-${structLabel}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Token & Variable Registry */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Tokens & Variables</h2>
        <p className="text-sm text-gray-500">
          {isExtracted ?
          'Design tokens extracted from the file document — colors, typography, spacing, and effects.' :
          'Raw design tokens from the file — colors, typography, spacing, and booleans.'}
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-white">Token & Variable Registry</h3>
            <p className="text-xs text-gray-400">
              {isExtracted ? 'Extracted from file' : 'Token & Variable'}
              {variables.length > 0 ? `, ${variables.length} tokens` : ''}
            </p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Filter tokens..."
              value={tokenFilter}
              onChange={(e) => setTokenFilter(e.target.value)}
              className="w-full bg-gray-800 text-xs text-gray-300 pl-7 pr-3 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none" />

          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[minmax(160px,2fr)_80px_minmax(120px,1.5fr)_minmax(100px,2fr)] px-4 py-2 border-b border-gray-700 text-xs font-medium text-gray-400 uppercase tracking-wider">
          <span>Token Name</span>
          <span>Type</span>
          <span>Value</span>
          <span>Description</span>
        </div>

        {/* Table Body */}
        <div className="max-h-[500px] overflow-y-auto">
          {grouped.length > 0 ? grouped.map((group) =>
          <div key={group.name}>
              <div className="sticky top-0 px-4 py-1.5 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {group.name} <span className="text-gray-600 font-normal ml-1">({group.tokens.length})</span>
              </div>
              {group.tokens.map((v: any, i: number) => {
              const isColor = v.type === 'COLOR';
              const hex = isColor ? rgbaToHex(v.value) : null;
              const cssColor = isColor ? rgbaToCss(v.value) : null;
              const displayType = getTokenDisplayType(v.type);
              const displayValue = isColor && hex ? hex : formatDisplayValue(v.value);
              const desc = v.description || inferTokenDescription(v.name, v.type);

              return (
                <div
                  key={v.id || `${v.name}-${i}`}
                  className="grid grid-cols-[minmax(160px,2fr)_80px_minmax(120px,1.5fr)_minmax(100px,2fr)] px-4 py-2.5 border-b border-gray-800 hover:bg-gray-800/60 text-xs items-center">

                    <code className="font-mono text-gray-200 truncate" title={v.name}>{v.name}</code>
                    <span className="text-gray-400">{displayType}</span>
                    <span className="flex items-center gap-2 text-gray-300">
                      {isColor && cssColor &&
                    <span
                      className="w-4 h-4 rounded-sm border border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: cssColor }} />

                    }
                      <span className="truncate" title={displayValue}>{displayValue}</span>
                    </span>
                    <span className="text-gray-500 truncate" title={desc}>{desc}</span>
                  </div>);

            })}
            </div>
          ) :
          <div className="px-4 py-8 text-center text-sm text-gray-500">
              {variables.length === 0 ? 'No variables found in this file.' : 'No tokens match your filter.'}
            </div>
          }
        </div>
      </div>

      {/* Token Export Options */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-white">Token Export Options</h3>
            <p className="text-xs text-gray-400">
              Export tokens with full node associations for LLM agents
            </p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Structure Dropdown */}
          <div>
            <label className="text-xs font-medium text-gray-300 mb-1.5 block">Output Structure</label>
            <select
              value={exportStructure}
              onChange={(e) => setExportStructure(e.target.value as ExportStructure)}
              className="w-full bg-gray-800 text-xs text-gray-300 px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none">

              <option value="by-component">By Components — components with associated tokens & variables (NodeID key)</option>
              <option value="by-node-type">By Node Type — node types with associated tokens & variables (NodeID key)</option>
            </select>
            <p className="text-[10px] text-gray-500 mt-1">
              {exportStructure === 'by-component' ?
              'Groups COMPONENT, COMPONENT_SET, and INSTANCE nodes with their fills, strokes, typography, layout, effects, and bound variables.' :
              'Groups all nodes by type (FRAME, TEXT, RECTANGLE, etc.) with their design properties and token bindings.'}
            </p>
          </div>

          {/* Format Dropdown */}
          <div>
            <label className="text-xs font-medium text-gray-300 mb-1.5 block">Output Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="w-full bg-gray-800 text-xs text-gray-300 px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none">

              <option value="json">JSON — structured, nested (best for LLM agents)</option>
              <option value="yaml">YAML — human-readable, nested</option>
              <option value="jsonl">JSONL — one node per line (streaming / large files)</option>
              <option value="csv">CSV — flat tabular (spreadsheets / data analysis)</option>
            </select>
          </div>

          {/* Export metadata summary */}
          <div className="bg-gray-800 rounded px-3 py-2 text-[10px] text-gray-400 space-y-0.5">
            <p>Includes per node: <span className="text-gray-300">nodeId, nodeName, nodeType, path, dimensions, componentId</span></p>
            <p>Token data: <span className="text-gray-300">fills (hex+rgba+variableId), strokes, typography, layout/spacing, cornerRadius, effects — variableIds merged inline</span></p>
            <p>Metadata: <span className="text-gray-300">fileName, lastModified, version, nodeCount, exportedAt</span></p>
          </div>

          {/* Download Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">

            {isExporting ?
            <RefreshCw className="w-4 h-4 animate-spin" /> :

            <Download className="w-4 h-4" />
            }
            {isExporting ? 'Exporting...' : 'Download Token Export'}
          </button>
        </div>
      </div>
    </>);

}

/** Figma node type -> display label and color for filter chips + tree icons. */
const NODE_TYPE_CONFIG: Record<string, {label: string;color: string;icon: typeof Component;}> = {
  PAGE: { label: 'Page', color: '#7B6FFF', icon: File },
  FRAME: { label: 'Frame', color: '#4D9EFF', icon: Box },
  GROUP: { label: 'Group', color: '#9B8FFF', icon: Layers },
  COMPONENT: { label: 'Component', color: '#A855F7', icon: Component },
  COMPONENT_SET: { label: 'Set', color: '#A855F7', icon: Component },
  INSTANCE: { label: 'Instance', color: '#A855F7', icon: Component },
  TEXT: { label: 'Text', color: '#F0A050', icon: Type },
  VECTOR: { label: 'Vector', color: '#60D890', icon: PenTool },
  RECTANGLE: { label: 'Rect', color: '#FF7EB6', icon: Box },
  ELLIPSE: { label: 'Ellipse', color: '#FF7EB6', icon: Circle },
  BOOLEAN_OPERATION: { label: 'Boolean', color: '#FF9060', icon: GitMerge },
  SLICE: { label: 'Slice', color: '#A0C4FF', icon: Scissors }
};

/** Top-level tab definitions. */
type TopTab = 'structure' | 'pins' | 'design-system' | 'export' | 'ai-context' | 'product' | 'activity';

interface SubSection {
  id: string;
  label: string;
}

interface TabDef {
  id: TopTab;
  label: string;
  icon: typeof Component;
  description: string;
  color?: string; // tailwind color prefix for tabs 2+
  subSections?: SubSection[];
}

const TOP_TABS: TabDef[] = [
{ id: 'pins', label: 'Pins', icon: Pin, description: 'Saved References' },
{ id: 'structure', label: 'Figma Elements', icon: Network, description: 'The Raw Data' },
{ id: 'design-system', label: 'Design System', icon: SwatchBook, description: 'The Reusable Assets', color: 'purple', subSections: [
  { id: 'analysis', label: 'Analysis' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'tokens', label: 'Tokens & Variables' },
  { id: 'file-json-schema', label: 'File JSON Schema' }]
},
{ id: 'export', label: 'Export & Code', icon: Code2, description: 'Developer Handoff', color: 'green', subSections: [
  { id: 'web-assets', label: 'Web Assets' },
  { id: 'react-component', label: 'React Component' },
  { id: 'framework', label: 'Framework Components' },
  { id: 'token-export', label: 'Token Export' }]
},
{ id: 'ai-context', label: 'AI & Context', icon: Brain, description: 'Intelligence & Mapping', color: 'blue', subSections: [
  { id: 'figma-react', label: 'Figma to React Mapping' },
  { id: 'labeling', label: 'Component Labeling' },
  { id: 'insights', label: 'Extract Data Insights' },
  { id: 'resources', label: 'Resource Linking' }]
},
{ id: 'product', label: 'Product Alignment', icon: Briefcase, description: 'Project Management', color: 'amber', subSections: [
  { id: 'features', label: 'Features Tree' },
  { id: 'integrations', label: 'Project Integrations' },
  { id: 'wiki', label: 'Self-Doc Wiki' }]
},
{ id: 'activity', label: 'Activity & History', icon: History, description: 'Collaboration', color: 'teal', subSections: [
  { id: 'versions', label: 'Version History' },
  { id: 'comments', label: 'Comments & Feedback' }]
}];


/** Shared nav-pill link definitions used in modal and right panel. */
interface NavPillLink {
  label: string;
  tab: TopTab;
  sub: string;
  icon: typeof Component;
  cls: string; // low-profile: border + text color + hover bg
}

const NAV_PILL_CLS = 'border border-gray-300 rounded bg-white text-gray-600 hover:text-gray-900 hover:border-gray-400';

const NAV_PILL_LINKS: NavPillLink[] = [
{ label: 'Atlas', tab: 'design-system', sub: 'analysis', icon: Network, cls: NAV_PILL_CLS },
{ label: 'Coverage', tab: 'design-system', sub: 'coverage', icon: Component, cls: NAV_PILL_CLS },
{ label: 'Tokens', tab: 'design-system', sub: 'tokens', icon: Variable, cls: NAV_PILL_CLS },
{ label: 'Schema', tab: 'design-system', sub: 'file-json-schema', icon: FileJson, cls: NAV_PILL_CLS },
{ label: 'Export CSS', tab: 'export', sub: 'web-assets', icon: Code2, cls: NAV_PILL_CLS },
{ label: 'AI Mapping', tab: 'ai-context', sub: 'figma-react', icon: Brain, cls: NAV_PILL_CLS }];


/** Scrollable pill-button row for navigating to tab sub-sections. */
function NavPills({ links, onNavigate }: {links: NavPillLink[];onNavigate: (tab: TopTab, sub: string) => void;}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = React.useState({ canLeft: false, canRight: false, show: false });

  const updateScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const canLeft = el.scrollLeft > 1;
    const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setScroll({ canLeft, canRight, show: canLeft || canRight });
  }, []);

  React.useEffect(() => {
    updateScroll();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScroll]);

  const doScroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center gap-0 bg-purple-50 rounded-md px-1.5 py-1">
      {/* Left arrow */}
      <button
        onClick={() => doScroll('left')}
        disabled={!scroll.canLeft}
        className={`flex-shrink-0 flex items-center justify-center w-5 h-full transition-colors ${
        scroll.canLeft ? 'text-gray-500 hover:text-gray-800 cursor-pointer' : 'text-gray-200 cursor-default'} ${
        scroll.show ? '' : 'hidden'}`}>

        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      <div
        ref={scrollRef}
        onScroll={updateScroll}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        {links.map((link) =>
        <button
          key={`${link.tab}-${link.sub}`}
          type="button"
          onClick={() => onNavigate(link.tab, link.sub)}
          className={`px-1 py-0.5 text-[10px] font-medium whitespace-nowrap flex-shrink-0 transition-colors ${link.cls}`}>

            {link.label}
          </button>
        )}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => doScroll('right')}
        disabled={!scroll.canRight}
        className={`flex-shrink-0 flex items-center justify-center w-5 h-full transition-colors ${
        scroll.canRight ? 'text-gray-500 hover:text-gray-800 cursor-pointer' : 'text-gray-200 cursor-default'} ${
        scroll.show ? '' : 'hidden'}`}>

        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>);

}

/** Option type for react-select dropdowns. */
interface NodeOption {
  value: string; // node id
  label: string; // node name
  node: FigmaNode;
}

/** Compact react-select styles matching the existing UI. */
const selectStyles: StylesConfig<NodeOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    fontSize: '0.8125rem',
    borderColor: state.isFocused ? '#A855F7' : '#E5E7EB',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(168,85,247,0.25)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#A855F7' : '#D1D5DB' },
    borderRadius: 8
  }),
  valueContainer: (base) => ({ ...base, padding: '0 8px' }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, padding: '0 6px' }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.8125rem',
    padding: '6px 10px',
    backgroundColor: state.isSelected ? '#A855F7' : state.isFocused ? '#F3E8FF' : 'transparent',
    color: state.isSelected ? '#fff' : '#374151',
    '&:active': { backgroundColor: '#DDD6FE' }
  }),
  menu: (base) => ({ ...base, borderRadius: 8, overflow: 'hidden', zIndex: 20 })
};

/** Flatten a Figma node tree into an array with id and type. */
function flattenNodes(node: FigmaNode): {id: string;name: string;type: string;}[] {
  const result = [{ id: node.id, name: node.name, type: node.type }];
  for (const child of node.children ?? []) {
    result.push(...flattenNodes(child));
  }
  return result;
}

/** Given a set of matching node IDs, collect those IDs plus all ancestor IDs so the tree stays connected. */
function collectVisibleIds(node: FigmaNode, matchIds: Set<string>): Set<string> {
  const visible = new Set<string>();

  function walk(n: FigmaNode, ancestors: string[]): boolean {
    const path = [...ancestors, n.id];
    let subtreeHasMatch = matchIds.has(n.id);
    for (const child of n.children ?? []) {
      if (walk(child, path)) subtreeHasMatch = true;
    }
    if (subtreeHasMatch) {
      for (const id of path) visible.add(id);
    }
    return subtreeHasMatch;
  }

  walk(node, []);
  return visible;
}

/** Highlight matching substring in a node name. */
function HighlightMatch({ text, query }: {text: string;query: string;}) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>);

}

const FigmaComponentInspector: React.FC = () => {
  const { id: routeFileId, tab: routeTab, subSection: routeSubSection } = useParams<{
    id: string;
    tab: string;
    subSection: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive valid tab from URL, fallback to 'pins'
  const validTabIds = TOP_TABS.map((t) => t.id) as string[];
  const initialTab = (routeTab && validTabIds.includes(routeTab) ? routeTab : 'pins') as TopTab;
  const initialTabDef = TOP_TABS.find((t) => t.id === initialTab);
  const validSubIds = initialTabDef?.subSections?.map((s) => s.id) ?? [];
  const initialSub = routeSubSection && validSubIds.includes(routeSubSection) ?
  routeSubSection :
  initialTabDef?.subSections?.[0]?.id ?? null;

  // State
  const [activeTopTab, setActiveTopTab] = useState<TopTab>(initialTab);
  const [activeSubSection, setActiveSubSection] = useState<string | null>(initialSub);
  const [fileId, setFileId] = useState<string>(routeFileId || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileData, setFileData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<FigmaNode | null>(null);
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const [nodeImage, setNodeImage] = useState<string | null>(null);
  const [imageFetching, setImageFetching] = useState(false);
  const [imageDecoding, setImageDecoding] = useState(false);
  const [imageIsPlaceholder, setImageIsPlaceholder] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageCacheStatus, setImageCacheStatus] = useState<string | null>(null);
  const [imageCacheDate, setImageCacheDate] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<any>(null);
  const [variables, setVariables] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'properties' | 'comments'>('properties');
  const [copied, setCopied] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [commentText, setCommentText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilters, setActiveTypeFilters] = useState<Set<string>>(new Set());
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<NodeOption | null>(null);
  const [pins, setPins] = useState<api.PinData[]>([]);
  const [pinForm, setPinForm] = useState({ tags: '', description: '' });
  const [editingPin, setEditingPin] = useState<api.PinData | null>(null);
  const [nodeLabels, setNodeLabels] = useState<Map<string, string>>(new Map()); // nodeId -> displayName
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [nodeModalTarget, setNodeModalTarget] = useState<FigmaNode | null>(null);
  const [nodeModalDisplayName, setNodeModalDisplayName] = useState('');
  // pin active state is derived from editingPin !== null
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [tabScrollState, setTabScrollState] = useState<{canLeft: boolean;canRight: boolean;needsArrows: boolean;}>({ canLeft: false, canRight: false, needsArrows: false });

  // Check tab scroll overflow
  const updateTabScroll = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    const needsArrows = el.scrollWidth > el.clientWidth;
    setTabScrollState({
      needsArrows,
      canLeft: el.scrollLeft > 1,
      canRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    });
  }, []);

  const scrollTabs = useCallback((direction: 'left' | 'right') => {
    const el = tabScrollRef.current;
    if (!el) return;
    const amount = 200;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  // Re-check overflow on mount and when fileData changes
  useEffect(() => {
    updateTabScroll();
    const el = tabScrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateTabScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fileData, updateTabScroll]);

  // Document dropdown: always a single option (the DOCUMENT root)
  const documentOption = useMemo<NodeOption | null>(() => {
    if (!fileData?.document) return null;
    return { value: fileData.document.id, label: fileData.document.name || fileData.name || 'Document', node: fileData.document };
  }, [fileData]);

  // Canvas dropdown: direct children of DOCUMENT (type CANVAS / PAGE)
  const canvasOptions = useMemo<NodeOption[]>(() => {
    if (!fileData?.document?.children) return [];
    return fileData.document.children.map((c: FigmaNode) => ({
      value: c.id,
      label: c.name,
      node: c
    }));
  }, [fileData]);

  // Auto-select first canvas when file loads
  useEffect(() => {
    if (canvasOptions.length > 0 && !selectedCanvas) {
      setSelectedCanvas(canvasOptions[0]);
    }
  }, [canvasOptions, selectedCanvas]);

  // The root node for the tree: selected canvas, or full document as fallback
  const treeRoot = useMemo<FigmaNode | null>(() => {
    if (selectedCanvas) return selectedCanvas.node;
    return fileData?.document ?? null;
  }, [selectedCanvas, fileData]);

  // Collect all unique node types present in the tree for filter chips
  const availableTypes = useMemo(() => {
    if (!treeRoot) return [] as string[];
    const types = new Set<string>();
    const EXCLUDED_TYPES = new Set(['DOCUMENT', 'CANVAS', 'PAGE']);
    for (const n of flattenNodes(treeRoot)) {
      if (!EXCLUDED_TYPES.has(n.type)) types.add(n.type);
    }
    // Sort so configured types come first in their config order, unknowns at end
    const configOrder = Object.keys(NODE_TYPE_CONFIG);
    return [...types].sort((a, b) => {
      const ai = configOrder.indexOf(a);
      const bi = configOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [treeRoot]);

  // Compute which node IDs match the current search + type filters
  const hasFilter = searchQuery.trim() !== '' || activeTypeFilters.size > 0;

  const { matchIds, visibleIds, matchCount } = useMemo(() => {
    if (!treeRoot || !hasFilter) {
      return { matchIds: null, visibleIds: null, matchCount: 0 };
    }
    const q = searchQuery.toLowerCase().trim();
    const flat = flattenNodes(treeRoot);
    const matches = new Set<string>();
    for (const n of flat) {
      const nameMatch = !q || n.name.toLowerCase().includes(q);
      const typeMatch = activeTypeFilters.size === 0 || activeTypeFilters.has(n.type);
      if (nameMatch && typeMatch) matches.add(n.id);
    }
    const visible = collectVisibleIds(treeRoot, matches);
    return { matchIds: matches, visibleIds: visible, matchCount: matches.size };
  }, [treeRoot, searchQuery, activeTypeFilters, hasFilter]);

  // Keyboard shortcut: Cmd+F to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && fileData) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fileData]);

  const toggleTypeFilter = useCallback((type: string) => {
    setActiveTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);else next.add(type);
      return next;
    });
  }, []);

  const toggleHiddenType = useCallback((type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);else next.add(type);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveTypeFilters(new Set());
    setHiddenTypes(new Set());
  }, []);

  // Load file data from API
  const loadFileData = useCallback(async (id: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Load feature options first so image rendering type is known before any image loads
      await api.loadFeatureOptions();

      const data = (await api.getFigmaFile(id)) as any;
      setFileData(data);
      setSelectedCanvas(null); // reset so auto-select fires for new file

      // Load variables + metadata in parallel
      const [vars, meta] = (await Promise.all([
      api.getFileVariables(id).catch(() => []),
      api.getFileMeta(id).catch(() => null)]
      )) as [any[], any];
      setVariables(vars);
      setFileMeta(meta?.file ?? meta);

      // Load pinned nodes and node labels
      loadPins(id);
      loadNodeLabels(id);

      // Auto-expand first canvas children
      const firstCanvas = data.document.children?.[0];
      if (firstCanvas?.children) {
        setExpandedNodes(firstCanvas.children.map((c: FigmaNode) => c.id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load Figma file');
      console.error('Error loading file:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-load when arriving via /load/file/:id route
  useEffect(() => {
    if (routeFileId) {
      setFileId(routeFileId);
      loadFileData(routeFileId);
    }
  }, [routeFileId, loadFileData]);

  // Sync tab/sub-section state from URL on back/forward navigation
  useEffect(() => {
    const tab = (routeTab && validTabIds.includes(routeTab) ? routeTab : 'pins') as TopTab;
    const tabDef = TOP_TABS.find((t) => t.id === tab);
    const subs = tabDef?.subSections?.map((s) => s.id) ?? [];
    const sub = routeSubSection && subs.includes(routeSubSection) ?
    routeSubSection :
    tabDef?.subSections?.[0]?.id ?? null;

    setActiveTopTab(tab);
    setActiveSubSection(sub);

    // Restore selected node from ?node= param
    const params = new URLSearchParams(location.search);
    const nodeId = params.get('node');
    if (nodeId && fileData) {
      const flat = treeRoot ? flattenNodes(treeRoot) : [];
      const node = flat.find((n: any) => n.id === nodeId);
      if (node && node.id !== selectedNode?.id) {
        handleSelectNode(node as FigmaNode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTab, routeSubSection, location.search]);

  // Handle form submit: navigate to /load/file/:id
  const handleLoadFile = useCallback(() => {
    if (!fileId.trim()) {
      setError('Please enter a Figma File ID');
      return;
    }
    navigate(`/load/file/${encodeURIComponent(fileId.trim())}`);
  }, [fileId, navigate]);

  // Build URL path from current state
  const buildPath = useCallback((tabId: TopTab, subId?: string | null, nodeId?: string | null) => {
    const fId = fileId.trim();
    if (!fId) return '/';
    let path = `/load/file/${encodeURIComponent(fId)}`;
    // Only append tab if not the default
    if (tabId !== 'pins') {
      path += `/${tabId}`;
      if (subId) path += `/${subId}`;
    } else if (tabId === 'pins' && subId) {
      path += `/${tabId}`;
    }
    const params = new URLSearchParams();
    if (nodeId) params.set('node', nodeId);
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  }, [fileId]);

  // Navigate to a specific tab and optional sub-section (pushes to history)
  const navigateToTab = useCallback((tabId: TopTab, subSectionId?: string) => {
    const tab = TOP_TABS.find((t) => t.id === tabId);
    const resolvedSub = subSectionId ?? tab?.subSections?.[0]?.id ?? null;
    setActiveTopTab(tabId);
    setActiveSubSection(resolvedSub);
    setShowNodeModal(false);
    const nodeId = selectedNode?.id ?? null;
    navigate(buildPath(tabId, resolvedSub, nodeId));
  }, [buildPath, navigate, selectedNode]);

  // Fetch image via proxy and track cache status (respects feature option: image_rendering_type)
  const loadProxyImage = useCallback(async (fId: string, nodeId: string, bust = false) => {
    setImageCacheStatus(null);
    setImageCacheDate(null);
    setImageIsPlaceholder(false);
    setImageLoadError(false);
    setImageFetching(true);
    setImageDecoding(false);
    try {
      const result = await api.loadImageSrc(fId, nodeId, { bust });
      setNodeImage(result.src);
      setImageIsPlaceholder(result.isPlaceholder);
      setImageCacheStatus(result.cacheStatus as any);
      setImageCacheDate(result.cacheDate);
      // If not a placeholder, the browser still needs to decode the image
      if (result.src && !result.isPlaceholder) setImageDecoding(true);
    } catch {
      setNodeImage(null);
      setImageLoadError(true);
    } finally {
      setImageFetching(false);
    }
  }, []);

  // Select node and load details
  const handleSelectNode = useCallback(async (node: FigmaNode) => {
    setSelectedNode(node);
    setNodeDetails(null);
    setNodeImage(null);
    setImageIsPlaceholder(false);
    setImageLoadError(false);

    // Update URL with node param (replace, not push — node selection is not a nav step)
    const path = buildPath(activeTopTab, activeSubSection, node.id);
    navigate(path, { replace: true });

    try {
      // Load node details
      const details = await api.getNodeDetails(fileId, node.id);
      setNodeDetails(details);

      // Load node image via server proxy (S3-cached)
      await loadProxyImage(fileId, node.id);

      // Load comments for this node
      const nodeComments = (await api.getComments(fileId, node.id)) as any[];
      setComments(nodeComments);
    } catch (err) {
      console.error('Error loading node details:', err);
    }
  }, [fileId, loadProxyImage, buildPath, activeTopTab, activeSubSection, navigate]);

  // Toggle node expansion (keyed by node ID, not name)
  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) =>
    prev.includes(nodeId) ?
    prev.filter((id) => id !== nodeId) :
    [...prev, nodeId]
    );
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    });
  }, []);

  // Handle zoom
  const handleZoomChange = useCallback((delta: number) => {
    setZoomLevel((prev) => Math.max(25, Math.min(200, prev + delta)));
  }, []);

  // Download selected node as image
  const handleDownloadImage = useCallback(async () => {
    if (!nodeImage || !selectedNode) return;
    try {
      const safeName = selectedNode.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const a = document.createElement('a');
      a.download = `${safeName}.png`;

      if (nodeImage.startsWith('data:')) {
        // base64 data URL — use directly
        a.href = nodeImage;
      } else {
        // blob URL or content-type URL — fetch and create blob
        const response = await fetch(nodeImage);
        const blob = await response.blob();
        a.href = URL.createObjectURL(blob);
      }

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (a.href.startsWith('blob:')) URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  }, [nodeImage, selectedNode]);

  // Add comment
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !selectedNode) return;

    try {
      await api.createComment({
        fileId,
        nodeId: selectedNode.id,
        userId: 'user-1',
        userName: 'Current User',
        text: commentText
      });

      setCommentText('');

      // Reload comments
      const nodeComments = (await api.getComments(fileId, selectedNode.id)) as any[];
      setComments(nodeComments);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  }, [commentText, fileId, selectedNode]);

  // ── Pin helpers ──
  const loadPins = useCallback(async (fId: string) => {
    try {
      const data = await api.getPins(fId);
      setPins(data);
    } catch {/* ignore if table doesn't exist yet */}
  }, []);

  const isNodePinned = useMemo(() => {
    if (!selectedNode) return false;
    return pins.some((p) => p.nodeId === selectedNode.id);
  }, [pins, selectedNode]);

  const getNodePin = useCallback((nodeId: string) => {
    return pins.find((p) => p.nodeId === nodeId) ?? null;
  }, [pins]);

  const handleSavePin = useCallback(async () => {
    if (!nodeModalTarget || !fileData) return;
    const parsedTags = pinForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const path = findNodePath(fileData.document, nodeModalTarget.id);
    const nodePath = path ? path.slice(1).join(' / ') : nodeModalTarget.name;

    try {
      if (editingPin) {
        await api.updatePin(editingPin.id, {
          tags: parsedTags,
          description: pinForm.description || undefined
        });
      } else {
        await api.createPin({
          fileId,
          nodeId: nodeModalTarget.id,
          nodeName: nodeModalTarget.name,
          nodeType: nodeModalTarget.type,
          tags: parsedTags,
          description: pinForm.description || undefined,
          nodePath
        });
      }
      await loadPins(fileId);
    } catch (err) {
      console.error('Error saving pin:', err);
    }
  }, [nodeModalTarget, fileData, fileId, pinForm, editingPin, loadPins]);

  const handleUnpin = useCallback(async (pinId: string) => {
    try {
      await api.deletePin(pinId);
      await loadPins(fileId);
    } catch (err) {
      console.error('Error removing pin:', err);
    }
  }, [fileId, loadPins]);

  // ── Node label helpers ──
  const loadNodeLabels = useCallback(async (fId: string) => {
    try {
      const labels = await api.getNodeLabels(fId);
      const map = new Map<string, string>();
      for (const l of labels) map.set(l.nodeId, l.displayName);
      setNodeLabels(map);
    } catch {/* ignore if table doesn't exist yet */}
  }, []);

  const openNodeModal = useCallback((node: FigmaNode, existingPin?: api.PinData) => {
    setNodeModalTarget(node);
    setNodeModalDisplayName(nodeLabels.get(node.id) || '');
    // Initialize pin form from existing pin or reset
    const pin = existingPin ?? pins.find((p) => p.nodeId === node.id);
    if (pin) {
      setEditingPin(pin);
      setPinForm({
        tags: (pin.tags || []).join(', '),
        description: pin.description || ''
      });
    } else {
      setEditingPin(null);
      setPinForm({ tags: '', description: '' });
    }
    setShowNodeModal(true);
  }, [nodeLabels, pins]);

  const handleSaveNodeLabel = useCallback(async () => {
    if (!nodeModalTarget) return;
    try {
      await api.upsertNodeLabel({
        fileId,
        nodeId: nodeModalTarget.id,
        displayName: nodeModalDisplayName.trim()
      });
      await loadNodeLabels(fileId);
    } catch (err) {
      console.error('Error saving node label:', err);
    }
  }, [nodeModalTarget, nodeModalDisplayName, fileId, loadNodeLabels]);

  // Render tree recursively with search/filter awareness
  // Indent caps at MAX_INDENT_DEPTH so deep nodes stay readable in the panel.
  const INDENT_PX = 16;

  /** Collect matched nodes in document order (depth-first) for flat filtered list. */
  const flatFilteredNodes = useMemo<FigmaNode[]>(() => {
    if (!treeRoot || !hasFilter || !matchIds) return [];
    const result: FigmaNode[] = [];
    function walk(node: FigmaNode) {
      if (matchIds!.has(node.id)) result.push(node);
      for (const child of node.children ?? []) walk(child);
    }
    walk(treeRoot);
    return result;
  }, [treeRoot, hasFilter, matchIds]);

  const renderTree = (node: FigmaNode, level: number = 0): JSX.Element[] | null => {
    if (!node.children || node.children.length === 0) return null;

    return node.children.flatMap((child) => {
      // If this node type is hidden, skip it but render its children at this level
      if (hiddenTypes.has(child.type)) {
        if (child.children && child.children.length > 0) {
          return renderTree(child, level) ?? [];
        }
        return [];
      }

      const hasChildren = child.children && child.children.length > 0;
      const isExpanded = expandedNodes.includes(child.id);
      const isSelected = selectedNode?.id === child.id;
      const showChildren = hasChildren && isExpanded;

      const typeConfig = NODE_TYPE_CONFIG[child.type];
      const IconEl = typeConfig?.icon ?? Layers;
      const iconColor = typeConfig?.color ?? '#9CA3AF';
      const displayName = nodeLabels.get(child.id);
      const isPinned = pins.some((p) => p.nodeId === child.id);

      return (
        <div key={child.id}>
          <div
            data-testid="tree-node"
            data-type={child.type}
            data-node-id={child.id}
            className={`group/node flex items-center gap-1.5 pr-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer transition-colors whitespace-nowrap ${
            isSelected ? 'bg-purple-50 border-l-2 border-purple-500' : ''}`
            }
            style={{ paddingLeft: `${level * INDENT_PX + 8}px` }}
            onClick={() => {
              if (hasChildren) toggleNode(child.id);
              handleSelectNode(child);
            }}>

            {hasChildren &&
            <button className="flex-shrink-0" onClick={(e) => {e.stopPropagation();toggleNode(child.id);}}>
                {showChildren ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            }
            {!hasChildren && <div className="w-3 flex-shrink-0" />}
            <IconEl className="w-3.5 h-3.5 flex-shrink-0" style={{ color: iconColor }} />
            {isPinned && <Pin className="w-2.5 h-2.5 text-purple-400 flex-shrink-0 -ml-0.5" />}
            <span
              className={`text-sm ${isSelected ? 'font-medium text-purple-700' : 'text-gray-700'}`}
              title={displayName ? `${child.name} (${child.type})` : child.type}>

              {displayName || child.name}
            </span>
            {displayName &&
            <span className="text-[10px] text-gray-400 italic flex-shrink-0">{child.name}</span>
            }
            {/* Action button */}
            <button
              className="ml-auto p-0.5 rounded hover:bg-gray-200 opacity-0 group-hover/node:opacity-100 transition-opacity flex-shrink-0"
              onClick={(e) => {e.stopPropagation();openNodeModal(child);}}
              title="Node actions">

              <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          {showChildren && renderTree(child, level + 1)}
        </div>);

    });
  };

  /** Render a flat list of matched nodes (used when filters are active). */
  const renderFilteredList = (nodes: FigmaNode[]): JSX.Element[] => {
    return nodes.map((node) => {
      const isSelected = selectedNode?.id === node.id;
      const typeConfig = NODE_TYPE_CONFIG[node.type];
      const IconEl = typeConfig?.icon ?? Layers;
      const iconColor = typeConfig?.color ?? '#9CA3AF';
      const displayName = nodeLabels.get(node.id);

      return (
        <div
          key={node.id}
          data-testid="tree-node"
          data-type={node.type}
          data-node-id={node.id}
          className={`group/node flex items-center gap-1.5 pr-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer transition-colors whitespace-nowrap ${
          isSelected ? 'bg-purple-50 border-l-2 border-purple-500' : ''}`
          }
          style={{ paddingLeft: '8px' }}
          onClick={() => handleSelectNode(node)}>

          <div className="w-3 flex-shrink-0" />
          <IconEl className="w-3.5 h-3.5 flex-shrink-0" style={{ color: iconColor }} />
          <span
            className={`text-sm ${isSelected ? 'font-medium text-purple-700' : 'text-gray-700'}`}
            title={displayName ? `${node.name} (${node.type})` : node.type}>

            <HighlightMatch text={displayName || node.name} query={searchQuery} />
          </span>
          {typeConfig &&
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0"
            style={{ color: iconColor, borderColor: iconColor + '44', background: iconColor + '11' }}>

              {typeConfig.label}
            </span>
          }
          <button
            className="ml-auto p-0.5 rounded hover:bg-gray-200 opacity-0 group-hover/node:opacity-100 transition-opacity flex-shrink-0"
            onClick={(e) => {e.stopPropagation();openNodeModal(node);}}
            title="Node actions">

            <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>);

    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between" data-test-id="div-b670420a">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
            {fileData &&
            <>
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <File className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span data-testid="file-name" className="text-sm font-semibold text-gray-900 truncate">{fileData.name}</span>
                    <button className="p-0.5 hover:bg-gray-100 rounded flex-shrink-0" onClick={handleLoadFile}>
                      <RefreshCw className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400 mt-0.5">
                    <span><span className="text-gray-500">modified:</span> {formatRelativeTime(fileMeta?.last_touched_at || fileData.lastModified)}</span>
                    {fileMeta?.creator?.handle && <span><span className="text-gray-500">owner:</span> {fileMeta.creator.handle}</span>}
                    <span><span className="text-gray-500">fileID:</span> <span className="font-mono">{fileId}</span></span>
                    {fileMeta?.folder_name && <span><span className="text-gray-500">folder:</span> {fileMeta.folder_name}</span>}
                  </div>
                </div>
              </>
            }
          </div>

          {!fileData ?
          <div className="flex items-center gap-3">
              <input
              data-testid="file-id-input"
              type="text"
              placeholder="analysis figma file >>"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLoadFile()}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />

              <button
              data-testid="load-file-button"
              onClick={handleLoadFile}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2">

                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isLoading ? 'Loading...' : 'Load File'}
              </button>
            </div> :

          <div className="flex items-center gap-3">
              <button
              onClick={() => {
                const url = selectedNode ?
                `https://www.figma.com/design/${encodeURIComponent(fileId)}?node-id=${selectedNode.id}` :
                `https://www.figma.com/design/${encodeURIComponent(fileId)}`;
                window.open(url, '_blank', 'noopener');
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">

                <ExternalLink className="w-4 h-4" />
                Open in Figma
              </button>
            </div>
          }
        </div>
        {error &&
        <div className="mt-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        }
      </header>

      {/* Top Tab Bar */}
      {fileData &&
      <nav className="bg-white border-b border-gray-200 flex items-center">
          {/* Left scroll arrow */}
          <button
          onClick={() => scrollTabs('left')}
          disabled={!tabScrollState.canLeft}
          className={`flex-shrink-0 flex items-center justify-center w-8 h-full py-3 transition-colors ${
          tabScrollState.canLeft ?
          'text-gray-500 hover:text-gray-800 hover:bg-gray-50 cursor-pointer' :
          'text-gray-200 cursor-default'} ${
          tabScrollState.needsArrows ? '' : 'invisible'}`} data-test-id="button-d959671a">

            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable tab container */}
          <div
          ref={tabScrollRef}
          onScroll={updateTabScroll}
          className="flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} data-test-id="div-02bb1454">

            <div className="flex items-center gap-0 -mb-px">
              {TOP_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTopTab === tab.id;
              const colorMap: Record<string, {active: string;border: string;}> = {
                purple: { active: 'border-purple-500 text-purple-700', border: 'hover:border-purple-300' },
                green: { active: 'border-green-500 text-green-700', border: 'hover:border-green-300' },
                blue: { active: 'border-blue-500 text-blue-700', border: 'hover:border-blue-300' },
                amber: { active: 'border-amber-500 text-amber-700', border: 'hover:border-amber-300' },
                teal: { active: 'border-teal-500 text-teal-700', border: 'hover:border-teal-300' }
              };
              const c = tab.color ? colorMap[tab.color] : null;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateToTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive ?
                  c?.active ?? 'border-gray-600 text-gray-900' :
                  `border-transparent text-gray-500 hover:text-gray-700 ${c?.border ?? 'hover:border-gray-300'}`}`
                  }>

                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'pins' && pins.length > 0 &&
                  <span className="min-w-[1.25rem] h-5 px-1 bg-gray-200 text-gray-600 text-[10px] rounded-full inline-flex items-center justify-center font-semibold">
                        {pins.length}
                      </span>
                  }
                  </button>);

            })}
            </div>
          </div>

          {/* Right scroll arrow */}
          <button
          onClick={() => scrollTabs('right')}
          disabled={!tabScrollState.canRight}
          className={`flex-shrink-0 flex items-center justify-center w-8 h-full py-3 transition-colors ${
          tabScrollState.canRight ?
          'text-gray-500 hover:text-gray-800 hover:bg-gray-50 cursor-pointer' :
          'text-gray-200 cursor-default'} ${
          tabScrollState.needsArrows ? '' : 'invisible'}`} data-test-id="button-4d0174e1">

            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      }

      {/* Breadcrumb bar — persists across tabs when a node is selected (hidden on export) */}
      {fileData && selectedNode && activeTopTab !== 'export' &&
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 flex items-center justify-between flex-shrink-0">
          {/* Path */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Component className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <nav data-testid="breadcrumb" className="flex items-center gap-1 flex-wrap min-w-0">
              {(() => {
              const path = findNodePath(fileData.document, selectedNode.id);
              const crumbs = path ? path.slice(1) : [selectedNode.name];
              return crumbs.map((name: string, i: number) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <React.Fragment key={i}>
                      {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                      <span
                      className={`text-xs font-mono ${isLast ? 'font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                      title={name}>

                        {name}
                      </span>
                    </React.Fragment>);

              });
            })()}
            </nav>
          </div>

          {/* Node ID */}
          <code className="text-[10px] font-mono text-gray-400 flex-shrink-0 mx-3">{selectedNode.id}</code>

          {/* Action icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isNodePinned && <Pin className="w-3 h-3 text-purple-500" />}
            <button
            onClick={() => copyToClipboard(selectedNode.id, 'node-id')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Copy node ID">

              {copied === 'node-id' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
            </button>
            <button
            onClick={() => {
              const url = `https://www.figma.com/design/${encodeURIComponent(fileId)}?node-id=${selectedNode.id}`;
              window.open(url, '_blank', 'noopener');
            }}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Open in Figma">

              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button
            onClick={() => openNodeModal(selectedNode)}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Node actions">

              <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      }

      {/* Main Content */}
      {fileData && activeTopTab !== 'structure' && (() => {
        const currentTab = TOP_TABS.find((t) => t.id === activeTopTab);
        const subs = currentTab?.subSections;
        const tabColor = currentTab?.color;
        const subColorMap: Record<string, {active: string;hover: string;dot: string;}> = {
          purple: { active: 'text-purple-700 border-purple-500', hover: 'hover:text-purple-600', dot: 'bg-purple-500' },
          green: { active: 'text-green-700 border-green-500', hover: 'hover:text-green-600', dot: 'bg-green-500' },
          blue: { active: 'text-blue-700 border-blue-500', hover: 'hover:text-blue-600', dot: 'bg-blue-500' },
          amber: { active: 'text-amber-700 border-amber-500', hover: 'hover:text-amber-600', dot: 'bg-amber-500' },
          teal: { active: 'text-teal-700 border-teal-500', hover: 'hover:text-teal-600', dot: 'bg-teal-500' }
        };
        const sc = tabColor ? subColorMap[tabColor] : null;
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-section nav for tabs with sections */}
          {subs && subs.length > 0 &&
            <div className="bg-gray-50 border-b border-gray-200 px-6">
              <div className="flex items-center gap-1">
                {subs.map((sub) => {
                  const isActiveSub = activeSubSection === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubSection(sub.id);
                        navigate(buildPath(activeTopTab, sub.id, selectedNode?.id ?? null));
                      }}
                      className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActiveSub ?
                      sc?.active ?? 'text-gray-900 border-gray-600' :
                      `border-transparent text-gray-500 ${sc?.hover ?? 'hover:text-gray-700'}`}`
                      }>

                      {sub.label}
                    </button>);

                })}
              </div>
            </div>
            }
          <div className="flex-1 overflow-auto">
          {activeTopTab === 'pins' &&
              <div className="max-w-5xl mx-auto p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Pinned Nodes</h2>
                  <p className="text-sm text-gray-500">Saved references for quick access across sessions.</p>
                </div>
                <span className="text-xs text-gray-400">{pins.length} pin{pins.length !== 1 ? 's' : ''}</span>
              </div>

              {pins.length === 0 ?
                <div className="text-center py-16">
                  <Pin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">No pinned nodes yet</p>
                  <p className="text-xs text-gray-400">Select a node in the tree and click the pin icon in the breadcrumb bar.</p>
                </div> :

                <div className="space-y-3">
                  {pins.map((pin) =>
                  <div key={pin.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-200 transition-colors group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Pin className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              {pin.nodeName || pin.nodeId}
                            </span>
                            {pin.nodeType &&
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-gray-200 text-gray-500 flex-shrink-0">
                                {pin.nodeType}
                              </span>
                          }
                          </div>
                          {pin.nodePath &&
                        <p className="text-[11px] text-gray-400 ml-5 mb-1">{pin.nodePath}</p>
                        }
                          {pin.description &&
                        <p className="text-xs text-gray-600 ml-5 mt-1">{pin.description}</p>
                        }
                          {pin.tags.length > 0 &&
                        <div className="flex items-center gap-1 ml-5 mt-2">
                              <Tag className="w-3 h-3 text-gray-400" />
                              {pin.tags.map((tag) =>
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                                  {tag}
                                </span>
                          )}
                            </div>
                        }
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                          onClick={() => {
                            const flat = treeRoot ? flattenNodes(treeRoot) : [];
                            const node = flat.find((n) => n.id === pin.nodeId);
                            if (node) {
                              handleSelectNode(node as FigmaNode);
                              navigateToTab('structure');
                            }
                          }}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                          title="Go to node">

                            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button
                          onClick={() => {
                            const flat = treeRoot ? flattenNodes(treeRoot) : [];
                            const node = flat.find((n) => n.id === pin.nodeId);
                            if (node) openNodeModal(node as FigmaNode, pin);
                          }}
                          className="p-1.5 rounded hover:bg-purple-100 transition-colors"
                          title="Edit node">

                            <Settings className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button
                          onClick={() => handleUnpin(pin.id)}
                          className="p-1.5 rounded hover:bg-red-100 transition-colors"
                          title="Remove pin">

                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                }
            </div>
              }

          {/* ── Design System ── */}
          {activeTopTab === 'design-system' && activeSubSection === 'analysis' &&
              <ComponentAtlas fileId={fileId} />
              }
          {activeTopTab === 'design-system' && activeSubSection === 'coverage' &&
              <ComponentCoverageInsights
                fileId={fileId}
                onViewNode={(nodeId) => {
                  setActiveTopTab('structure');
                  setActiveSubSection(null);
                  setShowNodeModal(false);
                  navigate(buildPath('structure', null, nodeId));
                }} />

              }
          {activeTopTab === 'design-system' && activeSubSection !== 'analysis' && activeSubSection !== 'coverage' &&
              <div className="max-w-5xl mx-auto p-8 space-y-8">

              {activeSubSection === 'tokens' &&
                <TokensAndExportPanel variables={variables} fileId={fileId} />
                }
              {activeSubSection === 'file-json-schema' &&
                <DesignSystemAnalysis fileId={fileId} />
                }
            </div>
              }

          {/* ── Export & Code ── */}
          {activeTopTab === 'export' &&
              <div className="max-w-5xl mx-auto p-8 space-y-8">
              {activeSubSection === 'web-assets' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Web Assets</h2>
                    <p className="text-sm text-gray-500">Generate and preview HTML, CSS, or Tailwind classes from design nodes.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                      <Code2 className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">Generate and preview HTML, CSS, or Tailwind classes from design nodes.</p>
                    <button className="mt-4 text-sm text-green-600 font-medium hover:text-green-700">Coming soon</button>
                  </div>
                </>
                }
              {activeSubSection === 'react-component' &&
                <ReactComponentGenerator fileId={fileId} />
                }
              {activeSubSection === 'framework' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Framework Components</h2>
                    <p className="text-sm text-gray-500">Generate structural React code based on the Figma node hierarchy.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                      <Component className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">Generate structural React code based on the Figma node hierarchy.</p>
                    <button className="mt-4 text-sm text-green-600 font-medium hover:text-green-700">Coming soon</button>
                  </div>
                </>
                }
              {activeSubSection === 'token-export' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Token Export</h2>
                    <p className="text-sm text-gray-500">Download variables as JSON, CSS Variables, or SCSS for your codebase.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                      <Download className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">Download variables as JSON, CSS Variables, or SCSS for your codebase.</p>
                    <button className="mt-4 text-sm text-green-600 font-medium hover:text-green-700">Coming soon</button>
                  </div>
                </>
                }
            </div>
              }

          {/* ── AI & Context ── */}
          {activeTopTab === 'ai-context' &&
              <div className="max-w-5xl mx-auto p-8 space-y-8">
              {activeSubSection === 'figma-react' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Figma to React Mapping</h2>
                    <p className="text-sm text-gray-500">Visualize how Figma components map to existing React components in your codebase.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600">Visualize how Figma components map to existing React components in your codebase.</p>
                    <button className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700">Coming soon</button>
                  </div>
                </>
                }
              {activeSubSection === 'labeling' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Component Labeling</h2>
                    <p className="text-sm text-gray-500">AI-generated semantic labels for unnamed or poorly named layers.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600">AI-generated semantic labels for unnamed or poorly named layers.</p>
                    <button className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700">Coming soon</button>
                  </div>
                </>
                }
              {activeSubSection === 'insights' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Extract Data Insights</h2>
                    <p className="text-sm text-gray-500">Automated analysis highlighting accessibility issues, inconsistent tokens, or structural anomalies.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600">Automated analysis highlighting accessibility issues, inconsistent tokens, or structural anomalies.</p>
                    <button className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700">Coming soon</button>
                  </div>
                </>
                }
              {activeSubSection === 'resources' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Resource Linking</h2>
                    <p className="text-sm text-gray-500">Pull in relevant documentation, context, or similar past designs using retrieval patterns.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600">Pull in relevant documentation, context, or similar past designs using retrieval patterns.</p>
                    <button className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700">Coming soon</button>
                  </div>
                </>
                }
            </div>
              }

          {/* ── Product Alignment ── */}
          {activeTopTab === 'product' &&
              <div className="max-w-5xl mx-auto p-8 space-y-8">
              {activeSubSection === 'features' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Features Tree</h2>
                    <p className="text-sm text-gray-500">Design mapped to actual product capabilities and user flows.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600">Design mapped to actual product capabilities and user flows.</p>
                    <button className="mt-3 text-sm text-amber-600 font-medium hover:text-amber-700">Coming soon</button>
                  </div>
                </>
                }
              {activeSubSection === 'integrations' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Project Integrations</h2>
                    <p className="text-sm text-gray-500">Two-way links to Jira tickets, Linear issues, or specific PRs.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600">Two-way links to Jira tickets, Linear issues, or specific PRs.</p>
                    <button className="mt-3 text-sm text-amber-600 font-medium hover:text-amber-700">Coming soon</button>
                  </div>
                </>
                }
              {activeSubSection === 'wiki' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Self-Doc Wiki</h2>
                    <p className="text-sm text-gray-500">Auto-generated documentation explaining the purpose of frames and user flows.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm text-gray-600">Auto-generated documentation explaining the purpose of frames and user flows.</p>
                    <button className="mt-3 text-sm text-amber-600 font-medium hover:text-amber-700">Coming soon</button>
                  </div>
                </>
                }
            </div>
              }

          {/* ── Activity & History ── */}
          {activeTopTab === 'activity' &&
              <div className="max-w-5xl mx-auto p-8 space-y-8">
              {activeSubSection === 'versions' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Version History</h2>
                    <p className="text-sm text-gray-500">Timeline of saves and published changes.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <History className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Version History</h3>
                        <p className="text-xs text-gray-500">Timeline of saves and published changes</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">A timeline of major saves or published changes to the file.</p>
                    <button className="mt-3 text-sm text-teal-600 font-medium hover:text-teal-700">Coming soon</button>
                  </div>
                </>
                }
              {activeSubSection === 'comments' &&
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Comments & Feedback</h2>
                    <p className="text-sm text-gray-500">Aggregated Figma comments — filter by resolved/unresolved or specific frames.</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <Send className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Comments & Feedback</h3>
                        <p className="text-xs text-gray-500">Aggregated Figma comments</p>
                      </div>
                    </div>
                    {comments.length > 0 ?
                    <div className="mt-4 space-y-2">
                        {comments.map((c: any) =>
                      <div key={c.id} className="flex items-start gap-2 py-1.5 px-3 bg-gray-50 rounded text-xs">
                            <span className="font-medium text-gray-700">{c.userName}:</span>
                            <span className="text-gray-600">{c.text}</span>
                          </div>
                      )}
                      </div> :

                    <p className="text-sm text-gray-500 mt-2">No comments yet.</p>
                    }
                  </div>
                </>
                }
            </div>
              }
          </div>
        </div>);

      })()}

      {fileData && activeTopTab === 'structure' ?
      <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Tree */}
          <aside className="w-80 min-w-[20rem] min-h-0 bg-white border-r border-gray-200 flex flex-col">
            {/* Document / Canvas selectors */}
            <div className="p-3 border-b border-gray-200 space-y-2 flex-shrink-0" data-test-id="div-f94a912c">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Document</label>
                <Select<NodeOption>
                value={documentOption}
                options={documentOption ? [documentOption] : []}
                isSearchable
                isDisabled
                styles={selectStyles}
                placeholder="No document loaded" />

              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Canvas</label>
                <Select<NodeOption>
                value={selectedCanvas}
                options={canvasOptions}
                isSearchable
                onChange={(opt: SingleValue<NodeOption>) => {
                  setSelectedCanvas(opt);
                  // Auto-expand first level of the new canvas
                  if (opt?.node.children) {
                    setExpandedNodes(opt.node.children.map((c: FigmaNode) => c.id));
                  } else {
                    setExpandedNodes([]);
                  }
                  setSelectedNode(null);
                  setSearchQuery('');
                  setActiveTypeFilters(new Set());
                  setHiddenTypes(new Set());
                }}
                styles={selectStyles}
                placeholder="Select a canvas..."
                noOptionsMessage={() => 'No canvases found'} />

              </div>
            </div>

            {/* Search + filter controls */}
            <div className="p-3 border-b border-gray-200 space-y-2 flex-shrink-0" data-test-id="div-6bbc8d5c">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search layers..."
                  className={`w-full pl-10 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  searchQuery ? 'border-purple-300 bg-purple-50/30' : 'border-gray-300'}`
                  } />

                  {searchQuery &&
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">

                      <X className="w-3.5 h-3.5" />
                    </button>
                }
                </div>
                <button
                onClick={() => setShowFilterPanel((p) => !p)}
                className={`p-2 rounded-lg border transition-colors ${
                showFilterPanel || activeTypeFilters.size > 0 || hiddenTypes.size > 0 ?
                'border-purple-300 bg-purple-50 text-purple-600' :
                'border-gray-300 text-gray-500 hover:text-gray-700'}`
                }
                title="Filter by type">

                  <Filter className="w-4 h-4" />
                  {activeTypeFilters.size + hiddenTypes.size > 0 &&
                <span className="absolute ml-2 -mt-4 w-4 h-4 text-[9px] bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {activeTypeFilters.size + hiddenTypes.size}
                    </span>
                }
                </button>
              </div>

              {/* Type filter chips */}
              {showFilterPanel &&
            <div className="space-y-2 pt-1">
                  {/* Show only — type filter */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-0.5">Show only</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {availableTypes.map((type) => {
                    const config = NODE_TYPE_CONFIG[type];
                    const label = config?.label ?? type;
                    const color = config?.color ?? '#9CA3AF';
                    const active = activeTypeFilters.has(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleTypeFilter(type)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors"
                        style={{
                          borderColor: active ? color + '88' : '#E5E7EB',
                          background: active ? color + '18' : 'transparent',
                          color: active ? color : '#6B7280'
                        }}>

                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                            {label}
                          </button>);

                  })}
                    </div>
                  </div>

                  {/* Hide — collapse types but keep children */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-0.5">Hide in tree</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {availableTypes.map((type) => {
                    const config = NODE_TYPE_CONFIG[type];
                    const label = config?.label ?? type;
                    const color = config?.color ?? '#9CA3AF';
                    const active = hiddenTypes.has(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleHiddenType(type)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors"
                        style={{
                          borderColor: active ? '#EF4444' + '88' : '#E5E7EB',
                          background: active ? '#EF4444' + '12' : 'transparent',
                          color: active ? '#EF4444' : '#6B7280',
                          textDecoration: active ? 'line-through' : 'none'
                        }}>

                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, opacity: active ? 0.4 : 1 }} />
                            {label}
                          </button>);

                  })}
                    </div>
                  </div>
                </div>
            }

              {/* Result count + clear */}
              {(hasFilter || hiddenTypes.size > 0) &&
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                  <span>
                    {hasFilter ? `${matchCount} result${matchCount !== 1 ? 's' : ''}` : ''}
                    {hasFilter && hiddenTypes.size > 0 ? ' · ' : ''}
                    {hiddenTypes.size > 0 ? `${hiddenTypes.size} type${hiddenTypes.size !== 1 ? 's' : ''} hidden` : ''}
                  </span>
                  <button onClick={clearFilters} className="text-purple-600 hover:text-purple-800 font-medium">
                    Clear
                  </button>
                </div>
            }
            </div>

            <div data-testid="component-tree" className="flex-1 min-h-0 overflow-x-auto overflow-y-auto p-3" data-test-id="div-c1eb6131">
              <div className="inline-block" style={{ minWidth: 'max-content' }}>
              {hasFilter ?
              flatFilteredNodes.length > 0 ?
              renderFilteredList(flatFilteredNodes) :

              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Search className="w-8 h-8 mb-2 opacity-40" />
                      <span className="text-sm">No layers found</span>
                      <button onClick={clearFilters} className="mt-2 text-xs text-purple-600 hover:underline">Clear filters</button>
                    </div> :


              treeRoot && renderTree(treeRoot)
              }
              </div>
            </div>
          </aside>

          {/* Center - Preview */}
          <main className="flex-1 flex flex-col bg-gray-100">
            {selectedNode ?
          <>
                <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between">
                  <h2 data-testid="component-name" className="text-sm font-semibold text-gray-900">{selectedNode.name}</h2>
                  <div className="flex items-center gap-2">
                    <button data-testid="zoom-out" onClick={() => handleZoomChange(-25)} className="p-1.5 hover:bg-gray-100 rounded">
                      <ZoomOut className="w-4 h-4 text-gray-600" />
                    </button>
                    <span data-testid="zoom-level" className="text-sm font-medium text-gray-700 w-12 text-center">{zoomLevel}%</span>
                    <button data-testid="zoom-in" onClick={() => handleZoomChange(25)} className="p-1.5 hover:bg-gray-100 rounded">
                      <ZoomIn className="w-4 h-4 text-gray-600" />
                    </button>
                    {nodeImage && !imageIsPlaceholder && !imageLoadError &&
                <>
                        <button
                    onClick={() => window.open(nodeImage, '_blank')}
                    className="p-1.5 hover:bg-gray-100 rounded ml-1"
                    title="Open image in new tab">

                          <ImageIcon className="w-4 h-4 text-gray-600" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        {imageCacheStatus &&
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    imageCacheStatus === 'HIT' || imageCacheStatus === 'MEM-HIT' ? 'bg-green-100 text-green-700' :
                    imageCacheStatus === 'MISS' || imageCacheStatus === 'MEM-MISS' ? 'bg-amber-100 text-amber-700' :
                    imageCacheStatus === 'DIRECT' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'}`
                    }
                    title={imageCacheDate ? new Date(imageCacheDate).toLocaleString() : undefined}>

                            {imageCacheStatus === 'HIT' ? 'S3 Cached' :
                    imageCacheStatus === 'MEM-HIT' ? 'Mem Cached' :
                    imageCacheStatus === 'MISS' ? 'S3 Fresh' :
                    imageCacheStatus === 'MEM-MISS' ? 'Mem Fresh' :
                    imageCacheStatus === 'DIRECT' ? 'Direct' : 'Bypass'}
                            {imageCacheDate &&
                    <span className="ml-1 opacity-70">{formatRelativeTime(imageCacheDate)}</span>
                    }
                          </span>
                  }
                        <button
                    onClick={() => loadProxyImage(fileId, selectedNode.id, true)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title="Reload from Figma (bypass cache)">

                          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </>
                }
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-8">
                  <div className="bg-white rounded-lg shadow-xl mx-auto" style={{ width: 'fit-content' }}>
                    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                      <div
                    data-testid="component-preview"
                    className="relative bg-white rounded-lg shadow-lg p-8 flex items-center justify-center"
                    style={{ transform: `scale(${zoomLevel / 100})` }}>

                        {imageIsPlaceholder || imageLoadError ?
                    <div data-testid="preview-unavailable" className="p-8 text-center">
                            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400 font-medium">No preview available</p>
                            <p className="text-xs text-gray-300 mt-1">
                              {imageLoadError ? 'Image failed to load' : 'This node type cannot be rendered'}
                            </p>
                            <button
                        onClick={() => loadProxyImage(fileId, selectedNode.id, true)}
                        className="mt-3 text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1 mx-auto">

                              <RefreshCw className="w-3 h-3" /> Retry
                            </button>
                          </div> :
                    imageFetching ?
                    <div data-testid="preview-loading" className="p-8 text-center">
                            <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Fetching image...</p>
                          </div> :
                    nodeImage ?
                    <>
                            {imageDecoding &&
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
                                <div className="text-center">
                                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto mb-2" />
                                  <p className="text-xs text-gray-400">Rendering...</p>
                                </div>
                              </div>
                      }
                            <img
                        data-testid="preview-image"
                        src={nodeImage}
                        alt={selectedNode.name}
                        className="max-w-full"
                        onLoad={() => setImageDecoding(false)}
                        onError={() => {setImageDecoding(false);setImageLoadError(true);}} />

                          </> :

                    <div data-testid="preview-loading" className="p-8 text-center">
                            <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Loading preview...</p>
                          </div>
                    }
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-500" />
                          <code className="text-xs font-mono text-gray-600">{selectedNode.id}</code>
                        </div>
                        <button
                      onClick={() => copyToClipboard(selectedNode.id, 'id')}
                      className="p-1 hover:bg-gray-200 rounded">

                          {copied === 'id' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </> :

          <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Component className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a component to preview</p>
                </div>
              </div>
          }
          </main>

          {/* Right Panel - Details */}
          <aside className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {selectedNode ?
          <>
                {/* Tab bar — underline style */}
                <div className="border-b border-gray-200">
                  <div className="flex items-center -mb-px">
                    <button
                  onClick={() => setActiveTab('properties')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'properties' ?
                  'border-purple-600 text-purple-700' :
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }>

                      <Palette className="w-3 h-3" />
                      Properties
                    </button>
                    <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'comments' ?
                  'border-purple-600 text-purple-700' :
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }>

                      <Send className="w-3 h-3" />
                      Comments
                      {comments.length > 0 &&
                  <span className="ml-1 min-w-[1.125rem] h-[1.125rem] px-1 bg-gray-200 text-gray-600 text-[10px] rounded-full inline-flex items-center justify-center font-semibold">
                          {comments.length}
                        </span>
                  }
                    </button>
                    {/* Download button inline in tab bar */}
                    {nodeImage && !imageIsPlaceholder && !imageLoadError &&
                <button
                  onClick={handleDownloadImage}
                  className="ml-auto mr-2 flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="Download as PNG">

                        <Download className="w-3 h-3" />
                        PNG
                      </button>
                }
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'properties' && nodeDetails &&
              <div className="p-3 space-y-4">
                      {/* Quick nav links */}
                      <NavPills links={NAV_PILL_LINKS} onNavigate={navigateToTab} />
                      <section>
                        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1" data-test-id="h3-0400a928">
                          CSS Properties
                        </h3>
                        <div className="space-y-0" data-test-id="div-e5d2e0d7">
                          {Object.entries(nodeDetails.properties || {}).map(([key, prop]: [string, any]) =>
                    <div key={key} className="flex items-center justify-between py-1.5 px-2 border-b border-gray-50 hover:bg-gray-50 rounded-sm transition-colors">
                              <span className="text-[11px] text-gray-500">{key}</span>
                              <code className="text-[11px] font-mono text-gray-800 max-w-[55%] truncate text-right" title={formatDisplayValue(prop.value)}>{formatDisplayValue(prop.value)}</code>
                            </div>
                    )}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1" data-test-id="h3-17e23198">
                          Design Tokens
                        </h3>
                        <div className="space-y-1" data-test-id="div-36a4ec51">
                          {variables.map((variable: any) =>
                    <div key={variable.name} className="flex items-center justify-between py-1 px-2 bg-gray-50/80 rounded hover:bg-gray-100 transition-colors group">
                              <code className="text-[10px] font-mono text-gray-600 truncate max-w-[50%]" title={variable.name}>{variable.name}</code>
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-gray-800 truncate max-w-[7rem]" title={formatDisplayValue(variable.value)}>{formatDisplayValue(variable.value)}</span>
                                <button
                          onClick={() => copyToClipboard(formatDisplayValue(variable.value), variable.name)}
                          className="p-0.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">

                                  {copied === variable.name ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Copy className="w-2.5 h-2.5 text-gray-400" />}
                                </button>
                              </div>
                            </div>
                    )}
                        </div>
                      </section>
                    </div>
              }

                  {activeTab === 'comments' &&
              <div className="flex flex-col h-full">
                      <div className="flex-1 p-3 space-y-3">
                        {comments.map((comment: any) =>
                  <div key={comment.id} className={comment.resolved ? 'opacity-50' : ''}>
                            <div className="flex gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-600 flex-shrink-0">
                                {comment.userName.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[11px] font-semibold text-gray-800">{comment.userName}</span>
                                  <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                                </div>
                                <p className="text-[11px] text-gray-600 leading-relaxed">{comment.text}</p>
                              </div>
                            </div>
                          </div>
                  )}
                      </div>

                      <div className="p-3 border-t border-gray-200">
                        <div className="flex gap-1.5">
                          <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder="Add a comment..."
                      className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-md text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500" />

                          <button
                      onClick={handleAddComment}
                      className="px-2.5 py-1.5 bg-purple-600 text-white text-[11px] font-medium rounded-md hover:bg-purple-700 transition-colors">

                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
              }
                </div>
              </> :

          <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-500">Select a component to view details</p>
                </div>
              </div>
          }
          </aside>
        </div> :
      null}

      {!fileData &&
      <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Figma Component Inspector</h2>
            <p className="text-gray-500 mb-6">Enter a Figma File ID to start inspecting components</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg">
              <Info className="w-4 h-4" />
              <span className="text-sm">Get File ID from Figma URL: figma.com/file/[FILE_ID]/...</span>
            </div>
          </div>
        </div>
      }

      {/* Node Modal — unified: display name, pin, and actions */}
      {showNodeModal && nodeModalTarget &&
      <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNodeModal(false)} />
          <form
          className="relative bg-white rounded-xl shadow-2xl w-[70vw] max-h-[90vh] flex flex-col"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSaveNodeLabel();
            if (editingPin) {
              await handleSavePin();
            }
            setShowNodeModal(false);
          }}>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0" data-test-id="div-d40206b0">
              <div className="flex items-center gap-2">
                <Component className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">Node Settings</h3>
              </div>
              <button onClick={() => setShowNodeModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5" data-test-id="div-3d2b3c12">
              {/* Node info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-800">{nodeModalTarget.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-gray-200 text-gray-500">{nodeModalTarget.type}</span>
                  <div className="w-px h-3 bg-gray-300" />
                  <code className="text-[10px] font-mono text-gray-400">{nodeModalTarget.id}</code>
                  <button
                  onClick={() => copyToClipboard(nodeModalTarget.id, 'modal-id')}
                  className="p-0.5 hover:bg-gray-200 rounded"
                  title="Copy node ID">

                    {copied === 'modal-id' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Quick links to tab sub-sections */}
              <NavPills links={NAV_PILL_LINKS} onNavigate={navigateToTab} />

              {/* Display Name */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Display Name
                  </label>
                  {nodeLabels.has(nodeModalTarget.id) &&
                <button
                  onClick={async () => {
                    setNodeModalDisplayName('');
                    try {
                      await api.upsertNodeLabel({ fileId, nodeId: nodeModalTarget.id, displayName: '' });
                      await loadNodeLabels(fileId);
                    } catch {/* ignore */}
                  }}
                  className="p-0.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove display name">

                      <X className="w-3 h-3" />
                    </button>
                }
                </div>
                <p className="text-[10px] text-gray-400 mb-1.5">
                  Overrides the Figma layer name in the tree view. Original name shown in tooltip.
                </p>
                <input
                type="text"
                value={nodeModalDisplayName}
                onChange={(e) => setNodeModalDisplayName(e.target.value)}
                placeholder={nodeModalTarget.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />

              </div>

              {/* Pin toggle + fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Pin
                  </label>
                  <button
                  onClick={async () => {
                    if (editingPin) {
                      await handleUnpin(editingPin.id);
                      setEditingPin(null);
                      setPinForm({ tags: '', description: '' });
                    } else {
                      await handleSavePin();
                      const refreshed = pins.find((p) => p.nodeId === nodeModalTarget.id) ??
                      (await api.getPins(fileId, nodeModalTarget.id))[0];
                      if (refreshed) {
                        setEditingPin(refreshed);
                      }
                    }
                  }}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                  editingPin ? 'bg-purple-600' : 'bg-gray-300'}`
                  }
                  title={editingPin ? 'Unpin this node' : 'Pin this node'}>

                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  editingPin ? 'translate-x-4' : 'translate-x-0'}`
                  } />
                  </button>
                </div>

                {editingPin &&
              <div className="space-y-3">
                    {/* Tags */}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Tags</label>
                      <input
                    type="text"
                    value={pinForm.tags}
                    onChange={(e) => setPinForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="button, cta, primary (comma-separated)"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />

                      {pinForm.tags &&
                  <div className="flex flex-wrap gap-1 mt-1.5">
                          {pinForm.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) =>
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                              {tag}
                            </span>
                    )}
                        </div>
                  }
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Description</label>
                      <textarea
                    value={pinForm.description}
                    onChange={(e) => setPinForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Why is this node important?"
                    rows={2}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none" />

                    </div>
                  </div>
              }
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2 flex-shrink-0" data-test-id="div-c80244cc">
              <button
              type="button"
              onClick={() => setShowNodeModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">

                Cancel
              </button>
              <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-1.5">

                <Check className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </form>
        </div>
      }
    </div>);

};

export default FigmaComponentInspector;