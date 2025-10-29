'use client';

const { Dialog, Transition } = require('@headlessui/react');
const { Fragment } = require('react');
const { jsx, jsxs } = require('react/jsx-runtime');
const { cn } = require('../utils/cn');

function Drawer({ open, onClose, title, description, children, footer, position = 'right', className }) {
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
            className: 'fixed inset-0 overflow-hidden',
            children: jsx('div', {
              className: cn('flex h-full', position === 'right' ? 'justify-end' : 'justify-start'),
              children: jsx(Transition.Child, {
                as: Fragment,
                enter: 'transform transition ease-out duration-300',
                enterFrom: position === 'right' ? 'translate-x-full' : '-translate-x-full',
                enterTo: 'translate-x-0',
                leave: 'transform transition ease-in duration-200',
                leaveFrom: 'translate-x-0',
                leaveTo: position === 'right' ? 'translate-x-full' : '-translate-x-full',
                children: jsxs(Dialog.Panel, {
                  className: cn(
                    'flex h-full w-full max-w-lg flex-col border-border bg-panel shadow-2xl focus:outline-none',
                    position === 'right' ? 'border-l' : 'border-r',
                    className
                  ),
                  children: [
                    jsxs('div', {
                      className: 'border-b border-border px-6 py-4',
                      children: [
                        jsx(Dialog.Title, { className: 'text-base font-semibold text-foreground', children: title }),
                        description
                          ? jsx(Dialog.Description, {
                              className: 'mt-1 text-sm text-muted-foreground',
                              children: description
                            })
                          : null
                      ]
                    }),
                    jsx('div', { className: 'flex-1 overflow-y-auto px-6 py-4', children }),
                    footer ? jsx('div', { className: 'border-t border-border bg-panel px-6 py-4', children: footer }) : null
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

module.exports = { Drawer };
