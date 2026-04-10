import { useRef, useState, useCallback, useEffect } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import {
  FormElement,
  LayoutItem,
  MetaComponent,
  MetaComponentLayoutItem,
  ContainerMetaComponent,
  ContainerChildElement,
  ContainerChildLayoutItem,
  BoundingRect,
} from '../types';
import { getComponentByType } from '../draggable-components';
import { getMetaComponentByType } from '../meta-components';
import FieldRenderer from './FieldRenderer';
import MetaComponentOverlay from './MetaComponentOverlay';
import NestedGridContainer from './NestedGridContainer';
import { Trash2, GripVertical, Lock, Unlock, Pencil } from 'lucide-react';

// Helper to check if a meta is a container type
function isContainerMeta(meta: MetaComponent): boolean {
  return meta.type === 'grouping' || meta.type === 'section';
}

// Helper to cast a meta to container type (use after isContainerMeta check)
function asContainerMeta(meta: MetaComponent): ContainerMetaComponent {
  return meta as unknown as ContainerMetaComponent;
}

const GridLayout = WidthProvider(RGL);

interface CanvasProps {
  elements: FormElement[];
  layout: LayoutItem[];
  selectedElementId: string | null;
  pageTitle: string;
  pageDescription?: string;
  cols: number;
  rowHeight: number;
  onLayoutChange: (layout: LayoutItem[]) => void;
  onAddElement: (element: FormElement, layoutItem: LayoutItem) => void;
  onSelectElement: (id: string | null) => void;
  onDeleteElement: (id: string) => void;
  onToggleElementLock: (id: string) => void;
  onUpdatePageTitle: (title: string) => void;
  onUpdatePageDescription: (description: string) => void;
  // Meta-component props
  metaComponents?: MetaComponent[];
  metaLayout?: MetaComponentLayoutItem[];
  selectedMetaId?: string | null;
  showMetaBoundaries?: boolean;
  pageId?: string;
  onSelectMeta?: (id: string | null) => void;
  onAddMetaComponent?: (meta: MetaComponent, layout: MetaComponentLayoutItem) => void;
  onDeleteMeta?: (id: string) => void;
  onMetaLayoutChange?: (layout: MetaComponentLayoutItem[]) => void;
  onToggleMetaLock?: (id: string) => void;
  // Container operations (for nested drop zones)
  onAddElementToContainer?: (
    containerId: string,
    element: ContainerChildElement,
    layout: ContainerChildLayoutItem
  ) => void;
  onUpdateContainerChildLayout?: (containerId: string, layout: ContainerChildLayoutItem[]) => void;
  onRemoveElementFromContainer?: (containerId: string, elementId: string) => void;
  // Element bounds callback
  onUpdateElementBounds?: (
    elementId: string,
    pageId: string,
    rootRect: BoundingRect,
    relativeRect: BoundingRect | null,
    parentContainerIds: string[]
  ) => void;
}

