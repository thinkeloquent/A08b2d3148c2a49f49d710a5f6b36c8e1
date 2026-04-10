import { GripVertical } from 'lucide-react';

interface DraggableFormElementProps {
  type: string;
  description: string;
  icon: React.ReactNode;
  onDragStart?: (type: string) => void;
  onDragEnd?: () => void;
}

const DraggableFormElement = ({ type, description, icon, onDragStart: onDragStartCallback, onDragEnd: onDragEndCallback }: DraggableFormElementProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set the data for react-grid-layout with validated format
    const dragData = { type, isMeta: false, isExisting: false };
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'copy';
    // Notify parent
    onDragStartCallback?.(type);
  };

  const handleDragEnd = () => {
    onDragEndCallback?.();
  };

  return (
    <div
      draggable
      unselectable="on"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="droppable-element p-2 mb-2 bg-white border border-gray-200 rounded-md cursor-grab hover:bg-gray-50 hover:border-indigo-300 flex items-start gap-3 transition-colors active:cursor-grabbing"
    >
      <GripVertical className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
      {icon}
      <div className="min-w-0">
        <p className="font-medium text-gray-800">{type}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
    </div>
  );
};

export default DraggableFormElement;
