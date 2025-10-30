"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';
import { Button } from './button';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';

interface SplitPaneProps {
  list: ReactNode;
  detail: ReactNode;
  defaultDetailWidth?: number;
  minDetailWidth?: number;
  collapsible?: boolean;
  initiallyCollapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
  className?: string;
}

/**
 * Responsive split view for master/detail experiences.
 */
export function SplitPane({
  list,
  detail,
  defaultDetailWidth = 380,
  minDetailWidth = 280,
  collapsible = true,
  initiallyCollapsed = false,
  onCollapsedChange,
  className
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [detailWidth, setDetailWidth] = useState(defaultDetailWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);

  const toggleCollapsed = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  }, [collapsed, onCollapsedChange]);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!isDragging || collapsed) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const maxWidth = rect.width - 200;
      const newWidth = Math.min(Math.max(rect.right - event.clientX, minDetailWidth), maxWidth);
      event.preventDefault();
      setDetailWidth(newWidth);
    }

    function handleMouseUp() {
      if (isDragging) setIsDragging(false);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [collapsed, isDragging, minDetailWidth]);

  return (
    <div ref={containerRef} className={cn('flex h-full w-full flex-col gap-4', className)}>
      {collapsible ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="split-pane-detail"
          >
            {collapsed ? <PanelRightOpen className="h-4 w-4" aria-hidden /> : <PanelRightClose className="h-4 w-4" aria-hidden />} 
            {collapsed ? 'Show details' : 'Hide details'}
          </Button>
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 gap-4">
        <section className="flex-1 overflow-auto rounded-xl border border-border bg-panel p-4 shadow-sm" aria-label="Primary list">
          {list}
        </section>
        {!collapsed ? (
          <aside
            id="split-pane-detail"
            className="relative hidden h-full overflow-auto rounded-xl border border-border bg-panel shadow-sm lg:block"
            style={{ width: detailWidth }}
            aria-label="Detail"
          >
            <div
              className={cn(
                'absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent'
              )}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize detail panel"
              onMouseDown={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
            />
            <div className="h-full overflow-y-auto p-4">{detail}</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
