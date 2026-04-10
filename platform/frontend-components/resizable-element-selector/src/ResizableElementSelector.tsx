import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { ResizableElementSelectorProps, Position, Size } from './types';

const DEFAULT_POSITION: Position = { x: 100, y: 100 };
const DEFAULT_SIZE: Size = { width: 578, height: 180 };

const RESIZE_HANDLES = [
  { pos: 'top-left', style: { top: '-4px', left: '-4px' } as React.CSSProperties },
  { pos: 'top', style: { top: '-4px', left: '50%', transform: 'translateX(-50%)' } as React.CSSProperties },
  { pos: 'top-right', style: { top: '-4px', right: '-4px' } as React.CSSProperties },
  { pos: 'right', style: { right: '-4px', top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties },
  { pos: 'bottom-right', style: { bottom: '-4px', right: '-4px' } as React.CSSProperties },
  { pos: 'bottom', style: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' } as React.CSSProperties },
  { pos: 'bottom-left', style: { bottom: '-4px', left: '-4px' } as React.CSSProperties },
  { pos: 'left', style: { left: '-4px', top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties },
];

function getCursorForHandle(pos: string): string {
  if (pos.includes('top') && pos.includes('left')) return 'nw-resize';
  if (pos.includes('top') && pos.includes('right')) return 'ne-resize';
  if (pos.includes('bottom') && pos.includes('left')) return 'sw-resize';
  if (pos.includes('bottom') && pos.includes('right')) return 'se-resize';
  if (pos === 'top' || pos === 'bottom') return 'ns-resize';
  return 'ew-resize';
}

export function ResizableElementSelector({
  className,
  defaultPosition = DEFAULT_POSITION,
  defaultSize = DEFAULT_SIZE,
  minWidth = 200,
  minHeight = 100,
  actions = [],
  defaultVisible = true,
  accentColor = 'blue',
  showGrid = true,
  showSizeIndicator = true,
  showDebugPanel = false,
  onToolSelect,
  onPositionChange,
  onSizeChange,
  onVisibilityChange,
  onReset,
  showButtonLabel = 'Show Selector',
  closeIcon,
}: ResizableElementSelectorProps) {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [size, setSize] = useState<Size>(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [selectedTool, setSelectedTool] = useState('');

  const selectorRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialSizeRef = useRef({ width: 0, height: 0 });
  const initialMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [position]);

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    initialSizeRef.current = { ...size };
    initialMousePos.current = { x: e.clientX, y: e.clientY };
  }, [size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isResizing) {
      const newPos = {
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      };
      setPosition(newPos);
      onPositionChange?.(newPos);
    } else if (isResizing) {
      const deltaX = e.clientX - initialMousePos.current.x;
      const deltaY = e.clientY - initialMousePos.current.y;
      const init = initialSizeRef.current;
      const newSize = { ...init };

      switch (resizeHandle) {
        case 'top-left':
          newSize.width = Math.max(minWidth, init.width - deltaX);
          newSize.height = Math.max(minHeight, init.height - deltaY);
          setPosition(prev => ({
            x: prev.x + (init.width - newSize.width),
            y: prev.y + (init.height - newSize.height),
          }));
          break;
        case 'top-right':
          newSize.width = Math.max(minWidth, init.width + deltaX);
          newSize.height = Math.max(minHeight, init.height - deltaY);
          setPosition(prev => ({ ...prev, y: prev.y + (init.height - newSize.height) }));
          break;
        case 'bottom-left':
          newSize.width = Math.max(minWidth, init.width - deltaX);
          newSize.height = Math.max(minHeight, init.height + deltaY);
          setPosition(prev => ({ ...prev, x: prev.x + (init.width - newSize.width) }));
          break;
        case 'bottom-right':
          newSize.width = Math.max(minWidth, init.width + deltaX);
          newSize.height = Math.max(minHeight, init.height + deltaY);
          break;
        case 'top':
          newSize.height = Math.max(minHeight, init.height - deltaY);
          setPosition(prev => ({ ...prev, y: prev.y + (init.height - newSize.height) }));
          break;
        case 'bottom':
          newSize.height = Math.max(minHeight, init.height + deltaY);
          break;
        case 'left':
          newSize.width = Math.max(minWidth, init.width - deltaX);
          setPosition(prev => ({ ...prev, x: prev.x + (init.width - newSize.width) }));
          break;
        case 'right':
          newSize.width = Math.max(minWidth, init.width + deltaX);
          break;
      }

      setSize(newSize);
      onSizeChange?.(newSize);
    }
  }, [isDragging, isResizing, resizeHandle, minWidth, minHeight, onPositionChange, onSizeChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleToolClick = (toolId: string) => {
    const next = selectedTool === toolId ? '' : toolId;
    setSelectedTool(next);
    onToolSelect?.(next);
  };

  const resetSelector = () => {
    setPosition(defaultPosition);
    setSize(defaultSize);
    setSelectedTool('');
    onReset?.();
  };

  const toggleVisibility = (visible: boolean) => {
    setIsVisible(visible);
    onVisibilityChange?.(visible);
  };

  const accentBorder = `border-${accentColor}-500`;
  const accentBg = `bg-${accentColor}-500`;
  const accentBgHover = `hover:bg-${accentColor}-600`;
  const accentBgLight = `bg-${accentColor}-50`;
  const accentRing = `ring-${accentColor}-500`;
  const accentBgSelected = `bg-${accentColor}-100`;
  const accentStroke = accentColor === 'blue' ? '#3b82f6' : '#6366f1';

  const outerClassName = ['fixed z-[9999] select-none', className].filter(Boolean).join(' ');

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-[9999]">
        <button
          onClick={() => toggleVisibility(true)}
          className={[accentBg, accentBgHover, 'text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200'].join(' ')}
        >
          {showButtonLabel}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Overlay backdrop during drag/resize */}
      <div
        className="fixed inset-0 bg-black bg-opacity-10 pointer-events-none z-[9998]"
        style={{ display: isDragging || isResizing ? 'block' : 'none' }}
      />

      {/* Main selector */}
      <div
        ref={selectorRef}
        className={outerClassName}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Size indicator */}
        {showSizeIndicator && (
          <div className={[accentBg, 'absolute -top-8 left-0 text-white px-2 py-1 rounded text-xs font-mono'].join(' ')}>
            {size.width} &times; {size.height}
          </div>
        )}

        {/* Selection box */}
        <div className="relative w-full h-full">
          <div className={['absolute inset-0 border-2 rounded-sm', accentBorder, accentBgLight, 'bg-opacity-10'].join(' ')}>
            {showGrid && (
              <svg
                className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="res-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke={accentStroke} strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#res-grid)" />
              </svg>
            )}
          </div>

          {/* Resize handles */}
          {RESIZE_HANDLES.map(({ pos, style }) => (
            <div
              key={pos}
              className={[
                'resize-handle absolute w-3 h-3 border border-white rounded-full cursor-pointer transition-colors shadow-sm',
                accentBg,
                accentBgHover,
              ].join(' ')}
              style={{ ...style, cursor: getCursorForHandle(pos) }}
              onMouseDown={(e) => handleResizeStart(e, pos)}
            />
          ))}
        </div>

        {/* Toolbar */}
        {(actions.length > 0 || true) && (
          <div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {actions.map((action) => (
              <button
                key={action.id}
                className={[
                  'p-2 rounded-md transition-all duration-200 hover:bg-gray-100 relative group',
                  selectedTool === action.id ? [accentBgSelected, 'ring-2', accentRing].join(' ') : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleToolClick(action.id)}
              >
                <span className={['w-4 h-4 flex items-center justify-center', action.color].filter(Boolean).join(' ')}>
                  {action.icon}
                </span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {action.tooltip}
                </div>
              </button>
            ))}

            {actions.length > 0 && <div className="w-px h-6 bg-gray-300 mx-1" />}

            {/* Close button */}
            <button
              className="p-2 rounded-md transition-all duration-200 hover:bg-red-100 text-red-500 group relative"
              onClick={() => toggleVisibility(false)}
            >
              {closeIcon ?? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Close
              </div>
            </button>
          </div>
        )}

        {/* Reset button */}
        <button
          className="absolute -top-8 right-0 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
          onClick={resetSelector}
        >
          Reset
        </button>
      </div>

      {/* Debug info panel */}
      {showDebugPanel && (
        <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-[9999] text-xs font-mono">
          <div className="space-y-1">
            <div>Position: {position.x}, {position.y}</div>
            <div>Size: {size.width}&times;{size.height}</div>
            <div>Tool: {selectedTool || 'None'}</div>
            <div className="text-gray-500">
              {isDragging && 'Dragging...'}
              {isResizing && `Resizing (${resizeHandle})...`}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
