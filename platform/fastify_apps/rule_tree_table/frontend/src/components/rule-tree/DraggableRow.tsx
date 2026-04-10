import { type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { flexRender, type Row } from '@tanstack/react-table';
import type { RuleItem } from '../../types/rule.types';

interface DraggableRowProps {
  row: Row<RuleItem>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function DraggableRow({ row, onMouseEnter, onMouseLeave }: DraggableRowProps) {
  const {
    attributes,
    // listeners are collected by parent RuleTreeTable per-row via table.options.meta
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const item = row.original;
  const isContainerItem = item.type === 'group' || item.type === 'folder' || item.type === 'structural';
  const depth = row.depth;
  // isLast simplified — border styling handled by TanStack

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 0,
  };

  // Store listeners so columns can access them via table.options.meta
  // This is done by the parent RuleTreeTable which collects them per-row

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        group transition-colors duration-200
        ${item.type === 'group' ? 'bg-slate-100 hover:bg-slate-150' : item.type === 'structural' ? 'bg-violet-50/30 hover:bg-violet-50/50' : item.type === 'folder' ? 'bg-indigo-50/50 hover:bg-indigo-50' : item.enabled ? 'hover:bg-gray-50' : ''}
        ${!item.enabled ? 'opacity-50' : ''}
        ${!isContainerItem && depth > 0 ? 'bg-gray-50/50' : ''}
        border-b border-gray-100
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={
            cell.column.id === 'status' || cell.column.id === 'actions'
              ? 'py-3 px-4 text-center'
              : cell.column.id === 'expand'
                ? 'py-3 px-4 w-12'
                : cell.column.id === 'select'
                  ? 'py-3 px-2 w-10'
                  : cell.column.id === 'type'
                    ? 'py-3 px-2 w-12'
                    : cell.column.id === 'drag'
                      ? 'py-3 px-1 w-8'
                      : 'py-3 px-4'
          }
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}
