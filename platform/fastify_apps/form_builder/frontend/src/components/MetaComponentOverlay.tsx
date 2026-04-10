import { useCallback } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import { MetaComponent, MetaComponentLayoutItem, LayoutItem } from '../types';
import { GripVertical, Trash2, Lock, Unlock, Pencil } from 'lucide-react';

const GridLayout = WidthProvider(RGL);

interface MetaComponentOverlayProps {
  metaComponents: MetaComponent[];
  metaLayout: MetaComponentLayoutItem[];
  elementLayouts: LayoutItem[];
  selectedMetaId: string | null;
  isActive: boolean;
  onSelectMeta: (id: string | null) => void;
  onDeleteMeta: (id: string) => void;
  onMetaLayoutChange: (layout: MetaComponentLayoutItem[]) => void;
  onToggleMetaLock: (id: string) => void;
  cols: number;
  rowHeight: number;
}

const MetaComponentOverlay = ({
  metaComponents,
  metaLayout,
  elementLayouts: _elementLayouts,
  selectedMetaId,
  isActive,
  onSelectMeta,
  onDeleteMeta,
  onMetaLayoutChange,
  onToggleMetaLock,
  cols,
  rowHeight,
}: MetaComponentOverlayProps) => {
  // Convert MetaComponentLayoutItem to RGL layout format
  const rglLayout = metaLayout.map((item) => ({
    i: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: 2,
    minH: 2,
    static: item.static,
  }));

  const handleLayoutChange = useCallback(
    (newLayout: RGL.Layout[]) => {
      const updatedLayout: MetaComponentLayoutItem[] = newLayout.map((item) => {
        const existing = metaLayout.find((l) => l.id === item.i);
        return {
          id: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          static: existing?.static,
        };
      });
      onMetaLayoutChange(updatedLayout);
    },
    [onMetaLayoutChange, metaLayout]
  );

  if (metaComponents.length === 0) return null;

  return (
    <div className={`meta-component-overlay ${isActive ? 'active' : ''}`}>
      <GridLayout
        className="meta-layout"
        layout={rglLayout}
        cols={cols}
        rowHeight={rowHeight}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".meta-drag-handle"
        compactType={null}
        preventCollision={false}
        useCSSTransforms={true}
        margin={[12, 12]}
        isResizable={true}
        isDraggable={true}
      >
        {metaLayout.map((layoutItem) => {
          const meta = metaComponents.find((m) => m.id === layoutItem.id);
          if (!meta) return null;

          const isSelected = selectedMetaId === meta.id;
          const isLocked = meta.locked;

          // Check visibility for grouping type
          if (meta.type === 'grouping' && !(meta as any).visible) {
            return null;
          }

          return (
            <div
              key={layoutItem.id}
              className={`meta-grid-item ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} meta-${meta.type}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectMeta(meta.id);
              }}
            >
              <div className={`meta-drag-handle ${isLocked ? 'locked' : ''}`}>
                {!isLocked && <GripVertical className="w-4 h-4" />}
                <span>{meta.name}</span>
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
                  className="meta-edit-btn"
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
                  className="meta-lock-btn"
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
                  className="meta-delete-btn"
                  type="button"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
};

export default MetaComponentOverlay;
