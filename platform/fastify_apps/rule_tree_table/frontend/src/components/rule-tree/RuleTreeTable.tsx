import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ExpandedState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { ChevronsDownUp, ChevronsUpDown, Filter, Table2, FileCode, Workflow, Plus, FolderPlus, Group } from 'lucide-react';
import { RuleItemInfoModal } from '../feedback/RuleItemInfoModal';
import { IntegrationModal } from '../feedback/IntegrationModal';
import { AsciiTreeView } from './AsciiTreeView';
import { FlowTreeView } from './FlowTreeView';
import type { RuleGroup, RuleItem, GitMetadata } from '../../types/rule.types';
import { findParentOf } from '../../utils/tree-helpers';
import { useColumns, type TableMeta } from './columns';
import { DragOverlayRow } from './DragOverlayRow';

interface RuleTreeTableProps {
  rules: RuleGroup;
  onUpdate: (rules: RuleGroup) => void;
  onDelete: (id: string) => void;
  onAddCondition: (parentId: string) => void;
  onAddGroup: (parentId: string) => void;
  onAddFolder: (parentId: string) => void;
  onToggleExpand: (id: string) => void;
  onDuplicate: (item: RuleItem) => void;
  onMoveItem?: (itemId: string, targetParentId: string, targetIndex: number) => void;
  changedIds?: Set<string>;
  git?: GitMetadata;
}

/**
 * Collect initial expanded state from data tree.
 * Walks the tree and returns a Record<id, true> for expanded groups.
 */
function collectExpanded(items: RuleItem[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const item of items) {
    if (item.type === 'group' || item.type === 'folder' || item.type === 'structural') {
      const container = item as RuleGroup;
      if (container.expanded) result[container.id] = true;
      const sub = collectExpanded(container.conditions);
      Object.assign(result, sub);
    }
  }
  return result;
}

/**
 * Flatten visible row IDs for SortableContext.
 * Only includes rows whose ancestors are all expanded.
 */
function flattenRowIds(items: RuleItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    ids.push(item.id);
    if (item.type === 'group' || item.type === 'folder' || item.type === 'structural') {
      const container = item as RuleGroup;
      if (container.expanded) {
        ids.push(...flattenRowIds(container.conditions));
      }
    }
  }
  return ids;
}

/** Collect all container (group + folder) IDs from the tree. */
function collectAllContainerIds(items: RuleItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.type === 'group' || item.type === 'folder' || item.type === 'structural') {
      ids.push(item.id);
      ids.push(...collectAllContainerIds((item as RuleGroup).conditions));
    }
  }
  return ids;
}

/** Set `expanded` on every container in the tree. Returns a new root. */
function setAllExpanded(root: RuleGroup, value: boolean): RuleGroup {
  return {
    ...root,
    expanded: value,
    conditions: root.conditions.map((item) =>
      item.type === 'group' || item.type === 'folder' || item.type === 'structural'
        ? setAllExpanded(item as RuleGroup, value)
        : item
    ),
  };
}

function HorizontalScrollSlider({ colSpan }: { colSpan: number }) {
  const [scrollMax, setScrollMax] = useState(0);
  const [scrollPos, setScrollPos] = useState(0);
  const skipNextScroll = useRef(false);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollWidth - window.innerWidth;
      setScrollMax(Math.max(0, max));
      if (!skipNextScroll.current) {
        setScrollPos(window.scrollX);
      }
      skipNextScroll.current = false;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);

  if (scrollMax <= 0) return null;

  return (
    <tr>
      <th colSpan={colSpan} className="p-0 bg-slate-50 border-b border-slate-100">
        <div className="px-4 py-1.5 flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">Scroll</span>
          <input
            type="range"
            min={0}
            max={scrollMax}
            value={scrollPos}
            onChange={(e) => {
              const val = Number(e.target.value);
              skipNextScroll.current = true;
              setScrollPos(val);
              window.scrollTo({ left: val });
            }}
            className="w-full h-1.5 rounded-full appearance-none bg-slate-200 cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-500 [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:hover:bg-accent-600 [&::-webkit-slider-thumb]:cursor-grab
              [&::-webkit-slider-thumb]:active:cursor-grabbing"
          />
        </div>
      </th>
    </tr>
  );
}

