import { GripVertical } from 'lucide-react';

interface DraggableMetaElementProps {
  type: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  isNew?: boolean;
  onDragStart?: (type: string) => void;
  onDragEnd?: () => void;
}

const DraggableMetaElement = ({
  type,
  description,
  icon,
  color,
  isNew,
  onDragStart: onDragStartCallback,
  onDragEnd: onDragEndCallback,
}: DraggableMetaElementProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set the data - mark as meta-component
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, isMeta: true }));
    e.dataTransfer.setData('application/json', JSON.stringify({ type, isMeta: true }));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStartCallback?.(type);
  };

  const handleDragEnd = () => {
    onDragEndCallback?.();
  };

  // Generate color-based styles if custom color is provided
  const baseStyle = color
    ? {
        backgroundColor: `${color}10`,
        borderColor: `${color}40`,
      }
    : undefined;

  const hoverStyle = color
    ? {
        '--hover-bg': `${color}20`,
        '--hover-border': color,
      } as React.CSSProperties
    : undefined;

  return (
    <div
      draggable
      unselectable="on"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`droppable-element p-2 mb-2 rounded-md cursor-grab flex items-start gap-3 transition-colors active:cursor-grabbing ${
        color
          ? 'border hover:brightness-95'
          : 'bg-purple-50 border border-purple-200 hover:bg-purple-100 hover:border-purple-400'
      }`}
      style={{ ...baseStyle, ...hoverStyle }}
    >
      <GripVertical
        className="w-5 h-5 mt-1 flex-shrink-0"
        style={{ color: color ? `${color}80` : undefined }}
      />
      {icon}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium" style={{ color: color || '#6b21a8' }}>
            {type}
          </p>
          {isNew && (
            <span
              className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full text-white"
              style={{ backgroundColor: color || '#9333ea' }}
            >
              NEW
            </span>
          )}
        </div>
        <p
          className="text-sm truncate"
          style={{ color: color ? `${color}cc` : '#7c3aed' }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default DraggableMetaElement;