const Canvas = ({
  elements,
  layout,
  selectedElementId,
  pageTitle,
  pageDescription,
  cols,
  rowHeight,
  onLayoutChange,
  onAddElement,
  onSelectElement,
  onDeleteElement,
  onToggleElementLock,
  onUpdatePageTitle,
  onUpdatePageDescription,
  // Meta props
  metaComponents = [],
  metaLayout = [],
  selectedMetaId = null,
  showMetaBoundaries = true,
  pageId = '',
  onSelectMeta,
  onAddMetaComponent,
  onDeleteMeta,
  onMetaLayoutChange,
  onToggleMetaLock,
  // Container operations
  onAddElementToContainer,
  onUpdateContainerChildLayout,
  onRemoveElementFromContainer,
  // Element bounds
  onUpdateElementBounds,
}: CanvasProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Capture element bounds after layout changes
  // Using DOM query instead of refs because react-grid-layout clones children
  useEffect(() => {
    if (!onUpdateElementBounds || !pageId || !gridRef.current) return;

    // Get canvas grid element for root-relative calculations
    const canvasGrid = gridRef.current.querySelector('.canvas-grid');
    const canvasRect = canvasGrid?.getBoundingClientRect();

    // Use requestAnimationFrame to ensure DOM has updated after layout change
    const rafId = requestAnimationFrame(() => {
      // Query all elements with data-element-id attribute (root elements)
      const elementNodes = gridRef.current?.querySelectorAll('[data-element-id]');
      elementNodes?.forEach((node) => {
        const elementId = node.getAttribute('data-element-id');
        const parentContainerId = node.getAttribute('data-parent-container-id');
        if (elementId) {
          const rect = node.getBoundingClientRect();

          // Root bounds (relative to canvas/drop zone)
          const rootRect: BoundingRect = {
            top: canvasRect ? rect.top - canvasRect.top : rect.top,
            right: canvasRect ? rect.right - canvasRect.left : rect.right,
            bottom: canvasRect ? rect.bottom - canvasRect.top : rect.bottom,
            left: canvasRect ? rect.left - canvasRect.left : rect.left,
            width: rect.width,
            height: rect.height,
            x: canvasRect ? rect.x - canvasRect.x : rect.x,
            y: canvasRect ? rect.y - canvasRect.y : rect.y,
          };

          // Calculate relative bounds if element has a parent container
          let relativeRect: BoundingRect | null = null;
          if (parentContainerId) {
            const parentNode = gridRef.current?.querySelector(`[data-container-id="${parentContainerId}"]`);
            if (parentNode) {
              const parentRect = parentNode.getBoundingClientRect();
              relativeRect = {
                top: rect.top - parentRect.top,
                right: rect.right - parentRect.left,
                bottom: rect.bottom - parentRect.top,
                left: rect.left - parentRect.left,
                width: rect.width,
                height: rect.height,
                x: rect.x - parentRect.x,
                y: rect.y - parentRect.y,
              };
            }
          }

          onUpdateElementBounds(elementId, pageId, rootRect, relativeRect, parentContainerId ? [parentContainerId] : []);
        }
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [layout, elements, metaComponents, pageId, onUpdateElementBounds]);

  const handleExternalDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const dragData = e.dataTransfer?.getData('text/plain');
      if (!dragData) return;

      try {
        const parsed = JSON.parse(dragData);
        const { type: dragType, isMeta } = parsed;

        const gridElement = gridRef.current;
        if (!gridElement) return;

        const rect = gridElement.getBoundingClientRect();
        const colWidth = rect.width / cols;

        const x = Math.floor((e.clientX - rect.left) / colWidth);
        const y = Math.floor((e.clientY - rect.top) / rowHeight);

        if (isMeta) {
          // Handle meta-component drop
          const metaConfig = getMetaComponentByType(dragType);
          if (!metaConfig || !onAddMetaComponent) return;

          const { layout: metaLayoutConfig, metaType, defaultProps } = metaConfig;
          const dropW = Math.max(metaLayoutConfig.minW, Math.min(metaLayoutConfig.defaultW, cols - x));
          const dropH = Math.max(metaLayoutConfig.minH, metaLayoutConfig.defaultH);

          const newMeta: MetaComponent = {
            id: `meta-${Date.now()}`,
            type: metaType,
            name: defaultProps.name || 'Untitled',
            pageId,
            ...defaultProps,
            // For grouping, set bounds
            ...(metaType === 'grouping' ? {
              bounds: { x, y, w: dropW, h: dropH },
            } : {}),
          } as MetaComponent;

          const newMetaLayout: MetaComponentLayoutItem = {
            id: newMeta.id,
            x: Math.max(0, Math.min(x, cols - dropW)),
            y: Math.max(0, y),
            w: dropW,
            h: dropH,
          };

          onAddMetaComponent(newMeta, newMetaLayout);
        } else {
          // Handle regular element drop
          const componentConfig = getComponentByType(dragType);
          if (!componentConfig) return;

          // Use minimum width as the drop size - user can resize as needed
          const { layout: layoutConfig, fieldType, defaultProps } = componentConfig;
          const scaledMinW = Math.max(1, Math.round((layoutConfig.minW / 12) * cols));
          const dropW = scaledMinW;
          const dropH = layoutConfig.minH;

          const newElement: FormElement = {
            id: `field-${Date.now()}`,
            type: fieldType,
            ...defaultProps,
          };

          const newLayoutItem: LayoutItem = {
            i: newElement.id,
            x: Math.max(0, Math.min(x, cols - dropW)),
            y: Math.max(0, y),
            w: dropW,
            h: dropH,
            minH: layoutConfig.minH,
            minW: scaledMinW,
          };

          onAddElement(newElement, newLayoutItem);
        }
      } catch (err) {
        console.error('Failed to parse drag data:', err);
      }
    },
    [onAddElement, onAddMetaComponent, cols, rowHeight, pageId]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleLayoutChange = useCallback((newLayout: RGL.Layout[]) => {
    const updatedLayout: LayoutItem[] = newLayout.map((item) => {
      const existing = layout.find((l) => l.i === item.i);
      return {
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minH: existing?.minH ?? item.minH ?? 4,
        minW: existing?.minW ?? item.minW ?? 1,
      };
    });
    onLayoutChange(updatedLayout);
  }, [onLayoutChange, layout]);

  const getElement = (id: string): FormElement | undefined => {
    return elements.find((el) => el.id === id);
  };

  const handleCanvasClick = useCallback(() => {
    onSelectElement(null);
    onSelectMeta?.(null);
  }, [onSelectElement, onSelectMeta]);

  return (
    <div
      ref={gridRef}
      className={`flex-1 canvas-drop-zone ${isDragOver ? 'drag-over' : ''}`}
      onDrop={handleExternalDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleCanvasClick}
    >
      {/* Header bar */}
      <div className="canvas-header">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => onUpdatePageTitle(e.target.value)}
              className="text-xl font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 -ml-2"
              placeholder="Page Title"
              onClick={(e) => e.stopPropagation()}
            />
            <input
              type="text"
              value={pageDescription || ''}
              onChange={(e) => onUpdatePageDescription(e.target.value)}
              className="text-sm text-gray-500 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 -ml-2 w-full"
              placeholder="Add description..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      {/* Grid area */}
      <div
        className="canvas-grid"
        style={{
          backgroundSize: `calc(100% / ${cols}) ${rowHeight}px`,
          position: 'relative',
        }}
        ref={(el) => {
          if (el && el.offsetWidth !== containerWidth) {
            setContainerWidth(el.offsetWidth);
          }
        }}
      >
        {/* Meta-component overlay - rendered behind grid items unless active */}
        {/* Only show non-container meta-components (conditional, validation) */}
        {showMetaBoundaries && (
          <MetaComponentOverlay
            metaComponents={metaComponents.filter((m) => !isContainerMeta(m))}
            metaLayout={metaLayout.filter((l) => {
              const meta = metaComponents.find((m) => m.id === l.id);
              return meta && !isContainerMeta(meta);
            })}
            elementLayouts={layout}
            selectedMetaId={selectedMetaId}
            isActive={selectedMetaId !== null}
            onSelectMeta={onSelectMeta || (() => {})}
            onDeleteMeta={onDeleteMeta || (() => {})}
            onMetaLayoutChange={onMetaLayoutChange || (() => {})}
            onToggleMetaLock={onToggleMetaLock || (() => {})}
            cols={cols}
            rowHeight={rowHeight}
          />
        )}

        <GridLayout
          className="layout"
          layout={[
            ...layout,
            // Add container meta-components to the layout
            ...metaLayout
              .filter((l) => {
                const meta = metaComponents.find((m) => m.id === l.id);
                return meta && isContainerMeta(meta);
              })
              .map((l) => ({
                i: l.id,
                x: l.x,
                y: l.y,
                w: l.w,
                h: l.h,
                minW: 2,
                minH: 2,
                static: l.static,
              })),
          ]}
          cols={cols}
          rowHeight={rowHeight}
          onLayoutChange={(newLayout) => {
            // Separate element layout changes from meta layout changes
            const elementLayout = newLayout.filter((item) =>
              layout.some((l) => l.i === item.i)
            );
            const containerMetaLayout = newLayout.filter((item) =>
              metaLayout.some((l) => l.id === item.i)
            );

            // Update element layout
            handleLayoutChange(elementLayout as RGL.Layout[]);

            // Update container meta layout
            if (containerMetaLayout.length > 0 && onMetaLayoutChange) {
              const currentNonContainerLayout = metaLayout.filter((l) => {
                const meta = metaComponents.find((m) => m.id === l.id);
                return meta && !isContainerMeta(meta);
              });
              const updatedContainerLayout = containerMetaLayout.map((item) => {
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
              onMetaLayoutChange([...currentNonContainerLayout, ...updatedContainerLayout]);
            }
          }}
          draggableHandle=".drag-handle,.nested-drag-handle"
          compactType="vertical"
          preventCollision={false}
          useCSSTransforms={true}
          margin={[12, 12]}
        >
          {/* Regular form elements */}
          {layout.map((item) => {
            const element = getElement(item.i);
            if (!element) return null;

            const isSelected = selectedElementId === element.id;

            const isLocked = element.locked;

            return (
              <div
                key={item.i}
                data-element-id={element.id}
                className={`grid-item ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(element.id);
                }}
              >
                <div className={`drag-handle ${isLocked ? 'locked' : ''}`}>
                  {!isLocked && <GripVertical className="w-4 h-4" />}
                  <span>{element.type}</span>
                  <button
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onToggleElementLock(element.id);
                    }}
                    className="lock-btn"
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
                      onSelectElement(element.id);
                    }}
                    className="edit-btn"
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
                      onDeleteElement(element.id);
                    }}
                    className="delete-btn"
                    type="button"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid-item-content">
                  <FieldRenderer
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelectElement(element.id)}
                  />
                </div>
              </div>
            );
          })}

          {/* Container meta-components with nested grids */}
          {metaLayout
            .filter((layoutItem) => {
              const meta = metaComponents.find((m) => m.id === layoutItem.id);
              return meta && isContainerMeta(meta);
            })
            .map((layoutItem) => {
              const meta = metaComponents.find((m) => m.id === layoutItem.id);
              if (!meta || !isContainerMeta(meta)) return null;

              const containerMeta = asContainerMeta(meta);
              const isMetaSelected = selectedMetaId === meta.id;

              return (
                <div key={layoutItem.id}>
                  <NestedGridContainer
                    meta={containerMeta}
                    metaLayout={layoutItem}
                    isSelected={isMetaSelected}
                    selectedElementId={selectedElementId}
                    onSelectMeta={onSelectMeta || (() => {})}
                    onSelectElement={onSelectElement}
                    onDeleteMeta={onDeleteMeta || (() => {})}
                    onToggleMetaLock={onToggleMetaLock || (() => {})}
                    onAddChildElement={onAddElementToContainer || (() => {})}
                    onUpdateChildLayout={onUpdateContainerChildLayout || (() => {})}
                    onRemoveChildElement={onRemoveElementFromContainer || (() => {})}
                  />
                </div>
              );
            })}
        </GridLayout>

      </div>
    </div>
  );
};

export default Canvas;
