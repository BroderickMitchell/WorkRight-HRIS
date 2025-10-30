"use client";

import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle } from '@workright/ui';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { ProfileSectionKey, useProfileEditingStore } from './use-profile-editing';
import clsx from 'clsx';

interface ProfileCardProps {
  title: string;
  section: ProfileSectionKey;
  description?: string;
  children: ReactNode | ((helpers: { isEditing: boolean; markDirty: (dirty: boolean) => void; stopEditing: () => void }) => ReactNode);
  actions?: ReactNode;
  canEdit: boolean;
}

export function ProfileCard({ title, section, description, children, actions, canEdit }: ProfileCardProps) {
  const { activeSection, startEditing, stopEditing, markDirty } = useProfileEditingStore((state) => ({
    activeSection: state.activeSection,
    startEditing: state.startEditing,
    stopEditing: state.stopEditing,
    markDirty: state.markDirty
  }));
  const isEditing = activeSection === section;

  return (
    <Card className={clsx('overflow-hidden border border-slate-200 shadow-sm transition', isEditing && 'ring-2 ring-brand/60')}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {canEdit ? (
            <button
              type="button"
              onClick={() => (isEditing ? stopEditing(section) : startEditing(section))}
              className={clsx(
                'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                isEditing && 'border-brand bg-brand/10 text-brand'
              )}
              aria-label={isEditing ? `Stop editing ${title}` : `Edit ${title}`}
            >
              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </CardHeader>
      <div className="space-y-4 px-6 pb-6 pt-2 text-sm text-slate-700" data-section={section}>
        {typeof children === 'function'
          ? (children as (helpers: { isEditing: boolean; markDirty: (dirty: boolean) => void; stopEditing: () => void }) => ReactNode)({
              isEditing,
              markDirty: (dirty: boolean) => markDirty(section, dirty),
              stopEditing: () => stopEditing(section)
            })
          : children}
      </div>
    </Card>
  );
}
