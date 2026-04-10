import { useCallback, useRef, useState } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import { Trash2, GripVertical, Lock, Unlock, Pencil } from 'lucide-react';
import {
  ContainerMetaComponent,
  ContainerChildElement,
  ContainerChildLayoutItem,
  MetaComponentLayoutItem,
} from '../types';
import { getComponentByType } from '../draggable-components';
import FieldRenderer from './FieldRenderer';

const GridLayout = WidthProvider(RGL);

interface NestedGridContainerProps {
  meta: ContainerMetaComponent;
  metaLayout: MetaComponentLayoutItem; // Used for positioning in parent grid
  isSelected: boolean;
  selectedElementId: string | null;
  onSelectMeta: (id: string) => void;
  onSelectElement: (id: string | null) => void;
  onDeleteMeta: (id: string) => void;
  onToggleMetaLock: (id: string) => void;
  // Nested operations
  onAddChildElement: (
    metaId: string,
    element: ContainerChildElement,
    layout: ContainerChildLayoutItem
  ) => void;
  onUpdateChildLayout: (metaId: string, layout: ContainerChildLayoutItem[]) => void;
  onRemoveChildElement: (metaId: string, elementId: string) => void;
}

const NestedGridContainer = ({
  meta,
  metaLayout: _metaLayout, // Prefixed with _ to indicate intentionally unused
  isSelected,
  selectedElementId,
  onSelectMeta,
  onSelectElement,
  onDeleteMeta,
  onToggleMetaLock,
  onAddChildElement,
  onUpdateChildLayout,
  onRemoveChildElement,
}: NestedGridContainerProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { nestedGridConfig, childElements, childLayout } = meta;
  const { cols, rowHeight, margin } = nestedGridConfig;
  const isLocked = meta.locked;

  // Convert child layout to RGL format
  const rglLayout = childLayout.map((item) => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
    static: item.static,
  }));

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const dragData = e.dataTransfer?.getData('text/plain');
      if (!dragData) return;

      try {
        const parsed = JSON.parse(dragData);
        const { type: dragType, isMeta } = parsed;

        // Don't allow meta-components to be dropped inside containers
        if (isMeta) {
          console.warn('Cannot drop meta-components inside containers');
          return;
        }

        const componentConfig = getComponentByType(dragType);
        if (!componentConfig) return;

        const gridElement = gridRef.current;
        if (!gridElement) return;

        const rect = gridElement.getBoundingClientRect();
        const colWidth = rect.width / cols;

        const x = Math.floor((e.clientX - rect.left - margin[0]) / colWidth);
        const y = Math.floor((e.clientY - rect.top - margin[1]) / rowHeight);

        const { layout: layoutConfig, fieldType, defaultProps } = componentConfig;
        const scaledMinW = Math.max(1, Math.round((layoutConfig.minW / 12) * cols));
        const dropW = scaledMinW;
        const dropH = layoutConfig.minH;

        const newElement: ContainerChildElement = {
          ...defaultProps,
          id: `nested-${Date.now()}`,
          type: fieldType,
          label: defaultProps.label || 'Untitled',
        };

        const newLayoutItem: ContainerChildLayoutItem = {
          i: newElement.id,
          x: Math.max(0, Math.min(x, cols - dropW)),
          y: Math.max(0, y),
          w: dropW,
          h: dropH,
          minH: layoutConfig.minH,
          minW: scaledMinW,
        };

        onAddChildElement(meta.id, newElement, newLayoutItem);
      } catch (err) {
        console.error('Failed to parse drag data:', err);
      }
    },
    [meta.id, cols, rowHeight, margin, onAddChildElement]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is a meta-component being dragged
    try {
      const dragData = e.dataTransfer?.types.includes('text/plain');
      if (dragData) {
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);
      }
    } catch {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleLayoutChange = useCallback(
    (newLayout: RGL.Layout[]) => {
      const updatedLayout: ContainerChildLayoutItem[] = newLayout.map((item) => {
        const existing = childLayout.find((l) => l.i === item.i);
        return {
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          minH: existing?.minH ?? item.minH ?? 4,
          minW: existing?.minW ?? item.minW ?? 1,
          static: existing?.static,
        };
      });
      onUpdateChildLayout(meta.id, updatedLayout);
    },
    [meta.id, childLayout, onUpdateChildLayout]
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectMeta(meta.id);
    },
    [meta.id, onSelectMeta]
  );

  const getElement = (id: string): ContainerChildElement | undefined => {
    return childElements.find((el) => el.id === id);
  };

  // Get the display name based on meta type
  const displayName = meta.type === 'grouping'
    ? (meta as { label?: string }).label || meta.name
    : (meta as { title?: string }).title || meta.name;

  // Determine the meta-type class for styling
  const metaTypeClass = `meta-${meta.type}`;

  return (
    <div
      ref={gridRef}
      data-container-id={meta.id}
      className={`nested-grid-container ${metaTypeClass} ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} ${isDragOver ? 'drag-over' : ''}`}
      onClick={handleContainerClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Floating label */}
      <div className={`nested-drag-handle ${isLocked ? 'locked' : ''}`}>
        {!isLocked && <GripVertical className="w-3 h-3" />}
        <span>{displayName}</span>
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSelectMeta(meta.id);
          }}
          className="nested-edit-btn"
          type="button"
          title="Edit"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleMetaLock(meta.id);
          }}
          className="nested-lock-btn"
          type="button"
          title={isLocked ? 'Unlock' : 'Lock'}
        >
          {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDeleteMeta(meta.id);
          }}
          className="nested-delete-btn"
          type="button"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Nested grid with child elements */}
      <div
        className="nested-grid-area"
        style={{
          backgroundSize: `calc(100% / ${cols}) ${rowHeight}px`,
        }}
      >
        {childElements.length > 0 ? (
          <GridLayout
            className="nested-layout"
            layout={rglLayout}
            cols={cols}
            rowHeight={rowHeight}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".nested-child-handle"
            compactType="vertical"
            preventCollision={false}
            useCSSTransforms={true}
            margin={margin}
          >
            {childLayout.map((item) => {
              const element = getElement(item.i);
              if (!element) return null;

              const isChildSelected = selectedElementId === element.id;
              const isChildLocked = item.static;

              return (
                <div
                  key={item.i}
                  data-element-id={element.id}
                  data-parent-container-id={meta.id}
                  className={`nested-grid-item ${isChildSelected ? 'selected' : ''} ${isChildLocked ? 'locked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectElement(element.id);
                  }}
                >
                  <div className={`nested-child-handle ${isChildLocked ? 'locked' : ''}`}>
                    {!isChildLocked && <GripVertical className="w-3 h-3" />}
                    <span>{element.type}</span>
                    <button
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onSelectElement(element.id);
                      }}
                      className="nested-child-edit"
                      type="button"
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onRemoveChildElement(meta.id, element.id);
                      }}
                      className="nested-child-delete"
                      type="button"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="nested-grid-item-content">
                    <FieldRenderer
                      element={element}
                      isSelected={isChildSelected}
                      onSelect={() => onSelectElement(element.id)}
                    />
                  </div>
                </div>
              );
            })}
          </GridLayout>
        ) : (
          <div className="nested-empty-state">
            <p className="text-xs text-gray-400">Drop elements here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NestedGridContainer;