export function RuleTreeTable({
  rules,
  onUpdate,
  onDelete,
  onAddCondition,
  onAddGroup,
  onAddFolder,
  onToggleExpand,
  onDuplicate,
  onMoveItem,
  changedIds,
  git,
}: RuleTreeTableProps) {
  const columns = useColumns();

  // View mode toggle
  const [viewMode, setViewMode] = useState<'table' | 'ascii' | 'flow'>('table');

  // Expansion state synced from data
  const [expanded, setExpanded] = useState<ExpandedState>(() =>
    collectExpanded(rules.conditions)
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [infoItem, setInfoItem] = useState<RuleItem | null>(null);
  const [integrationItem, setIntegrationItem] = useState<RuleItem | null>(null);

  // Track drag listeners per row so columns can access them
  const dragListenersRef = useRef<Record<string, SyntheticListenerMap | undefined>>({});

  // Wrap onToggleExpand to sync both data and TanStack expanded state
  const handleToggleExpand = useCallback(
    (id: string) => {
      onToggleExpand(id);
      setExpanded((prev) => {
        const next = typeof prev === 'boolean' ? {} : { ...prev };
        if (next[id]) {
          delete next[id];
        } else {
          next[id] = true;
        }
        return next;
      });
    },
    [onToggleExpand]
  );

  // Handle item update — delegates to parent's onUpdate which does setRules
  const handleUpdateItem = useCallback(
    (item: RuleItem) => {
      // Walk the tree and replace the item in-place
      function replaceInTree(node: RuleGroup): RuleGroup {
        return {
          ...node,
          conditions: node.conditions.map((child) => {
            if (child.id === item.id) return item;
            if (child.type === 'group' || child.type === 'folder' || child.type === 'structural') return replaceInTree(child as RuleGroup);
            return child;
          }),
        };
      }
      onUpdate(replaceInTree(rules));
    },
    [rules, onUpdate]
  );

  const emptyGit: GitMetadata = {};
  const tableMeta: TableMeta = useMemo(
    () => ({
      rules,
      onUpdate: handleUpdateItem,
      onDelete,
      onAddCondition,
      onAddGroup,
      onAddFolder,
      onToggleExpand: handleToggleExpand,
      onDuplicate,
      dragListeners: dragListenersRef.current,
      hoveredRowId,
      setHoveredRowId,
      git: git || emptyGit,
      onShowInfo: setInfoItem,
      onShowIntegration: setIntegrationItem,
    }),
    [rules, handleUpdateItem, onDelete, onAddCondition, onAddGroup, onAddFolder, handleToggleExpand, onDuplicate, hoveredRowId, git]
  );

  const table = useReactTable({
    data: rules.conditions,
    columns,
    state: { expanded, rowSelection },
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    getSubRows: (row) =>
      (row.type === 'group' || row.type === 'folder' || row.type === 'structural') ? (row as RuleGroup).conditions : undefined,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: true,
    enableSubRowSelection: true,
    meta: tableMeta,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Sortable IDs: all visible (flattened) row IDs
  const sortableIds = useMemo(
    () => flattenRowIds(rules.conditions),
    [rules.conditions]
  );

  // Find the dragged item for the overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    function find(items: RuleItem[]): RuleItem | null {
      for (const item of items) {
        if (item.id === activeId) return item;
        if (item.type === 'group' || item.type === 'folder' || item.type === 'structural') {
          const found = find((item as RuleGroup).conditions);
          if (found) return found;
        }
      }
      return null;
    }
    return find(rules.conditions);
  }, [activeId, rules.conditions]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setOverId(null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      setOverId(null);
      if (!onMoveItem) return;

      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeItemId = active.id as string;
      const overItemId = over.id as string;

      // Find the over item to determine if it's a group (drop into) or sibling (reorder)
      function findItem(items: RuleItem[]): RuleItem | null {
        for (const item of items) {
          if (item.id === overItemId) return item;
          if (item.type === 'group' || item.type === 'folder' || item.type === 'structural') {
            const found = findItem((item as RuleGroup).conditions);
            if (found) return found;
          }
        }
        return null;
      }

      const overItem = findItem(rules.conditions);
      if (!overItem) return;

      // If dropping onto a container (group or folder), insert at end
      if (overItem.type === 'group' || overItem.type === 'folder' || overItem.type === 'structural') {
        const container = overItem as RuleGroup;
        onMoveItem(activeItemId, container.id, container.conditions.length);
        return;
      }

      // Otherwise reorder within the same parent as `over`
      const parentResult = findParentOf(rules, overItemId);
      if (!parentResult) return;

      const { parent, index: overIndex } = parentResult;

      // Determine the active item's current position in the same parent
      const activeInSameParent = parent.conditions.findIndex((c) => c.id === activeItemId);
      let targetIndex = overIndex;

      // If active is in the same parent and before over, adjust index
      if (activeInSameParent !== -1 && activeInSameParent < overIndex) {
        targetIndex = overIndex; // After removal, the over index shifts down by 1, but we want to be at overIndex
      }

      onMoveItem(activeItemId, parent.id, targetIndex);
    },
    [rules, onMoveItem]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  const handleExpandAll = useCallback(() => {
    const allIds = collectAllContainerIds(rules.conditions);
    const expandedMap: Record<string, boolean> = {};
    for (const id of allIds) expandedMap[id] = true;
    setExpanded(expandedMap);
    onUpdate(setAllExpanded(rules, true));
  }, [rules, onUpdate]);

  const handleCollapseAll = useCallback(() => {
    setExpanded({});
    onUpdate(setAllExpanded(rules, false));
  }, [rules, onUpdate]);

  // Collect listeners from each DraggableRow via useSortable
  // We render rows and let them register their listeners
  const rows = table.getRowModel().rows;

  // Count containers (groups + folders) for the toolbar
  const containerCount = useMemo(() => collectAllContainerIds(rules.conditions).length, [rules.conditions]);

  return (
    <>
    <RuleItemInfoModal
      isOpen={infoItem !== null}
      onClose={() => setInfoItem(null)}
      item={infoItem}
      git={git || emptyGit}
    />
    <IntegrationModal
      isOpen={integrationItem !== null}
      onClose={() => setIntegrationItem(null)}
      item={integrationItem}
    />
    <div className="card overflow-clip">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <button
          onClick={() => onAddCondition(rules.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition-colors shadow-soft"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Condition
        </button>
        <button
          onClick={() => onAddGroup(rules.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-soft"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          Add Group
        </button>
        <button
          onClick={() => onAddFolder(rules.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors shadow-soft"
        >
          <Group className="w-3.5 h-3.5" />
          Add Folder
        </button>

        {containerCount > 0 && (
          <>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <button
              onClick={handleExpandAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              Expand All
            </button>
            <button
              onClick={handleCollapseAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <ChevronsDownUp className="w-3.5 h-3.5" />
              Collapse All
            </button>
            <span className="text-xs text-slate-400">{containerCount} groups/folders</span>
          </>
        )}

        <div className="w-px h-5 bg-slate-200 mx-1 ml-auto" />
        <span className="text-xs text-slate-400">View:</span>
        {/* Pill/tab selector */}
        <div className="inline-flex bg-slate-100 rounded-lg p-0.5">
          {([
            { key: 'table' as const, label: 'Table', Icon: Table2 },
            { key: 'ascii' as const, label: 'ASCII', Icon: FileCode },
            { key: 'flow' as const, label: 'Flow', Icon: Workflow },
          ]).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${viewMode === key
                  ? 'bg-white text-accent-700 shadow-soft'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
      {viewMode === 'ascii' && <AsciiTreeView rules={rules} />}
      {viewMode === 'flow' && <FlowTreeView rules={rules} />}
      {viewMode === 'table' && (
        <div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <table className="min-w-full">
              <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-20">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider ${
                          header.id === 'drag'
                            ? 'px-1 w-8'
                            : header.id === 'expand'
                              ? 'px-4'
                              : header.id === 'select'
                                ? 'px-2 w-10'
                                : header.id === 'type'
                                  ? 'px-2 w-12'
                                  : header.id === 'link'
                                    ? 'px-1 w-8'
                                    : header.id === 'info'
                                      ? 'px-1 w-8'
                                    : header.id === 'integration'
                                      ? 'px-1 w-8'
                                    : header.id === 'status'
                                    ? 'px-4 w-24 text-center'
                                    : header.id === 'actions'
                                      ? 'px-4 w-32 text-center'
                                      : header.id === 'logicField'
                                        ? 'px-4 min-w-[180px]'
                                        : header.id === 'operator'
                                          ? 'px-4 min-w-[140px]'
                                          : header.id === 'valueType'
                                            ? 'px-4 min-w-[120px]'
                                            : header.id === 'value'
                                              ? 'px-4 min-w-[200px]'
                                              : 'px-4'
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : typeof header.column.columnDef.header === 'function'
                            ? header.column.columnDef.header(header.getContext())
                            : header.column.columnDef.header}
                      </th>
                    ))}
                  </tr>
                ))}
                <HorizontalScrollSlider colSpan={columns.length} />
              </thead>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <tbody className="bg-white divide-y divide-slate-100">
                  {rows.map((row) => (
                    <SortableRowWrapper
                      key={row.id}
                      row={row}
                      isDropTarget={overId === row.id && activeId !== row.id}
                      isChanged={changedIds?.has(row.id) ?? false}
                      dragListenersRef={dragListenersRef}
                      onMouseEnter={() => setHoveredRowId(row.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    />
                  ))}
                  {rules.conditions.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                          <Filter className="w-12 h-12 text-slate-200 mb-3" />
                          <p className="text-base font-medium text-slate-500">No rules defined</p>
                          <p className="text-sm mt-1">
                            Click "Add Condition" or "Add Group" to get started
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </SortableContext>
            </table>
            <DragOverlay dropAnimation={null}>
              {activeItem ? <DragOverlayRow item={activeItem} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
    </>
  );
}

/**
 * Wrapper that uses useSortable and registers listeners on the ref
 * so that the columns can pick them up.
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { flexRender, type Row } from '@tanstack/react-table';
import type { MutableRefObject, CSSProperties } from 'react';

function SortableRowWrapper({
  row,
  isDropTarget,
  isChanged,
  dragListenersRef,
  onMouseEnter,
  onMouseLeave,
}: {
  row: Row<RuleItem>;
  isDropTarget: boolean;
  isChanged: boolean;
  dragListenersRef: MutableRefObject<Record<string, SyntheticListenerMap | undefined>>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  // Register listeners so column cells can use them for the drag handle
  dragListenersRef.current[row.id] = listeners;

  const item = row.original;
  const itemIsContainer = item.type === 'group' || item.type === 'folder' || item.type === 'structural';
  const depth = row.depth;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        group transition-colors duration-150
        ${isDropTarget ? 'bg-accent-50 ring-2 ring-inset ring-accent-300' : item.type === 'group' ? 'bg-slate-50/80 hover:bg-slate-100/80' : item.type === 'folder' ? 'bg-indigo-50/30 hover:bg-indigo-50/60' : item.enabled ? 'hover:bg-slate-50/60' : ''}
        ${!item.enabled && !isDropTarget ? 'opacity-50' : ''}
        ${!itemIsContainer && depth > 0 && !isDropTarget ? 'bg-slate-50/30' : ''}
        ${isChanged && !isDropTarget ? 'border-l-[3px] border-l-amber-400 bg-amber-50/40' : ''}
        border-b border-b-slate-200
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={
            cell.column.id === 'status' || cell.column.id === 'actions'
              ? 'py-1.5 px-4 text-center'
              : cell.column.id === 'expand'
                ? 'py-1.5 px-4'
                : cell.column.id === 'select'
                  ? 'py-1.5 px-2 w-10'
                  : cell.column.id === 'type'
                    ? 'py-1.5 px-2 w-12'
                    : cell.column.id === 'link'
                      ? 'py-1.5 px-1 w-8'
                      : cell.column.id === 'info'
                      ? 'py-1.5 px-1 w-8'
                      : cell.column.id === 'integration'
                      ? 'py-1.5 px-1 w-8'
                      : cell.column.id === 'drag'
                      ? 'py-1.5 px-1 w-8'
                      : 'py-1.5 px-4'
          }
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}
