'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { cn } from '../utils/cn';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  position?: 'right' | 'left';
  className?: string;
}

export function Drawer({ open, onClose, title, description, children, footer, position = 'right', className }: DrawerProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className={cn('flex h-full', position === 'right' ? 'justify-end' : 'justify-start')}>
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom={position === 'right' ? 'translate-x-full' : '-translate-x-full'}
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo={position === 'right' ? 'translate-x-full' : '-translate-x-full'}
            >
              <Dialog.Panel
                className={cn(
                  'flex h-full w-full max-w-lg flex-col border-border bg-panel shadow-2xl focus:outline-none',
                  position === 'right' ? 'border-l' : 'border-r',
                  className
                )}
              >
                <div className="border-b border-border px-6 py-4">
                  <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
                  {description ? (
                    <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
                  ) : null}
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
                {footer ? <div className="border-t border-border bg-panel px-6 py-4">{footer}</div> : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
