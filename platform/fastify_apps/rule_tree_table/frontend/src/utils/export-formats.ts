/**
 * Export format converters for rule trees.
 *
 * In logic-only mode every format serialises from the same canonical
 * LogicGroup / LogicCondition tree built by `toLogicTree()`, so the
 * data structure is identical across formats.  Diagram formats share a
 * single sequential-ID counter (`_seq`) so node references (g1, c2 …)
 * are consistent across Mermaid, Structurizr DSL and draw.io.
 *
 * All string helpers coerce null/undefined to "" defensively because
 * runtime API data may diverge from the TypeScript types.
 */

import type { RuleGroup, RuleItem, RuleCondition } from '../types/rule.types';

// ── Options ────────────────────────────────────────────────────────────

export interface ExportOptions {
  /** Strip id, name, type, dataType — keep only logic structure. */
  logicOnly?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// Shared helpers
// ═══════════════════════════════════════════════════════════════════════

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

function escapeXml(s: unknown): string {
  return str(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function safeConditions(g: RuleGroup): RuleItem[] {
  return Array.isArray(g.conditions) ? g.conditions : [];
}

function conditionLabel(c: RuleCondition): string {
  return `${str(c.field)} ${str(c.operator)} ${str(c.value)}`;
}

function yamlStr(s: unknown): string {
  const v = str(s);
  if (
    v === '' ||
    /[:#\[\]{}&*!|>'"%@`,]/.test(v) ||
    v.trim() !== v ||
    /^(true|false|yes|no|on|off|null|~)$/i.test(v) ||
    !isNaN(Number(v))
  ) {
    return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;
  }
  return v;
}

function dslSafe(s: unknown): string {
  return str(s).replace(/["\\]/g, (c) => (c === '"' ? "'" : '\\\\'));
}

// ═══════════════════════════════════════════════════════════════════════
// Logic-only canonical tree  (shared by ALL formats when logicOnly=true)
// ═══════════════════════════════════════════════════════════════════════

interface LogicCondition {
  field: string;
  operator: string;
  valueType: string;
  value: string;
}

interface LogicGroup {
  logic: string;
  conditions: LogicNode[];
}

type LogicNode = LogicCondition | LogicGroup;

function isLogicGroup(n: LogicNode): n is LogicGroup {
  return 'logic' in n;
}

function logicLabel(n: LogicNode): string {
  if (isLogicGroup(n)) return n.logic;
  return `${n.field} ${n.operator} ${n.value}`;
}

function toLogicTree(item: RuleItem): LogicNode {
  if (item.type === 'condition') {
    const c = item as RuleCondition;
    return {
      field: str(c.field),
      operator: str(c.operator),
      valueType: str(c.valueType),
      value: str(c.value),
    };
  }
  // Groups, folders, and structural nodes are all containers
  const g = item as RuleGroup;
  return {
    logic: str(g.logic || (item.type === 'structural' ? 'SCOPE' : '')),
    conditions: safeConditions(g).map(toLogicTree),
  };
}

/** Shared sequential ID counter for diagram formats in logic-only mode. */
let _seq = 0;
function nextGId(): string { return `g${++_seq}`; }
function nextCId(): string { return `c${++_seq}`; }
function resetSeq(): void { _seq = 0; }

// ═══════════════════════════════════════════════════════════════════════
// Logic-only serialisers  (one per format, all consuming LogicNode)
// ═══════════════════════════════════════════════════════════════════════

// ── JSON (logic-only) ──────────────────────────────────────────────────

function logicToJSON(root: LogicNode): string {
  return JSON.stringify(root, null, 2);
}

// ── XML (logic-only) ──────────────────────────────────────────────────

function logicNodeToXml(node: LogicNode, indent: string): string {
  if (!isLogicGroup(node)) {
    const attrs = [
      `field="${escapeXml(node.field)}"`,
      `operator="${escapeXml(node.operator)}"`,
      `valueType="${escapeXml(node.valueType)}"`,
      `value="${escapeXml(node.value)}"`,
    ].join(' ');
    return `${indent}<condition ${attrs} />`;
  }
  const inner = node.conditions
    .map((c) => logicNodeToXml(c, indent + '  '))
    .join('\n');
  if (node.conditions.length === 0) {
    return `${indent}<group logic="${escapeXml(node.logic)}" />`;
  }
  return `${indent}<group logic="${escapeXml(node.logic)}">\n${inner}\n${indent}</group>`;
}

function logicToXML(root: LogicNode): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${logicNodeToXml(root, '')}`;
}

// ── YAML (logic-only) ─────────────────────────────────────────────────

function logicNodeToYaml(node: LogicNode, indent: string): string {
  const lines: string[] = [];
  if (!isLogicGroup(node)) {
    lines.push(`${indent}field: ${yamlStr(node.field)}`);
    lines.push(`${indent}operator: ${yamlStr(node.operator)}`);
    lines.push(`${indent}valueType: ${yamlStr(node.valueType)}`);
    lines.push(`${indent}value: ${yamlStr(node.value)}`);
  } else {
    lines.push(`${indent}logic: ${yamlStr(node.logic)}`);
    if (node.conditions.length === 0) {
      lines.push(`${indent}conditions: []`);
    } else {
      lines.push(`${indent}conditions:`);
      for (const child of node.conditions) {
        lines.push(`${indent}  - ${logicNodeToYaml(child, indent + '    ').trimStart()}`);
      }
    }
  }
  return lines.join('\n');
}

function logicToYAML(root: LogicNode): string {
  return logicNodeToYaml(root, '');
}

// ── Mermaid (logic-only) ──────────────────────────────────────────────

function logicNodeToMermaid(node: LogicNode, lines: string[]): string {
  if (isLogicGroup(node)) {
    const mid = nextGId();
    lines.push(`  ${mid}["${node.logic}"]`);
    for (const child of node.conditions) {
      const childId = logicNodeToMermaid(child, lines);
      lines.push(`  ${mid} --> ${childId}`);
    }
    return mid;
  }
  const mid = nextCId();
  lines.push(`  ${mid}(["${logicLabel(node)}"])`);
  return mid;
}

function logicToMermaid(root: LogicNode): string {
  resetSeq();
  const lines = ['```mermaid', 'flowchart TD'];
  logicNodeToMermaid(root, lines);
  lines.push('```', '');
  return lines.join('\n');
}

// ── Structurizr DSL (logic-only) ──────────────────────────────────────

function logicNodeToDsl(node: LogicNode, indent: string, lines: string[]): void {
  if (isLogicGroup(node)) {
    const did = nextGId();
    lines.push(`${indent}container ${did} "${node.logic}" {`);
    for (const child of node.conditions) {
      logicNodeToDsl(child, indent + '  ', lines);
    }
    lines.push(`${indent}}`);
  } else {
    const cid = nextCId();
    lines.push(`${indent}component ${cid} "${dslSafe(logicLabel(node))}"`);
  }
}

function logicToStructurizrDSL(root: LogicNode): string {
  resetSeq();
  const rootLogic = isLogicGroup(root) ? root.logic : 'RULE';
  const lines: string[] = [
    'workspace {',
    '  model {',
    `    ruleTree = softwareSystem "${rootLogic}" "Rule tree" {`,
  ];
  if (isLogicGroup(root)) {
    for (const child of root.conditions) {
      logicNodeToDsl(child, '      ', lines);
    }
  }
  lines.push('    }', '  }', '', '  views {', '    container ruleTree {', '      include *', '      autoLayout lr', '    }', '  }', '}', '');
  return lines.join('\n');
}

// ── draw.io (logic-only) ──────────────────────────────────────────────

interface DxCell { id: string; value: string; style: string; parent: string; x: number; y: number; width: number; height: number; }
interface DxEdge { id: string; source: string; target: string; parent: string; }

function logicNodeToDrawio(
  node: LogicNode,
  parentCellId: string,
  x: number, y: number,
  cells: DxCell[], edges: DxEdge[],
): { width: number; height: number } {
  if (!isLogicGroup(node)) {
    const id = nextCId();
    cells.push({ id, value: escapeXml(logicLabel(node)), style: 'rounded=1;whiteSpace=wrap;fillColor=#dae8fc;strokeColor=#6c8ebf;', parent: parentCellId, x, y, width: 220, height: 40 });
    edges.push({ id: `e${_seq}`, source: parentCellId, target: id, parent: '1' });
    return { width: 220, height: 40 };
  }

  const gId = nextGId();
  cells.push({ id: gId, value: escapeXml(node.logic), style: 'shape=rectangle;whiteSpace=wrap;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;', parent: parentCellId === '1' ? '1' : parentCellId, x, y, width: 200, height: 40 });
  if (parentCellId !== '1') {
    edges.push({ id: `e${_seq}`, source: parentCellId, target: gId, parent: '1' });
  }

  let childY = y + 80;
  for (const child of node.conditions) {
    const r = logicNodeToDrawio(child, gId, x + 40, childY, cells, edges);
    childY += r.height + 30;
  }
  return { width: 280, height: Math.max(40, childY - y) };
}

function logicToDrawio(root: LogicNode): string {
  resetSeq();
  const cells: DxCell[] = [];
  const edges: DxEdge[] = [];
  logicNodeToDrawio(root, '1', 40, 40, cells, edges);

  const cellsXml = cells
    .map((c) =>
      `        <mxCell id="${c.id}" value="${c.value}" style="${c.style}" vertex="1" parent="${c.parent}">\n` +
      `          <mxGeometry x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" as="geometry" />\n` +
      `        </mxCell>`)
    .join('\n');
  const edgesXml = edges
    .map((e) =>
      `        <mxCell id="${e.id}" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="${e.source}" target="${e.target}" parent="${e.parent}">\n` +
      `          <mxGeometry relative="1" as="geometry" />\n` +
      `        </mxCell>`)
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<mxfile>',
    '  <diagram name="Rule Tree">',
    '    <mxGraphModel>',
    '      <root>',
    '        <mxCell id="0" />',
    '        <mxCell id="1" parent="0" />',
    cellsXml,
    edgesXml,
    '      </root>',
    '    </mxGraphModel>',
    '  </diagram>',
    '</mxfile>',
    '',
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════
// Full (normal) serialisers  (operate on the original RuleGroup tree)
// ═══════════════════════════════════════════════════════════════════════

// ── XML (full) ─────────────────────────────────────────────────────────

function ruleItemToXml(item: RuleItem, indent: string): string {
  if (item.type === 'condition') {
    const c = item as RuleCondition;
    const attrs = [
      `id="${escapeXml(c.id)}"`,
      `field="${escapeXml(c.field)}"`,
      `operator="${escapeXml(c.operator)}"`,
      `valueType="${escapeXml(c.valueType)}"`,
      `value="${escapeXml(c.value)}"`,
      c.dataType ? `dataType="${escapeXml(c.dataType)}"` : '',
      `enabled="${!!c.enabled}"`,
    ].filter(Boolean).join(' ');
    return `${indent}<condition ${attrs} />`;
  }
  const g = item as RuleGroup;
  const children = safeConditions(g);
  const attrs = [
    `id="${escapeXml(g.id)}"`,
    `name="${escapeXml(g.name)}"`,
    `logic="${escapeXml(g.logic)}"`,
    `enabled="${!!g.enabled}"`,
  ].join(' ');
  if (children.length === 0) return `${indent}<group ${attrs} />`;
  const inner = children.map((c) => ruleItemToXml(c, indent + '  ')).join('\n');
  return `${indent}<group ${attrs}>\n${inner}\n${indent}</group>`;
}

// ── YAML (full) ────────────────────────────────────────────────────────

function ruleItemToYaml(item: RuleItem, indent: string): string {
  const lines: string[] = [];
  if (item.type === 'condition') {
    const c = item as RuleCondition;
    lines.push(`${indent}id: ${yamlStr(c.id)}`);
    lines.push(`${indent}type: condition`);
    lines.push(`${indent}field: ${yamlStr(c.field)}`);
    lines.push(`${indent}operator: ${yamlStr(c.operator)}`);
    lines.push(`${indent}valueType: ${yamlStr(c.valueType)}`);
    lines.push(`${indent}value: ${yamlStr(c.value)}`);
    if (c.dataType) lines.push(`${indent}dataType: ${yamlStr(c.dataType)}`);
    lines.push(`${indent}enabled: ${!!c.enabled}`);
  } else {
    const g = item as RuleGroup;
    const children = safeConditions(g);
    lines.push(`${indent}id: ${yamlStr(g.id)}`);
    lines.push(`${indent}type: group`);
    lines.push(`${indent}name: ${yamlStr(g.name)}`);
    lines.push(`${indent}logic: ${yamlStr(g.logic)}`);
    lines.push(`${indent}enabled: ${!!g.enabled}`);
    if (children.length === 0) {
      lines.push(`${indent}conditions: []`);
    } else {
      lines.push(`${indent}conditions:`);
      for (const child of children) {
        lines.push(`${indent}  - ${ruleItemToYaml(child, indent + '    ').trimStart()}`);
      }
    }
  }
  return lines.join('\n');
}

// ── Mermaid (full) ─────────────────────────────────────────────────────

function mermaidId(id: unknown): string {
  return str(id).replace(/[^a-zA-Z0-9_]/g, '_');
}

function ruleItemToMermaid(item: RuleItem, lines: string[]): string {
  if (item.type === 'group') {
    const g = item as RuleGroup;
    const mid = mermaidId(g.id);
    lines.push(`  ${mid}["${str(g.name)} [${str(g.logic)}]"]`);
    for (const child of safeConditions(g)) {
      const childId = ruleItemToMermaid(child, lines);
      lines.push(`  ${mid} --> ${childId}`);
    }
    return mid;
  }
  const c = item as RuleCondition;
  const mid = mermaidId(c.id);
  lines.push(`  ${mid}(["${conditionLabel(c)}"])`);
  return mid;
}

// ── Structurizr DSL (full) ─────────────────────────────────────────────

function dslId(id: unknown): string {
  return str(id).replace(/[^a-zA-Z0-9_]/g, '_');
}

function groupToDsl(g: RuleGroup, indent: string, lines: string[]): void {
  const did = dslId(g.id);
  const desc = g.description ? dslSafe(g.description) : `Logic: ${str(g.logic)}`;
  lines.push(`${indent}container ${did} "${dslSafe(g.name)}" "" "${desc}" {`);
  for (const child of safeConditions(g)) {
    if (child.type === 'group') {
      groupToDsl(child as RuleGroup, indent + '  ', lines);
    } else {
      const c = child as RuleCondition;
      lines.push(`${indent}  component ${dslId(c.id)} "${dslSafe(conditionLabel(c))}" "" "${c.enabled ? 'enabled' : 'disabled'}"`);
    }
  }
  lines.push(`${indent}}`);
}

// ── draw.io (full) ─────────────────────────────────────────────────────

let _dxCellId = 0;
function nextDxId(): string { return `cell_${++_dxCellId}`; }

function collectDrawioCells(
  item: RuleItem, parentCellId: string,
  x: number, y: number,
  cells: DxCell[], edges: DxEdge[],
): { width: number; height: number } {
  if (item.type === 'condition') {
    const c = item as RuleCondition;
    const id = nextDxId();
    cells.push({ id, value: escapeXml(conditionLabel(c)), style: 'rounded=1;whiteSpace=wrap;fillColor=#dae8fc;strokeColor=#6c8ebf;', parent: parentCellId, x, y, width: 220, height: 40 });
    edges.push({ id: nextDxId(), source: parentCellId, target: id, parent: '1' });
    return { width: 220, height: 40 };
  }
  const g = item as RuleGroup;
  const children = safeConditions(g);
  const gId = nextDxId();
  cells.push({ id: gId, value: escapeXml(`${str(g.name)} [${str(g.logic)}]`), style: 'shape=rectangle;whiteSpace=wrap;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;', parent: parentCellId === '1' ? '1' : parentCellId, x, y, width: 200, height: 40 });
  if (parentCellId !== '1') {
    edges.push({ id: nextDxId(), source: parentCellId, target: gId, parent: '1' });
  }
  let childY = y + 80;
  for (const child of children) {
    const r = collectDrawioCells(child, gId, x + 40, childY, cells, edges);
    childY += r.height + 30;
  }
  return { width: 280, height: Math.max(40, childY - y) };
}

// ═══════════════════════════════════════════════════════════════════════
// Public converter functions  (dispatch to logic-only or full)
// ═══════════════════════════════════════════════════════════════════════

export function toJSON(rules: RuleGroup, opts?: ExportOptions): string {
  if (opts?.logicOnly) return logicToJSON(toLogicTree(rules));
  return JSON.stringify(rules, null, 2);
}

export function toXML(rules: RuleGroup, opts?: ExportOptions): string {
  if (opts?.logicOnly) return logicToXML(toLogicTree(rules));
  return `<?xml version="1.0" encoding="UTF-8"?>\n${ruleItemToXml(rules, '')}`;
}

export function toYAML(rules: RuleGroup, opts?: ExportOptions): string {
  if (opts?.logicOnly) return logicToYAML(toLogicTree(rules));
  return ruleItemToYaml(rules, '');
}

export function toMermaid(rules: RuleGroup, opts?: ExportOptions): string {
  if (opts?.logicOnly) return logicToMermaid(toLogicTree(rules));
  const lines = ['```mermaid', 'flowchart TD'];
  ruleItemToMermaid(rules, lines);
  lines.push('```', '');
  return lines.join('\n');
}

export function toStructurizrDSL(rules: RuleGroup, opts?: ExportOptions): string {
  if (opts?.logicOnly) return logicToStructurizrDSL(toLogicTree(rules));
  const lines: string[] = [
    'workspace {',
    '  model {',
    `    ruleTree = softwareSystem "${dslSafe(rules.name)}" "Rule tree" {`,
  ];
  groupToDsl(rules, '      ', lines);
  lines.push('    }', '  }', '', '  views {', '    container ruleTree {', '      include *', '      autoLayout lr', '    }', '  }', '}', '');
  return lines.join('\n');
}

export function toDrawio(rules: RuleGroup, opts?: ExportOptions): string {
  if (opts?.logicOnly) return logicToDrawio(toLogicTree(rules));
  _dxCellId = 1;
  const cells: DxCell[] = [];
  const edges: DxEdge[] = [];
  collectDrawioCells(rules, '1', 40, 40, cells, edges);
  const cellsXml = cells
    .map((c) =>
      `        <mxCell id="${c.id}" value="${c.value}" style="${c.style}" vertex="1" parent="${c.parent}">\n` +
      `          <mxGeometry x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" as="geometry" />\n` +
      `        </mxCell>`)
    .join('\n');
  const edgesXml = edges
    .map((e) =>
      `        <mxCell id="${e.id}" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="${e.source}" target="${e.target}" parent="${e.parent}">\n` +
      `          <mxGeometry relative="1" as="geometry" />\n` +
      `        </mxCell>`)
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<mxfile>',
    '  <diagram name="Rule Tree">',
    '    <mxGraphModel>',
    '      <root>',
    '        <mxCell id="0" />',
    '        <mxCell id="1" parent="0" />',
    cellsXml,
    edgesXml,
    '      </root>',
    '    </mxGraphModel>',
    '  </diagram>',
    '</mxfile>',
    '',
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════
// Format registry
// ═══════════════════════════════════════════════════════════════════════

export type ExportFormat = 'json' | 'xml' | 'yaml' | 'mermaid' | 'structurizr' | 'drawio';

export interface FormatOption {
  id: ExportFormat;
  label: string;
  description: string;
  extension: string;
  mimeType: string;
  convert: (rules: RuleGroup, opts?: ExportOptions) => string;
}

export const exportFormats: FormatOption[] = [
  { id: 'json',        label: 'JSON',                 description: 'Standard JSON — re-importable',        extension: '.json',   mimeType: 'application/json',   convert: toJSON },
  { id: 'xml',         label: 'XML',                  description: 'XML document',                         extension: '.xml',    mimeType: 'application/xml',    convert: toXML },
  { id: 'yaml',        label: 'YAML',                 description: 'Human-readable YAML',                  extension: '.yaml',   mimeType: 'text/yaml',          convert: toYAML },
  { id: 'mermaid',     label: 'Mermaid (Markdown)',    description: 'Mermaid flowchart in Markdown',        extension: '.md',     mimeType: 'text/markdown',      convert: toMermaid },
  { id: 'structurizr', label: 'Structurizr DSL (C4)',  description: 'C4 model diagram in Structurizr DSL', extension: '.dsl',    mimeType: 'text/plain',         convert: toStructurizrDSL },
  { id: 'drawio',      label: 'draw.io',              description: 'draw.io / diagrams.net diagram',       extension: '.drawio', mimeType: 'application/xml',    convert: toDrawio },
];
