import { memo } from 'react';

interface DragHandleProps {
  className?: string;
}

function DragHandleComponent({ className = '' }: DragHandleProps) {
  return (
    <div
      className={`flex flex-col gap-0.5 cursor-grab active:cursor-grabbing opacity-40 hover:opacity-70 transition-opacity ${className}`}
    >
      <div className="flex gap-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      </div>
      <div className="flex gap-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      </div>
      <div className="flex gap-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      </div>
    </div>
  );
}

export const DragHandle = memo(DragHandleComponent);
