import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Viewport,
} from '@xyflow/react';
import type { AINodeData, FlowListItem } from '@/types/flow.types';
import { TEMPLATE_MAP, CATEGORY_MAP } from '@/config/node-registry';
import { applyAutoLayout, hasNodeOverlap, findOpenPosition } from '@/lib/auto-layout';

function uid(): string {
  return 'n' + Math.random().toString(36).slice(2, 9);
}

export interface FlowMeta {
  id: string | null;
  name: string;
  description: string;
  sourceFormat: string;
  isDirty: boolean;
}

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  flowMeta: FlowMeta;
  selectedNodeId: string | null;
  viewport: Viewport;
}

interface FlowActions {
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (nodeType: string, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<AINodeData>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  setFlowMeta: (meta: Partial<FlowMeta>) => void;
  setSelectedNode: (id: string | null) => void;
  setViewport: (viewport: Viewport) => void;
  autoLayout: () => void;
  loadFlow: (flow: FlowListItem) => void;
  resetFlow: () => void;
}

const DEFAULT_META: FlowMeta = {
  id: null,
  name: 'Untitled Flow',
  description: '',
  sourceFormat: 'native',
  isDirty: false,
};

export const useFlowStore = create<FlowState & FlowActions>((set) => ({
  nodes: [],
  edges: [],
  flowMeta: { ...DEFAULT_META },
  selectedNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      flowMeta: { ...state.flowMeta, isDirty: true },
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      flowMeta: { ...state.flowMeta, isDirty: true },
    })),

  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          id: `e-${connection.source}-${connection.sourceHandle ?? 'out'}-${connection.target}-${connection.targetHandle ?? 'in'}`,
        },
        state.edges,
      ),
      flowMeta: { ...state.flowMeta, isDirty: true },
    })),

  addNode: (nodeType, position) => {
    const template = TEMPLATE_MAP[nodeType];
    const category = CATEGORY_MAP[nodeType];
    if (!template || !category) return;

    const id = uid();
    const state = useFlowStore.getState();
    const openPos = findOpenPosition(state.nodes, position.x, position.y);
    const newNode: Node = {
      id,
      type: 'customNode',
      position: openPos,
      data: {
        nodeType,
        category: category.id,
        name: template.label,
        inputs: { ...template.defaultInputs },
        credentials: {},
      } satisfies AINodeData,
    };
    set((s) => ({
      nodes: [...s.nodes, newNode],
      selectedNodeId: id,
      flowMeta: { ...s.flowMeta, isDirty: true },
    }));
  },

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      flowMeta: { ...state.flowMeta, isDirty: true },
    })),

  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
      flowMeta: { ...state.flowMeta, isDirty: true },
    })),

  updateNodePosition: (id, position) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, position } : n,
      ),
    })),

  setFlowMeta: (meta) =>
    set((state) => ({ flowMeta: { ...state.flowMeta, ...meta } })),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  setViewport: (viewport) => set({ viewport }),

  autoLayout: () =>
    set((state) => ({
      nodes: applyAutoLayout(state.nodes, state.edges),
      flowMeta: { ...state.flowMeta, isDirty: true },
    })),

  loadFlow: (flow) => {
    const fd = flow.flowData;
    if (!fd) {
      set({
        nodes: [],
        edges: [],
        flowMeta: {
          id: flow.id,
          name: flow.name,
          description: flow.description ?? '',
          sourceFormat: flow.sourceFormat,
          isDirty: false,
        },
        selectedNodeId: null,
      });
      return;
    }

    const nodes: Node[] = fd.nodes.map((n) => {
      // The API stores node type in n.type (e.g. "chatOpenAI") while the registry
      // uses PascalCase keys (e.g. "ChatOpenAI"). Resolve via case-insensitive lookup.
      // Also map ReactFlow built-in types: "input" → START, "output" → END.
      const TYPE_ALIASES: Record<string, string> = {
        input: 'START',
        output: 'END',
        systemPrompt: 'SystemMessagePrompt',
      };
      const rawType = (n.data as Record<string, unknown>).nodeType as string | undefined
        ?? n.type
        ?? '';
      const apiType = TYPE_ALIASES[rawType] ?? rawType;
      const resolvedType = TEMPLATE_MAP[apiType]
        ? apiType
        : Object.keys(TEMPLATE_MAP).find((k) => k.toLowerCase() === apiType.toLowerCase())
          ?? apiType;
      const category = CATEGORY_MAP[resolvedType]?.id ?? '';

      return {
        id: n.id,
        type: 'customNode',
        position: n.position,
        data: {
          ...n.data,
          nodeType: resolvedType,
          category: (n.data as Record<string, unknown>).category as string ?? category,
          name: (n.data as Record<string, unknown>).name as string
            ?? (n.data as Record<string, unknown>).label as string
            ?? resolvedType,
          inputs: (n.data as Record<string, unknown>).inputs as Record<string, unknown>
            ?? {},
        } as AINodeData,
      };
    });

    const edges: Edge[] = fd.edges.map((e) => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle,
      target: e.target,
      targetHandle: e.targetHandle,
      type: e.type ?? 'default',
    }));

    // Auto-layout if nodes overlap significantly
    const layoutNodes = hasNodeOverlap(nodes) ? applyAutoLayout(nodes, edges) : nodes;

    set({
      nodes: layoutNodes,
      edges,
      flowMeta: {
        id: flow.id,
        name: flow.name,
        description: flow.description ?? '',
        sourceFormat: flow.sourceFormat,
        isDirty: false,
      },
      selectedNodeId: null,
      viewport: fd.viewport ?? { x: 0, y: 0, zoom: 1 },
    });
  },

  resetFlow: () =>
    set({
      nodes: [],
      edges: [],
      flowMeta: { ...DEFAULT_META },
      selectedNodeId: null,
      viewport: { x: 0, y: 0, zoom: 1 },
    }),
}));
