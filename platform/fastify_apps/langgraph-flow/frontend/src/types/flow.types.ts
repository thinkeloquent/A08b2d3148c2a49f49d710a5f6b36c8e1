// ── Universal AI Workflow Schema ──────────────────────────────────────────────

export interface AIViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface AINodeData extends Record<string, unknown> {
  nodeType: string;
  category: string;
  name?: string;
  inputs: Record<string, unknown>;
  credentials?: Record<string, string>;
}

export interface AINode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: AINodeData;
}

export interface AIEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  type?: string;
}

export interface AIWorkflow {
  id?: string;
  name: string;
  description?: string;
  viewport?: AIViewport;
  nodes: AINode[];
  edges: AIEdge[];
}

// ── API Response Types ────────────────────────────────────────────────────────

export interface FlowListItem {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
  edgeCount: number;
  sourceFormat: string;
  createdAt: string;
  updatedAt: string;
  flowData?: AIWorkflow;
}

export interface FlowVersion {
  id: string;
  flowId: string;
  version: number;
  label?: string;
  flowData: AIWorkflow;
  createdAt: string;
}

// ── Node Registry Types ───────────────────────────────────────────────────────

export interface NodeHandle {
  id: string;
  label: string;
}

export interface NodeTemplate {
  nodeType: string;
  category: string;
  label: string;
  defaultInputs: Record<string, unknown>;
  inHandles: NodeHandle[];
  outHandles: NodeHandle[];
}

export interface NodeCategory {
  id: string;
  label: string;
  color: string;
  icon: string;
  nodeTypes: string[];
}
