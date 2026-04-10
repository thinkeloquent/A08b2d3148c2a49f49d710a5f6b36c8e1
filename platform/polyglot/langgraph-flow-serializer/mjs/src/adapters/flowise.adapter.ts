/**
 * Flowise dialect adapter.
 *
 * Flowise uses `data.name` (camelCase LangChain.js class name) and a flat
 * `data.inputs` object. There is no `data.node.template` structure.
 *
 * Detection heuristic: nodes have `data.name` as a camelCase string
 * and do NOT have `data.node.template`.
 */

import type { AIWorkflow, AINode, AIEdge } from "../types.js";
import type { DialectAdapter } from "./adapter.js";

interface FlowiseNodeData {
  name?: string;
  label?: string;
  category?: string;
  inputs?: Record<string, unknown>;
  credentials?: Record<string, string>;
  [key: string]: unknown;
}

interface FlowiseNode {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data?: FlowiseNodeData;
  [key: string]: unknown;
}

interface FlowiseEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
  type?: string;
  [key: string]: unknown;
}

interface FlowiseFlow {
  id?: string;
  name?: string;
  description?: string;
  viewport?: { x: number; y: number; zoom: number };
  nodes?: FlowiseNode[];
  edges?: FlowiseEdge[];
  [key: string]: unknown;
}

function isCamelCase(str: string): boolean {
  // camelCase: starts with lowercase, contains no spaces
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

export const flowiseAdapter: DialectAdapter = {
  detect(json: unknown): boolean {
    if (typeof json !== "object" || json === null) return false;
    const flow = json as FlowiseFlow;
    const nodes = flow.nodes;
    if (!Array.isArray(nodes) || nodes.length === 0) return false;

    // Check first node — Flowise uses data.name (camelCase) without data.node.template
    const firstNode = nodes[0];
    if (typeof firstNode?.data !== "object" || firstNode.data === null) return false;
    const data = firstNode.data as FlowiseNodeData;
    if ("node" in data && typeof (data as Record<string, unknown>).node === "object") {
      return false; // Langflow signature
    }
    return typeof data.name === "string" && isCamelCase(data.name);
  },

  fromDialect(dialectJson: unknown): AIWorkflow {
    const flow = dialectJson as FlowiseFlow;
    const nodes: AINode[] = (flow.nodes ?? []).map((fn): AINode => {
      const data = fn.data ?? {};
      return {
        id: fn.id,
        type: fn.type ?? "customNode",
        position: fn.position ?? { x: 0, y: 0 },
        data: {
          nodeType: data.name ?? "",
          category: data.category ?? "Uncategorized",
          name: data.label ?? data.name,
          inputs: data.inputs ?? {},
          ...(data.credentials ? { credentials: data.credentials } : {}),
        },
      };
    });

    const edges: AIEdge[] = (flow.edges ?? []).map((fe): AIEdge => ({
      id: fe.id,
      source: fe.source,
      sourceHandle: fe.sourceHandle ?? `${fe.source}-output`,
      target: fe.target,
      targetHandle: fe.targetHandle ?? `${fe.target}-input`,
      ...(fe.type ? { type: fe.type } : {}),
    }));

    return {
      ...(flow.id ? { id: flow.id } : {}),
      name: flow.name ?? "Untitled Flowise Flow",
      ...(flow.description ? { description: flow.description } : {}),
      ...(flow.viewport ? { viewport: flow.viewport } : {}),
      nodes,
      edges,
    };
  },

  toDialect(workflow: AIWorkflow): FlowiseFlow {
    const nodes: FlowiseNode[] = workflow.nodes.map((n): FlowiseNode => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        name: n.data.nodeType,
        label: n.data.name ?? n.data.nodeType,
        category: n.data.category,
        inputs: n.data.inputs,
        ...(n.data.credentials ? { credentials: n.data.credentials } : {}),
      },
    }));

    const edges: FlowiseEdge[] = workflow.edges.map((e): FlowiseEdge => ({
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
