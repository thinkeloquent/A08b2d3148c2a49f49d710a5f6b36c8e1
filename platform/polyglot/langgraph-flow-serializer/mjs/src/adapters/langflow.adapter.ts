/**
 * Langflow dialect adapter.
 *
 * Langflow uses `data.node.template` with per-field objects of shape
 * `{ type, value, show, ... }`. The LangChain class name lives in `data.type`.
 *
 * Detection heuristic: nodes have `data.node.template` present as an object.
 */

import type { AIWorkflow, AINode, AIEdge } from "../types.js";
import type { DialectAdapter } from "./adapter.js";

interface LangflowTemplateField {
  type?: string;
  value?: unknown;
  show?: boolean;
  [key: string]: unknown;
}

interface LangflowNodeInner {
  template?: Record<string, LangflowTemplateField>;
  display_name?: string;
  description?: string;
  [key: string]: unknown;
}

interface LangflowNodeData {
  type?: string;
  node?: LangflowNodeInner;
  category?: string;
  [key: string]: unknown;
}

interface LangflowNode {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data?: LangflowNodeData;
  [key: string]: unknown;
}

interface LangflowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
  type?: string;
  [key: string]: unknown;
}

interface LangflowFlow {
  id?: string;
  name?: string;
  description?: string;
  viewport?: { x: number; y: number; zoom: number };
  nodes?: LangflowNode[];
  edges?: LangflowEdge[];
  [key: string]: unknown;
}

export const langflowAdapter: DialectAdapter = {
  detect(json: unknown): boolean {
    if (typeof json !== "object" || json === null) return false;
    const flow = json as LangflowFlow;
    const nodes = flow.nodes;
    if (!Array.isArray(nodes) || nodes.length === 0) return false;

    const firstNode = nodes[0];
    if (typeof firstNode?.data !== "object" || firstNode.data === null) return false;
    const data = firstNode.data as LangflowNodeData;
    return (
      typeof data.node === "object" &&
      data.node !== null &&
      typeof (data.node as LangflowNodeInner).template === "object"
    );
  },

  fromDialect(dialectJson: unknown): AIWorkflow {
    const flow = dialectJson as LangflowFlow;

    const nodes: AINode[] = (flow.nodes ?? []).map((ln): AINode => {
      const data = ln.data ?? {};
      const inner = data.node ?? {};
      const template = inner.template ?? {};

      // Flatten template: extract value from each field
      const inputs: Record<string, unknown> = {};
      for (const [key, field] of Object.entries(template)) {
        inputs[key] = field.value ?? null;
      }

      return {
        id: ln.id,
        type: ln.type ?? "customNode",
        position: ln.position ?? { x: 0, y: 0 },
        data: {
          nodeType: data.type ?? "",
          category: data.category ?? "Uncategorized",
          name: inner.display_name ?? data.type,
          inputs,
        },
      };
    });

    const edges: AIEdge[] = (flow.edges ?? []).map((le): AIEdge => ({
      id: le.id,
      source: le.source,
      sourceHandle: le.sourceHandle ?? `${le.source}-output`,
      target: le.target,
      targetHandle: le.targetHandle ?? `${le.target}-input`,
      ...(le.type ? { type: le.type } : {}),
    }));

    return {
      ...(flow.id ? { id: flow.id } : {}),
      name: flow.name ?? "Untitled Langflow",
      ...(flow.description ? { description: flow.description } : {}),
      ...(flow.viewport ? { viewport: flow.viewport } : {}),
      nodes,
      edges,
    };
  },

  toDialect(workflow: AIWorkflow): LangflowFlow {
    const nodes: LangflowNode[] = workflow.nodes.map((n): LangflowNode => {
      // Reconstruct the template structure with minimal metadata
      const template: Record<string, LangflowTemplateField> = {};
      for (const [key, value] of Object.entries(n.data.inputs)) {
        template[key] = {
          type: typeof value === "number" ? "float" : "str",
          value,
          show: true,
        };
      }

      return {
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          type: n.data.nodeType,
          category: n.data.category,
          node: {
            display_name: n.data.name ?? n.data.nodeType,
            template,
          },
        },
      };
    });

    const edges: LangflowEdge[] = workflow.edges.map((e): LangflowEdge => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle,
      target: e.target,
      targetHandle: e.targetHandle,
      ...(e.type ? { type: e.type } : {}),
    }));

    return {
      ...(workflow.id ? { id: workflow.id } : {}),
      name: workflow.name,
      ...(workflow.description ? { description: workflow.description } : {}),
      ...(workflow.viewport ? { viewport: workflow.viewport } : {}),
      nodes,
      edges,
    };
  },
};
