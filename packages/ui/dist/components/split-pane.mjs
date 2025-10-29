import { jsxs, jsx } from 'react/jsx-runtime';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '../utils/cn.mjs';
import { Button } from './button.mjs';

export function SplitPane({
  list,
  detail,
  defaultDetailWidth = 380,
  minDetailWidth = 280,
  collapsible = true,
  initiallyCollapsed = false,
  onCollapsedChange,
  className
}) {
  const containerRef = useRef(null);
  const [detailWidth, setDetailWidth] = useState(defaultDetailWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);

  const toggleCollapsed = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    if (onCollapsedChange) {
      onCollapsedChange(next);
    }
  }, [collapsed, onCollapsedChange]);

  useEffect(() => {
    function handleMouseMove(event) {
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

  return jsxs('div', {
    ref: containerRef,
    className: cn('flex h-full w-full flex-col gap-4', className),
    children: [
      collapsible
        ? jsx('div', {
            className: 'flex justify-end',
            children: jsxs(Button, {
              type: 'button',
              variant: 'ghost',
              size: 'sm',
              className: 'gap-2',
              onClick: toggleCollapsed,
              'aria-expanded': !collapsed,
              'aria-controls': 'split-pane-detail',
              children: [
                collapsed
                  ? jsx(PanelRightOpen, { className: 'h-4 w-4', 'aria-hidden': true })
                  : jsx(PanelRightClose, { className: 'h-4 w-4', 'aria-hidden': true }),
                collapsed ? 'Show details' : 'Hide details'
              ]
            })
          })
        : null,
      jsxs('div', {
        className: 'flex min-h-0 flex-1 gap-4',
        children: [
          jsx('section', {
            className: 'flex-1 overflow-auto rounded-xl border border-border bg-panel p-4 shadow-sm',
            'aria-label': 'Primary list',
            children: list
          }),
          !collapsed
            ? jsxs('aside', {
                id: 'split-pane-detail',
                className: 'relative hidden h-full overflow-auto rounded-xl border border-border bg-panel shadow-sm lg:block',
                style: { width: detailWidth },
                'aria-label': 'Detail',
                children: [
                  jsx('div', {
                    className: cn('absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent'),
                    role: 'separator',
                    'aria-orientation': 'vertical',
                    'aria-label': 'Resize detail panel',
                    onMouseDown: (event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }
                  }),
                  jsx('div', {
                    className: 'h-full overflow-y-auto p-4',
                    children: detail
                  })
                ]
              })
            : null
        ]
      })
    ]
  });
}
