import { X, Trash2, Lock } from 'lucide-react';
import { useFlowStore } from '@/stores/flow.store';
import type { AINodeData } from '@/types/flow.types';
import { CATEGORY_MAP } from '@/config/node-registry';

interface PropFieldProps {
  label: string;
  value: string | number | boolean;
  readOnly?: boolean;
  color: string;
  onChange?: (value: string) => void;
}

function PropField({ label, value, readOnly, color, onChange }: PropFieldProps) {
  const isBoolean = typeof value === 'boolean';

  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-1 block">
        {label}
      </label>
      {isBoolean ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value as boolean}
            disabled={readOnly}
            onChange={(e) => onChange?.(String(e.target.checked))}
            className="w-4 h-4 rounded accent-indigo-500"
          />
          <span className="text-sm text-slate-600 font-mono">{String(value)}</span>
        </div>
      ) : (
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={String(value)}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full text-sm px-3 py-1.5 rounded-lg border outline-none font-mono transition-colors ${
            readOnly
              ? 'text-slate-400 bg-slate-50 border-slate-100 cursor-default'
              : 'text-slate-700 bg-white border-slate-200 focus:ring-1 focus:ring-indigo-100'
          }`}
          style={!readOnly ? { borderColor: `${color}40` } : {}}
        />
      )}
    </div>
  );
}

export function NodeProperties() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const updateNodePosition = useFlowStore((s) => s.updateNodePosition);
  const removeNode = useFlowStore((s) => s.removeNode);

  const rawNode = nodes.find((n) => n.id === selectedNodeId);
  if (!rawNode) return null;

  const nodeData = rawNode.data as AINodeData;
  const category = CATEGORY_MAP[nodeData.nodeType];
  const color = category?.color ?? '#64748b';
  const icon = category?.icon ?? '[?]';

  function handleInputChange(key: string, rawValue: string) {
    const existing = nodeData.inputs[key];
    let coerced: unknown = rawValue;
    if (typeof existing === 'number') coerced = Number(rawValue);
    else if (typeof existing === 'boolean') coerced = rawValue === 'true';
    updateNodeData(rawNode!.id, {
      inputs: { ...nodeData.inputs, [key]: coerced },
    });
  }

  return (
    <div className="w-72 border-l border-slate-200 bg-white flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color }}>
            {icon}
          </span>
          <span className="text-sm font-semibold truncate" style={{ color }}>
            {nodeData.nodeType}
          </span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-50"
          aria-label="Close properties"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Identity */}
        <div className="space-y-3">
          <PropField label="Node ID" value={rawNode.id} readOnly color={color} />
          <PropField
            label="Category"
            value={category?.label ?? nodeData.category}
            readOnly
            color={color}
          />
        </div>

        {/* Position */}
        <div>
          <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-2">Position</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-1 block">X</label>
              <input
                type="number"
                value={Math.round(rawNode.position.x)}
                onChange={(e) =>
                  updateNodePosition(rawNode.id, {
                    x: Number(e.target.value),
                    y: rawNode.position.y,
                  })
                }
                className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-mono outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-1 block">Y</label>
              <input
                type="number"
                value={Math.round(rawNode.position.y)}
                onChange={(e) =>
                  updateNodePosition(rawNode.id, {
                    x: rawNode.position.x,
                    y: Number(e.target.value),
                  })
                }
                className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-mono outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Dynamic inputs */}
        {Object.keys(nodeData.inputs).length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-2">Configuration</p>
            <div className="space-y-3">
              {Object.entries(nodeData.inputs).map(([key, val]) => (
                <PropField
                  key={key}
                  label={key}
                  value={
                    typeof val === 'object' && val !== null
                      ? JSON.stringify(val)
                      : (val as string | number | boolean)
                  }
                  color={color}
                  onChange={(v) => handleInputChange(key, v)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        <div className="pt-1">
          <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-2">Credentials</p>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <Lock size={12} className="text-amber-500 shrink-0" />
            <span className="text-xs text-amber-600">
              Mapped to env vars at runtime
            </span>
          </div>
        </div>
      </div>

      {/* Footer — delete */}
      <div className="px-4 py-3 border-t border-slate-200 shrink-0">
        <button
          onClick={() => removeNode(rawNode.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors text-sm font-medium"
        >
          <Trash2 size={13} />
          Delete Node
        </button>
      </div>
    </div>
  );
}
