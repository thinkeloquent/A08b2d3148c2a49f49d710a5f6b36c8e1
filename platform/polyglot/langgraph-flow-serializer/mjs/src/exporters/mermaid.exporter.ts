/**
 * Mermaid flowchart exporter.
 *
 * Generates Mermaid `flowchart TD` syntax from an AIWorkflow.
 * Category-based node shapes:
 *   agents       → hexagon     {{label}}
 *   routing      → diamond     {label}
 *   conditions   → diamond     {label}
 *   prompts      → trapezoid   [/label\]
 *   models       → stadium     ([label])
 *   memory       → subroutine  [[label]]
 *   tools        → asymmetric  >label]
 *   (default)    → rectangle   [label]
 *
 * Nodes are grouped into Mermaid subgraphs by category.
 * Edges are rendered as labeled arrows.
 */

import type { AIWorkflow, AINode, AIEdge } from "../types.js";

type ShapeRenderer = (id: string, label: string) => string;

const SHAPE_MAP: Record<string, ShapeRenderer> = {
  agent: (id, label) => `${id}{{${escapeMermaid(label)}}}`,
  agents: (id, label) => `${id}{{${escapeMermaid(label)}}}`,
  routing: (id, label) => `${id}{${escapeMermaid(label)}}`,
  conditions: (id, label) => `${id}{${escapeMermaid(label)}}`,
  condition: (id, label) => `${id}{${escapeMermaid(label)}}`,
  prompt: (id, label) => `${id}[/${escapeMermaid(label)}\\]`,
  prompts: (id, label) => `${id}[/${escapeMermaid(label)}\\]`,
  model: (id, label) => `${id}([${escapeMermaid(label)}])`,
  models: (id, label) => `${id}([${escapeMermaid(label)}])`,
  "chat models": (id, label) => `${id}([${escapeMermaid(label)}])`,
  memory: (id, label) => `${id}[[${escapeMermaid(label)}]]`,
  tool: (id, label) => `${id}>${escapeMermaid(label)}]`,
  tools: (id, label) => `${id}>${escapeMermaid(label)}]`,
  control: (id, label) => `${id}((${escapeMermaid(label)}))`,
};

function escapeMermaid(text: string): string {
  // Escape quotes and pipe characters that have special meaning in Mermaid
  return text.replace(/"/g, "&quot;").replace(/\|/g, "&#124;");
}

function safeMermaidId(id: string): string {
  // Mermaid node IDs must be alphanumeric + underscores
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

function renderNode(node: AINode): string {
  const safeId = safeMermaidId(node.id);
  const label = node.data.name ?? node.data.nodeType ?? node.id;
  const categoryKey = node.data.category.toLowerCase();
  const renderer = SHAPE_MAP[categoryKey];
  return renderer ? renderer(safeId, label) : `${safeId}[${escapeMermaid(label)}]`;
}

function renderEdge(edge: AIEdge, idMap: Map<string, string>): string {
  const src = idMap.get(edge.source) ?? safeMermaidId(edge.source);
  const tgt = idMap.get(edge.target) ?? safeMermaidId(edge.target);
  // Include handle label if it carries meaning beyond the default pattern
  const handleLabel =
    edge.sourceHandle && !edge.sourceHandle.endsWith("-output")
      ? edge.sourceHandle
      : null;
  return handleLabel ? `${src} -->|${escapeMermaid(handleLabel)}| ${tgt}` : `${src} --> ${tgt}`;
}

/**
 * Convert an AIWorkflow to a Mermaid flowchart string.
 *
 * @param workflow - The workflow to convert.
 * @returns A Mermaid `flowchart TD` diagram as a string.
 */
export function toMermaid(workflow: AIWorkflow): string {
  const lines: string[] = ["flowchart TD"];

  // Build ID map (original → safe Mermaid ID) for edge rendering
  const idMap = new Map<string, string>();
  for (const node of workflow.nodes) {
    idMap.set(node.id, safeMermaidId(node.id));
  }

  // Group nodes by category for subgraph generation
  const byCategory = new Map<string, AINode[]>();
  for (const node of workflow.nodes) {
    const cat = node.data.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(node);
  }

  // Render subgraphs
  for (const [category, nodes] of byCategory.entries()) {
    const subgraphId = safeMermaidId(category);
    lines.push(`  subgraph ${subgraphId}["${escapeMermaid(category)}"]`);
    for (const node of nodes) {
      lines.push(`    ${renderNode(node)}`);
    }
    lines.push("  end");
  }

  // Render edges
  for (const edge of workflow.edges as AIEdge[]) {
    lines.push(`  ${renderEdge(edge, idMap)}`);
  }

  return lines.join("\n");
}
