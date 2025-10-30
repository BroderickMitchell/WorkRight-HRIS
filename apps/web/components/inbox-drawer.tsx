"use client";

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useMemo, useState } from 'react';
import { CheckCircle2, Clock, X } from 'lucide-react';
import { sampleWorkflows, sampleTasks } from '../lib/sample-data';
import { Button, Card, CardDescription, CardHeader, CardTitle, cn } from '@workright/ui';

export interface InboxItem {
  id: string;
  title: string;
  context: string;
  dueDate?: string;
}

interface InboxDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function InboxDrawer({ open, onClose }: InboxDrawerProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const items = useMemo<InboxItem[]>(() => {
    const workflowTasks = sampleWorkflows.map((wf) => ({
      id: `wf-${wf.id}`,
      title: wf.title,
      context: `Current step: ${wf.currentStep}`,
      dueDate: wf.submitted
    }));
    return [...sampleTasks, ...workflowTasks];
  }, []);

  const toggleSelected = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const reset = () => setSelected([]);

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
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-y-0 right-0 flex max-w-full">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="flex h-full w-screen max-w-lg flex-col border-l border-border bg-panel shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <Dialog.Title className="text-base font-semibold text-foreground">Approvals & Inbox</Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close inbox"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                {items.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        'border border-border transition hover:border-primary/40',
                        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                      )}
                      role="group"
                    >
                      <CardHeader className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-sm">{item.title}</CardTitle>
                          <CardDescription className="text-xs">{item.context}</CardDescription>
                        </div>
                        <label className="flex items-center gap-1 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelected(item.id)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                            aria-label={`Select ${item.title}`}
                          />
                          Select
                        </label>
                      </CardHeader>
                      {item.dueDate ? (
                        <div className="flex items-center gap-2 px-6 pb-4 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          Submitted {item.dueDate}
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 border-t border-border bg-panel px-6 py-3">
                        <Button size="sm" variant="primary" className="gap-2">
                          <CheckCircle2 className="h-4 w-4" aria-hidden /> Approve
                        </Button>
                        <Button size="sm" variant="ghost">
                          Decline
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
                ) : null}
              </div>
              <div className="border-t border-border bg-panel px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{selected.length} selected</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={reset} disabled={selected.length === 0}>
                      Clear
                    </Button>
                    <Button size="sm" variant="primary" disabled={selected.length === 0}>
                      Bulk approve
                    </Button>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
