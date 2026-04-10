import { useCallback, type MouseEvent, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type OnInit,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '@/stores/flow.store';
import { CustomNode } from '@/components/nodes/CustomNode';
import { CATEGORY_MAP } from '@/config/node-registry';

const nodeTypes = {
  customNode: CustomNode,
};

function miniMapNodeColor(node: Node) {
  const nodeType = (node.data as Record<string, unknown>)?.nodeType as string | undefined;
  const category = CATEGORY_MAP[nodeType ?? ''];
  return category?.color ?? '#94a3b8';
}

export function FlowCanvas() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const setViewport = useFlowStore((s) => s.setViewport);

  const onInit: OnInit = useCallback(
    (instance) => {
      instance.fitView({ padding: 0.2 });
      const vp = instance.getViewport();
      setViewport(vp);
    },
    [setViewport],
  );

  const onNodeClick = useCallback(
    (_: MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onMoveEnd = useCallback(
    (_: unknown, viewport: { x: number; y: number; zoom: number }) => {
      setViewport(viewport);
    },
    [setViewport],
  );

  // Drop handler for future drag-and-drop from palette
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/langgraph-node');
      if (!nodeType) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      useFlowStore.getState().addNode(nodeType, position);
    },
    [],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="h-full w-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        colorMode="light"
        defaultEdgeOptions={{
          style: { strokeWidth: 1.5, stroke: '#94a3b8' },
          animated: false,
        }}
        style={{ background: '#f8fafc' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(148,163,184,0.3)"
        />
        <Controls
          style={{ bottom: 80, left: 16 }}
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(99, 102, 241, 0.05)"
          style={{ bottom: 80, right: 16 }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
