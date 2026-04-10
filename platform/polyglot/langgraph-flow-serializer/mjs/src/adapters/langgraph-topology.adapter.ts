/**
 * LangGraph Topology adapter (import-only).
 *
 * Converts the JSON output of a compiled LangGraph `get_graph().to_json()` call
 * into the universal AIWorkflow schema. Export is not supported because the
 * topology format carries only structural/DAG information, not LangChain
 * component configuration.
 *
 * Detection heuristic: JSON has `nodes` as an array of objects with `id` strings
 * AND `edges` as arrays of objects with `source`/`target` string keys,
 * AND no `data.nodeType` present on nodes (which would indicate it is already
 * in the universal format).
 *
 * Auto-layout: nodes are placed in a simple top-down layered layout based on
 * topological sort order. Each layer is spaced 150px vertically; nodes within
 * a layer are spread 200px horizontally.
 */

import type { AIWorkflow, AINode, AIEdge } from "../types.js";
import type { DialectAdapter } from "./adapter.js";

interface TopologyNode {
  id: string;
  type?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface TopologyEdge {
  source: string;
  target: string;
  conditional?: boolean;
  data?: Record<string, unknown>;
}

interface TopologyGraph {
  nodes?: TopologyNode[];
  edges?: TopologyEdge[];
  [key: string]: unknown;
}

const LAYER_HEIGHT = 150;
const NODE_WIDTH = 200;
const START_NODE_ID = "__start__";
const END_NODE_ID = "__end__";

/**
 * Simple topological sort returning nodes in dependency order.
 * Returns layers (each layer is a list of node IDs that can execute in parallel).
 */
function computeLayers(
  nodeIds: string[],
  edges: TopologyEdge[]
): string[][] {
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    dependents.set(id, []);
  }

  for (const edge of edges) {
    if (!inDegree.has(edge.target)) inDegree.set(edge.target, 0);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    if (!dependents.has(edge.source)) dependents.set(edge.source, []);
    dependents.get(edge.source)!.push(edge.target);
  }

  const layers: string[][] = [];
  let current = nodeIds.filter((id) => (inDegree.get(id) ?? 0) === 0);

  while (current.length > 0) {
    layers.push(current);
    const next: string[] = [];
    for (const id of current) {
      for (const dep of dependents.get(id) ?? []) {
        const newDegree = (inDegree.get(dep) ?? 1) - 1;
        inDegree.set(dep, newDegree);
        if (newDegree === 0) next.push(dep);
      }
    }
    current = next;
  }

  return layers;
}

export const langgraphTopologyAdapter: DialectAdapter = {
  detect(json: unknown): boolean {
    if (typeof json !== "object" || json === null) return false;
    const graph = json as TopologyGraph;
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return false;

    // Check for __start__ or __end__ markers characteristic of compiled LangGraph
    const hasStartEnd = graph.nodes.some(
      (n) =>
        typeof n === "object" &&
        n !== null &&
        (n.id === START_NODE_ID || n.id === END_NODE_ID)
    );

    // Make sure nodes do NOT already have data.nodeType (universal format)
    const isAlreadyUniversal = graph.nodes.some(
      (n) =>
        typeof n === "object" &&
        n !== null &&
        typeof n.data === "object" &&
        n.data !== null &&
        "nodeType" in n.data
    );

    return hasStartEnd && !isAlreadyUniversal;
  },

  fromDialect(dialectJson: unknown): AIWorkflow {
    const graph = dialectJson as TopologyGraph;
    const topoNodes = graph.nodes ?? [];
    const topoEdges = graph.edges ?? [];

    const nodeIds = topoNodes.map((n) => n.id);
    const layers = computeLayers(nodeIds, topoEdges);

    // Build position map
    const positionMap = new Map<string, { x: number; y: number }>();
    layers.forEach((layer, layerIndex) => {
      const totalWidth = (layer.length - 1) * NODE_WIDTH;
      layer.forEach((id, colIndex) => {
        positionMap.set(id, {
          x: colIndex * NODE_WIDTH - totalWidth / 2,
          y: layerIndex * LAYER_HEIGHT,
        });
      });
    });

    const nodes: AINode[] = topoNodes.map((tn): AINode => {
      const isStart = tn.id === START_NODE_ID;
      const isEnd = tn.id === END_NODE_ID;
      const category = isStart ? "Control" : isEnd ? "Control" : "Agent";
      const displayName = isStart ? "START" : isEnd ? "END" : tn.id;

      return {
        id: tn.id,
        type: isStart || isEnd ? "controlNode" : "agentNode",
        position: positionMap.get(tn.id) ?? { x: 0, y: 0 },
        data: {
          nodeType: isStart ? "START" : isEnd ? "END" : tn.type ?? tn.id,
          category,
          name: displayName,
          inputs: tn.data ?? {},
        },
      };
    });

    let edgeCounter = 0;
    const edges: AIEdge[] = topoEdges.map((te): AIEdge => {
      edgeCounter++;
      return {
        id: `edge-${edgeCounter}`,
        source: te.source,
        sourceHandle: `${te.source}-output`,
        target: te.target,
        targetHandle: `${te.target}-input`,
        type: te.conditional ? "smoothstep" : "default",
      };
    });

    return {
      name: "LangGraph Workflow",
      nodes,
      edges,
    };
  },

  toDialect(_workflow: AIWorkflow): never {
    throw new Error(
      "LangGraph topology adapter does not support export. " +
        "The topology format is import-only (derived from compiled graph structure)."
    );
  },
};
