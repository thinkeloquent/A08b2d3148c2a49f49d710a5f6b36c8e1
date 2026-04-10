import { useState, useCallback, useRef, useEffect, ReactNode } from 'react';

interface ResizableSidebarProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export default function ResizableSidebar({
  children,
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 500,
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const newWidth = sidebarRect.right - e.clientX;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    },
    [isResizing, minWidth, maxWidth]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div
      ref={sidebarRef}
      className={`resizable-sidebar ${isResizing ? 'resizing' : ''}`}
      style={{ width }}
    >
      <div
        className="resize-handle"
        onMouseDown={startResizing}
      />
      <div className="sidebar-content">
        {children}
      </div>
    </div>
  );
}
