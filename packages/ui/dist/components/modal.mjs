'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { cn } from '../utils/cn.mjs';

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl'
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md', className }) {
  return jsx(Transition, {
    show: open,
    as: Fragment,
    children: jsx(Dialog, {
      as: 'div',
      className: 'relative z-50',
      onClose,
      children: jsxs(Fragment, {
        children: [
          jsx(Transition.Child, {
            as: Fragment,
            enter: 'ease-out duration-200',
            enterFrom: 'opacity-0',
            enterTo: 'opacity-100',
            leave: 'ease-in duration-150',
            leaveFrom: 'opacity-100',
            leaveTo: 'opacity-0',
            children: jsx('div', { className: 'fixed inset-0 bg-black/40', 'aria-hidden': 'true' })
          }),
          jsx('div', {
            className: 'fixed inset-0 overflow-y-auto',
            children: jsx('div', {
              className: 'flex min-h-full items-center justify-center p-4',
              children: jsx(Transition.Child, {
                as: Fragment,
                enter: 'ease-out duration-200',
                enterFrom: 'opacity-0 translate-y-6',
                enterTo: 'opacity-100 translate-y-0',
                leave: 'ease-in duration-150',
                leaveFrom: 'opacity-100 translate-y-0',
                leaveTo: 'opacity-0 translate-y-6',
                children: jsxs(Dialog.Panel, {
                  className: cn(
                    'w-full rounded-2xl border border-border bg-panel p-6 shadow-2xl focus:outline-none',
                    sizeMap[size],
                    className
                  ),
                  children: [
                    jsx(Dialog.Title, { className: 'text-lg font-semibold text-foreground', children: title }),
                    description
                      ? jsx(Dialog.Description, {
                          className: 'mt-1 text-sm text-muted-foreground',
                          children: description
                        })
                      : null,
                    jsx('div', { className: 'mt-4 space-y-4', children }),
                    footer ? jsx('div', { className: 'mt-6 flex items-center justify-end gap-3', children: footer }) : null
                  ]
                })
              })
            })
          })
        ]
      })
    })
  });
}
