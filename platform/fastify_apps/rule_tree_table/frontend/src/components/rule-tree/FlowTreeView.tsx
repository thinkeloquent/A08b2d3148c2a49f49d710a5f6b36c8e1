import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import type { RuleGroup, RuleFolder, RuleStructural, RuleItem, RuleCondition } from '../../types/rule.types';
import { operatorsByType, availableFields } from '../../utils/field-config';

interface FlowTreeViewProps {
  rules: RuleGroup;
}

/* ── helpers ── */

function getOperatorSymbol(dataType: string | undefined, operator: string): string {
  const type = dataType || 'string';
  const ops = operatorsByType[type] ?? operatorsByType.string;
  const found = ops.find((o) => o.value === operator);
  return found ? found.symbol : operator;
}

function getFieldLabel(field: string): string {
  const found = availableFields.find((f) => f.value === field);
  return found ? found.label : field;
}

const LOGIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  AND: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  OR: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  NOT: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  XOR: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const LOGIC_HEADER_COLORS: Record<string, string> = {
  AND: 'bg-blue-500',
  OR: 'bg-emerald-500',
  NOT: 'bg-red-500',
  XOR: 'bg-purple-500',
};

/* ── custom nodes ── */

type GroupNodeData = {
  label: string;
  logic: string;
  childCount: number;
  enabled: boolean;
};

type FolderNodeData = {
  label: string;
  childCount: number;
  enabled: boolean;
};

type ConditionNodeData = {
  field: string;
  operatorSymbol: string;
  value: string;
  enabled: boolean;
  operator: string;
};

