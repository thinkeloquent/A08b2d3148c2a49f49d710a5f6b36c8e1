import { useState, useMemo, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useFlowStore } from '@/stores/flow.store';
import { CATEGORIES, CATEGORY_MAP } from '@/config/node-registry';
import type { AINodeData } from '@/types/flow.types';

type PanelTab = 'nodes' | 'schema';

interface SchemaBlockProps {
  title: string;
  color: string;
  fields: string[];
}

function SchemaBlock({ title, color, fields }: SchemaBlockProps) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <div
        className="px-3 py-2 text-xs font-semibold tracking-wide uppercase"
        style={{ background: `${color}08`, color }}
      >
        {title}
      </div>
      <div className="px-3 py-2.5 space-y-0.5">
        {fields.map((f, i) => (
          <div key={i} className="text-xs font-mono text-slate-500">
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddNodePanel({ onClose }: { onClose: () => void }) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const addNode = useFlowStore((s) => s.addNode);

  const filtered = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      nodeTypes: cat.nodeTypes.filter((t) => t.toLowerCase().includes(q)),
    })).filter((cat) => cat.nodeTypes.length > 0);
  }, [search]);

  function handleAddNode(nodeType: string) {
    addNode(nodeType, { x: 300 + Math.random() * 100, y: 200 + Math.random() * 100 });
    onClose();
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1 shrink-0">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Node</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-sm px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-1 pb-2 shrink-0">
        <input
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 px-2 py-4 text-center">No nodes found</p>
        )}
        {filtered.map((cat) => (
          <div key={cat.id}>
            <button
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-xs font-bold" style={{ color: cat.color }}>
                {cat.icon}
              </span>
              <span className="text-sm font-medium flex-1" style={{ color: cat.color }}>
                {cat.label}
              </span>
              <span
                className="text-xs text-slate-400 transition-transform duration-150"
                style={{ transform: expandedCat === cat.id ? 'rotate(90deg)' : 'none' }}
              >
                {'>'}
              </span>
            </button>

            {expandedCat === cat.id && (
              <div className="ml-5 mb-2 space-y-0.5">
                {cat.nodeTypes.map((nodeType) => (
                  <button
                    key={nodeType}
                    onClick={() => handleAddNode(nodeType)}
                    className="w-full text-left text-sm px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    + {nodeType}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function NodePalette() {
  const [activeTab, setActiveTab] = useState<PanelTab>('nodes');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const nodes = useFlowStore((s) => s.nodes);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const { setCenter, getZoom } = useReactFlow();

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      // Center viewport on the node (offset by approximate node half-size)
      const zoom = getZoom();
      setCenter(node.position.x + 100, node.position.y + 40, { zoom, duration: 300 });
    },
    [nodes, setSelectedNode, setCenter, getZoom],
  );

  return (
    <div className="w-60 flex flex-col border-r border-slate-200 bg-white animate-slide-in-left">
      {/* Tab switcher + Add button */}
      <div className="flex border-b border-slate-200 shrink-0">
        {(['nodes', 'schema'] as PanelTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowAddPanel(false); }}
            className={`flex-1 py-2.5 text-xs uppercase tracking-wider font-medium transition-colors ${
              activeTab === tab && !showAddPanel
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
        <button
          onClick={() => setShowAddPanel(!showAddPanel)}
          className={`px-3 py-2.5 text-sm font-bold transition-colors border-l border-slate-200 ${
            showAddPanel
              ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50'
          }`}
          title="Add a node"
        >
          +
        </button>
      </div>

      {/* Add Node panel (overlay) */}
      {showAddPanel && <AddNodePanel onClose={() => setShowAddPanel(false)} />}

      {/* Active nodes list */}
      {!showAddPanel && activeTab === 'nodes' && (
        <div className="flex-1 overflow-y-auto">
          {nodes.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-400">No nodes yet</p>
              <button
                onClick={() => setShowAddPanel(true)}
                className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                + Add your first node
              </button>
            </div>
          )}
          <div className="px-2 py-2 space-y-0.5">
            {nodes.map((node) => {
              const data = node.data as AINodeData;
              const cat = CATEGORY_MAP[data.nodeType];
              const isSelected = node.id === selectedNodeId;
              return (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 ring-1 ring-indigo-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat?.color ?? '#94a3b8' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">
                      {data.name ?? data.nodeType}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {data.nodeType} &middot; {node.id}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Schema tab */}
      {!showAddPanel && activeTab === 'schema' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            <SchemaBlock
              title="AIWorkflow"
              color="#6366f1"
              fields={['id: UUID', 'name: String', 'description: String', 'viewport: Viewport', 'nodes: AINode[]', 'edges: AIEdge[]']}
            />
            <SchemaBlock
              title="AIViewport"
              color="#8b5cf6"
              fields={['x: Float', 'y: Float', 'zoom: Float']}
            />
            <SchemaBlock
              title="AINode"
              color="#10b981"
              fields={['id: String', 'type: String', 'position: {x,y}', 'data.nodeType: String', 'data.category: String', 'data.inputs: JSON']}
            />
            <SchemaBlock
              title="AIEdge"
              color="#f59e0b"
              fields={['id: String', 'source: NodeID', 'sourceHandle: String', 'target: NodeID', 'targetHandle: String', 'type?: String']}
            />
            <SchemaBlock
              title="FlowVersion"
              color="#ec4899"
              fields={['id: UUID', 'flowId: FK', 'version: Int', 'flowData: JSONB', 'createdAt: DateTime']}
            />
          </div>
        </div>
      )}
    </div>
  );
}
