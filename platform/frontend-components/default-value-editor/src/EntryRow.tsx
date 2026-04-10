import { useState, useEffect, useRef } from 'react';
import type { EntryRowProps } from './types';
import { DefaultIcons } from './DefaultIcons';

export function EntryRow({
  className,
  entry,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isOver,
  duplicateKey,
  draggable: isDraggable = true,
  icons,
}: EntryRowProps) {
  const [editing, setEditing] = useState(false);
  const [editKey, setEditKey] = useState(entry.key);
  const [editVal, setEditVal] = useState(entry.value);
  const keyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && keyRef.current) keyRef.current.focus();
  }, [editing]);

  const save = () => {
    if (editKey.trim()) {
      onUpdate(entry.id, editKey.trim(), editVal.trim());
    }
    setEditing(false);
  };

  const cancel = () => {
    setEditKey(entry.key);
    setEditVal(entry.value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  const startEdit = () => {
    setEditKey(entry.key);
    setEditVal(entry.value);
    setEditing(true);
  };

  const baseClass = [
    'group flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200',
    isDragging ? 'opacity-40 scale-95' : 'opacity-100',
    isOver
      ? 'border-blue-400 bg-blue-50/50 ring-1 ring-blue-200'
      : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50',
    duplicateKey ? 'border-amber-300 bg-amber-50/30' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? (e) => onDragStart(e, index) : undefined}
      onDragOver={isDraggable ? (e) => onDragOver(e, index) : undefined}
      onDrop={isDraggable ? (e) => onDrop(e, index) : undefined}
      className={baseClass}
    >
      {isDraggable && (
        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors shrink-0 py-1">
          {icons?.gripIcon ?? DefaultIcons.grip(14)}
        </div>
      )}

      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            ref={keyRef}
            value={editKey}
            onChange={(e) => setEditKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Key"
            className="w-32 px-2.5 py-1.5 text-sm font-medium bg-white border border-blue-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
          />
          <span className="text-slate-300 text-xs">:</span>
          <input
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Value"
            className="flex-1 px-2.5 py-1.5 text-sm bg-white border border-blue-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100 text-slate-600"
          />
          <button onClick={save} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Save">
            {icons?.checkIcon ?? DefaultIcons.check(15)}
          </button>
          <button onClick={cancel} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors" title="Cancel">
            {icons?.closeIcon ?? DefaultIcons.close(15)}
          </button>
        </div>
      ) : (
        <>
          <div
            className="flex-1 flex items-center gap-1.5 min-w-0 cursor-pointer"
            onClick={startEdit}
          >
            <span className="text-sm font-semibold text-slate-700 shrink-0">{entry.key}</span>
            <span className="text-slate-300 text-xs shrink-0">:</span>
            <span className="text-sm text-slate-500 truncate">{entry.value}</span>
            {duplicateKey && (
              <span className="ml-1.5 text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0">
                DUPLICATE
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={startEdit}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit"
            >
              {icons?.editIcon ?? DefaultIcons.edit(14)}
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete"
            >
              {icons?.trashIcon ?? DefaultIcons.trash(14)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
