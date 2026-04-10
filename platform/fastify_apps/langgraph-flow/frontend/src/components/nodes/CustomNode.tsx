import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { AINodeData } from '@/types/flow.types';
import { CATEGORY_MAP, TEMPLATE_MAP } from '@/config/node-registry';

type FlowNode = Node<AINodeData, 'customNode'>;

const SPECIAL_TYPES = new Set(['START', 'END']);

function CustomNodeInner({ data, selected, id }: NodeProps<FlowNode>) {
  const nodeData = data as AINodeData;
  const category = CATEGORY_MAP[nodeData.nodeType];
  const template = TEMPLATE_MAP[nodeData.nodeType];
  const color = category?.color ?? '#64748b';
  const icon = category?.icon ?? '[?]';
  const isSpecial = SPECIAL_TYPES.has(nodeData.nodeType);

  const inHandles = template?.inHandles ?? [];
  const outHandles = template?.outHandles ?? [];

  return (
    <div className="relative select-none">
      {/* Selection glow */}
      {selected && (
        <div
          className="absolute -inset-2 rounded-2xl blur-lg opacity-15 pointer-events-none"
          style={{ background: color }}
        />
      )}

      {/* Card */}
      <div
        className="relative rounded-xl border transition-all duration-200"
        style={{
          width: isSpecial ? 96 : 192,
          minHeight: isSpecial ? 48 : 72,
          borderColor: selected ? color : '#e2e8f0',
          borderWidth: selected ? '2px' : '1px',
          background: selected
            ? `linear-gradient(135deg, ${color}08, ${color}04)`
            : '#ffffff',
          boxShadow: selected
            ? `0 4px 12px ${color}15`
            : '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Input handles — left side */}
        {inHandles.map((handle, i) => (
          <Handle
            key={`in-${handle.id}`}
            type="target"
            position={Position.Left}
            id={handle.id}
            style={{
              top: inHandles.length === 1
                ? '50%'
                : `${((i + 1) / (inHandles.length + 1)) * 100}%`,
              transform: 'translateY(-50%)',
              borderColor: color,
              background: '#ffffff',
            }}
          />
        ))}

        {/* Output handles — right side */}
        {outHandles.map((handle, i) => (
          <Handle
            key={`out-${handle.id}`}
            type="source"
            position={Position.Right}
            id={handle.id}
            style={{
              top: outHandles.length === 1
                ? '50%'
                : `${((i + 1) / (outHandles.length + 1)) * 100}%`,
              transform: 'translateY(-50%)',
              borderColor: color,
              background: '#ffffff',
            }}
          />
        ))}

        {/* Content */}
        <div
          className={`flex ${isSpecial ? 'items-center justify-center h-12 px-3' : 'flex-col px-3.5 py-3'}`}
        >
          {/* Header row */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="text-xs font-bold shrink-0"
              style={{ color }}
            >
              {icon}
            </span>
            <span
              className="text-xs font-semibold tracking-wide truncate"
              style={{ color }}
            >
              {nodeData.nodeType}
            </span>
          </div>

          {/* ID + category badge */}
          {!isSpecial && (
            <>
              <span className="text-[10px] mt-1 text-slate-400 font-mono truncate">
                {id}
              </span>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: `${color}10`,
                    color,
                    border: `1px solid ${color}20`,
                  }}
                >
                  {category?.label ?? nodeData.category}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const CustomNode = memo(CustomNodeInner);
export default CustomNode;
