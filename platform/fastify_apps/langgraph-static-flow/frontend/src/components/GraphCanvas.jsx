import { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../nodes/CustomNodes.jsx';
import { getLayoutedElements } from '../graph/layout.js';
import { useGraphStore } from '../store/useGraphStore.js';
import { t } from '../graph/g11n.js';

/**
 * Build React Flow nodes from graph.json — fully data-driven.
 * Nodes arrive with type "customNode" and all rendering data in `data`.
 * Positions from JSON are used as hints but overridden by dagre layout.
 */
function buildNodes(graphDef) {
  return graphDef.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    data: n.data,
    position: n.position ?? { x: 0, y: 0 },
  }));
}

/**
 * Build React Flow edges from graph.json — with handle awareness.
 * Visual properties come from edge.data; structural fields (source,
 * target, handles) sit at the top level per the universal schema.
 */
function buildEdges(graphDef) {
  return graphDef.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    type: e.type ?? 'smoothstep',
    animated: e.data?.animated ?? false,
    style: {
      stroke: e.data?.color,
      ...(e.data?.dashArray ? { strokeDasharray: e.data.dashArray } : {}),
    },
    label: e.data?.label,
  }));
}

export default function GraphCanvas() {
  const graphDef = useGraphStore((s) => s.graphDef);
  const activeNodeId = useGraphStore((s) => s.activeNodeId);
  const [showMinimap, setShowMinimap] = useState(false);

  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    if (!graphDef) return { layoutedNodes: [], layoutedEdges: [] };
    const rawNodes = buildNodes(graphDef);
    const rawEdges = buildEdges(graphDef);
    const { nodes, edges } = getLayoutedElements(rawNodes, rawEdges);
    return { layoutedNodes: nodes, layoutedEdges: edges };
  }, [graphDef]);

  const styledEdges = useMemo(() => {
    return layoutedEdges.map((e) => {
      const isActive = e.source === activeNodeId || e.target === activeNodeId;
      return {
        ...e,
        animated: isActive,
        className: isActive ? 'edge-flow-active' : '',
        style: {
          ...e.style,
          opacity: isActive ? 1 : 0.25,
          strokeWidth: isActive ? 3 : 1.5,
          strokeDasharray: isActive ? '8 4' : (e.style?.strokeDasharray ?? 'none'),
        },
        labelStyle: { fill: '#64748b', fontSize: 10 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
      };
    });
  }, [layoutedEdges, activeNodeId]);

  if (!graphDef) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
        Loading graph...
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <GraphCanvasInner
        graphDef={graphDef}
        layoutedNodes={layoutedNodes}
        styledEdges={styledEdges}
        activeNodeId={activeNodeId}
        showMinimap={showMinimap}
        setShowMinimap={setShowMinimap}
      />
    </ReactFlowProvider>
  );
}

function GraphCanvasInner({ graphDef, layoutedNodes, styledEdges, activeNodeId, showMinimap, setShowMinimap }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleZoomIn = useCallback(() => zoomIn({ duration: 200 }), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut({ duration: 200 }), [zoomOut]);
  const handleFitView = useCallback(() => fitView({ padding: 0.3, duration: 300 }), [fitView]);

  return (
    <div className="h-full w-full relative" style={{ backgroundColor: '#f0f1f5' }}>
      <ReactFlow
        nodes={layoutedNodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.4}
        maxZoom={1.5}
        style={{ backgroundColor: '#f0f1f5' }}
      >
        <Background color="#c8ccd4" gap={20} size={1.5} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(n) => {
            if (n.id === activeNodeId) return '#6366f1';
            return '#94a3b8';
          }}
          nodeStrokeColor={(n) => {
            if (n.id === activeNodeId) return '#4f46e5';
            return '#cbd5e1';
          }}
          maskColor="rgba(0, 0, 0, 0.08)"
          maskStrokeColor="#6366f1"
          maskStrokeWidth={2}
          pannable
          zoomable
          zoomStep={5}
          offsetScale={2}
          className={showMinimap ? '' : 'minimap-hidden'}
        />
      </ReactFlow>

      {/* Minimap toggle + zoom controls — positioned to sit around the minimap */}
      {showMinimap ? (
        <>
          {/* Toggle above minimap */}
          <button
            onClick={() => setShowMinimap(false)}
            data-testid="minimap-toggle"
            className="absolute bottom-[172px] right-[10px] z-[5] px-2.5 py-1 text-xs font-medium rounded-lg border shadow-sm bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 transition-colors"
            title={t(graphDef, 'canvasMinimapHide')}
          >
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="12" height="12" rx="2" />
                <rect x="7" y="7" width="5" height="5" rx="1" strokeDasharray="2 1" />
              </svg>
              {t(graphDef, 'canvasMinimapHideButton')}
            </span>
          </button>

          {/* Zoom controls below minimap */}
          <div
            className="absolute bottom-[6px] right-[10px] z-[5] flex items-center bg-white border border-slate-200 rounded-lg shadow-sm p-0.5"
            data-testid="minimap-zoom-controls"
          >
            <button
              onClick={handleZoomOut}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title={t(graphDef, 'canvasZoomOut')}
              data-testid="minimap-zoom-out"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8" />
              </svg>
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={handleFitView}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title={t(graphDef, 'canvasFitView')}
              data-testid="minimap-fit-view"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 5V2h3M9 2h3v3M12 9v3h-3M5 12H2V9" />
              </svg>
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={handleZoomIn}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title={t(graphDef, 'canvasZoomIn')}
              data-testid="minimap-zoom-in"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 3v8M3 7h8" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => setShowMinimap(true)}
          data-testid="minimap-toggle"
          className="absolute bottom-3 right-3 z-[5] px-3 py-1.5 text-xs font-medium rounded-lg border shadow-sm bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          title={t(graphDef, 'canvasMinimapShow')}
        >
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="12" height="12" rx="2" />
              <rect x="7" y="7" width="5" height="5" rx="1" strokeDasharray="2 1" />
            </svg>
            {t(graphDef, 'canvasMinimapShowButton')}
          </span>
        </button>
      )}
    </div>
  );
}