function GroupNode({ data }: NodeProps<Node<GroupNodeData>>) {
  const colors = (data.logic && LOGIC_COLORS[data.logic]) || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
  const headerColor = (data.logic && LOGIC_HEADER_COLORS[data.logic]) || 'bg-slate-400';

  return (
    <div className={`rounded-xl border shadow-card overflow-hidden ${colors.border} ${!data.enabled ? 'opacity-50' : ''}`} style={{ minWidth: 220 }}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className={`${headerColor} px-3 py-1.5 flex items-center gap-2`}>
        {data.logic && (
          <span className="text-xs font-bold text-white bg-white/20 rounded-md px-1.5 py-0.5">
            {data.logic}
          </span>
        )}
        <span className="text-sm font-medium text-white truncate">{data.label}</span>
      </div>
      <div className={`${colors.bg} px-3 py-2 flex items-center justify-between`}>
        <span className="text-xs text-slate-500">{data.childCount} items</span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${data.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {data.enabled ? 'enabled' : 'disabled'}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

function FolderNode({ data }: NodeProps<Node<FolderNodeData>>) {
  return (
    <div className={`rounded-xl border shadow-card overflow-hidden border-indigo-200 ${!data.enabled ? 'opacity-50' : ''}`} style={{ minWidth: 220 }}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="bg-indigo-500 px-3 py-1.5 flex items-center gap-2">
        <span className="text-xs font-bold text-white bg-white/20 rounded-md px-1.5 py-0.5">
          FOLDER
        </span>
        <span className="text-sm font-medium text-white truncate">{data.label}</span>
      </div>
      <div className="bg-indigo-50 px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">{data.childCount} items</span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${data.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {data.enabled ? 'enabled' : 'disabled'}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

type StructuralNodeData = {
  label: string;
  nodeType: string;
  parentScope: string | null;
  evaluatedVariables: string[];
  childCount: number;
  enabled: boolean;
};

function StructuralNode({ data }: NodeProps<Node<StructuralNodeData>>) {
  return (
    <div className={`rounded-xl border shadow-card overflow-hidden border-violet-200 ${!data.enabled ? 'opacity-50' : ''}`} style={{ minWidth: 220 }}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="bg-violet-500 px-3 py-1.5 flex items-center gap-2">
        <span className="text-xs font-bold text-white bg-white/20 rounded-md px-1.5 py-0.5">
          {data.nodeType}
        </span>
        <span className="text-sm font-medium text-white truncate">
          {data.parentScope || data.label}
        </span>
      </div>
      <div className="bg-violet-50 px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {data.evaluatedVariables.length > 0
            ? data.evaluatedVariables.join(', ')
            : `${data.childCount} items`}
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${data.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {data.enabled ? 'enabled' : 'disabled'}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

function ConditionNode({ data }: NodeProps<Node<ConditionNodeData>>) {
  const isNoValue = ['is_true', 'is_false', 'is_null', 'is_not_null', 'is_today', 'is_yesterday'].includes(data.operator);

  return (
    <div className={`rounded-xl border border-slate-200 shadow-card bg-white ${!data.enabled ? 'opacity-50' : ''}`} style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="px-3 py-2.5">
        <div className="text-xs font-medium text-slate-600 mb-1">{data.field}</div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-mono text-accent-600">{data.operatorSymbol}</span>
          {!isNoValue && (
            <span className="text-sm text-slate-600 truncate max-w-[140px]">{data.value}</span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${data.enabled ? 'bg-emerald-400' : 'bg-slate-300'}`} />
          <span className="text-[10px] text-slate-400">{data.enabled ? 'enabled' : 'disabled'}</span>
        </div>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  groupNode: GroupNode,
  folderNode: FolderNode,
  structuralNode: StructuralNode,
  conditionNode: ConditionNode,
};

/* ── tree → nodes/edges ── */

const GROUP_WIDTH = 280;
const GROUP_HEIGHT = 70;
const CONDITION_WIDTH = 240;
const CONDITION_HEIGHT = 80;

function treeToNodesEdges(root: RuleGroup): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function walk(item: RuleItem, parentId: string | null, parentLogic: string | null) {
    if (item.type === 'group') {
      const group = item as RuleGroup;
      nodes.push({
        id: group.id,
        type: 'groupNode',
        position: { x: 0, y: 0 },
        data: {
          label: group.name,
          logic: group.logic,
          childCount: group.conditions.length,
          enabled: group.enabled,
        },
        width: GROUP_WIDTH,
        height: GROUP_HEIGHT,
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${group.id}`,
          source: parentId,
          target: group.id,
          label: parentLogic ?? undefined,
          style: { stroke: '#cbd5e1' },
          labelStyle: { fontSize: 10, fill: '#64748b' },
          labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
        });
      }

      for (const child of group.conditions) {
        walk(child, group.id, group.logic);
      }
    } else if (item.type === 'structural') {
      const structural = item as RuleStructural;
      nodes.push({
        id: structural.id,
        type: 'structuralNode',
        position: { x: 0, y: 0 },
        data: {
          label: structural.name,
          nodeType: structural.nodeType || 'scope',
          parentScope: structural.parentScope,
          evaluatedVariables: structural.evaluatedVariables || [],
          childCount: structural.conditions.length,
          enabled: structural.enabled,
        },
        width: GROUP_WIDTH,
        height: GROUP_HEIGHT,
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${structural.id}`,
          source: parentId,
          target: structural.id,
          label: parentLogic ?? undefined,
          style: { stroke: '#cbd5e1' },
          labelStyle: { fontSize: 10, fill: '#64748b' },
          labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
        });
      }

      for (const child of structural.conditions) {
        walk(child, structural.id, null);
      }
    } else if (item.type === 'folder') {
      const folder = item as RuleFolder;
      nodes.push({
        id: folder.id,
        type: 'folderNode',
        position: { x: 0, y: 0 },
        data: {
          label: folder.name,
          childCount: folder.conditions.length,
          enabled: folder.enabled,
        },
        width: GROUP_WIDTH,
        height: GROUP_HEIGHT,
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${folder.id}`,
          source: parentId,
          target: folder.id,
          label: parentLogic ?? undefined,
          style: { stroke: '#cbd5e1' },
          labelStyle: { fontSize: 10, fill: '#64748b' },
          labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
        });
      }

      for (const child of folder.conditions) {
        walk(child, folder.id, null);
      }
    } else {
      const condition = item as RuleCondition;
      nodes.push({
        id: condition.id,
        type: 'conditionNode',
        position: { x: 0, y: 0 },
        data: {
          field: getFieldLabel(condition.field),
          operatorSymbol: getOperatorSymbol(condition.dataType, condition.operator),
          value: condition.value,
          enabled: condition.enabled,
          operator: condition.operator,
        },
        width: CONDITION_WIDTH,
        height: CONDITION_HEIGHT,
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${condition.id}`,
          source: parentId,
          target: condition.id,
          label: parentLogic ?? undefined,
          style: { stroke: '#cbd5e1' },
          labelStyle: { fontSize: 10, fill: '#64748b' },
          labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
        });
      }
    }
  }

  // Start with the root group itself as the top node
  nodes.push({
    id: root.id,
    type: 'groupNode',
    position: { x: 0, y: 0 },
    data: {
      label: root.name,
      logic: root.logic,
      childCount: root.conditions.length,
      enabled: root.enabled,
    },
    width: GROUP_WIDTH,
    height: GROUP_HEIGHT,
  });

  for (const child of root.conditions) {
    walk(child, root.id, root.logic);
  }

  return { nodes, edges };
}

/* ── dagre layout ── */

function getLayoutedElements(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 30, ranksep: 80 });

  for (const node of nodes) {
    g.setNode(node.id, {
      width: node.width ?? CONDITION_WIDTH,
      height: node.height ?? CONDITION_HEIGHT,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const w = node.width ?? CONDITION_WIDTH;
    const h = node.height ?? CONDITION_HEIGHT;
    return {
      ...node,
      position: {
        x: pos.x - w / 2,
        y: pos.y - h / 2,
      },
    };
  });
}

/* ── component ── */

export function FlowTreeView({ rules }: FlowTreeViewProps) {
  const { nodes, edges } = useMemo(() => {
    const raw = treeToNodesEdges(rules);
    const layouted = getLayoutedElements(raw.nodes, raw.edges);
    return { nodes: layouted, edges: raw.edges };
  }, [rules]);

  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 50);
  }, []);

  return (
    <div style={{ height: 600 }} className="w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={2}
      >
        <MiniMap
          nodeStrokeWidth={2}
          pannable
          zoomable
          style={{ border: '1px solid #e2e8f0', borderRadius: 12 }}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
