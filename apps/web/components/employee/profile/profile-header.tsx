'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon, DocumentArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import { EmployeeProfilePayload } from '@workright/profile-schema';
import clsx from 'clsx';

interface ProfileHeaderProps {
  employee: EmployeeProfilePayload['employee'];
  onGenerateDocument: () => void;
  onExportPdf: () => void;
  onViewHistory: () => void;
}

export function ProfileHeader({ employee, onGenerateDocument, onExportPdf, onViewHistory }: ProfileHeaderProps) {
  return (
    <header className="rounded-xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-lg font-semibold text-brand" aria-hidden>
            {initials(employee.legalName.full)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{employee.legalName.preferred ?? employee.legalName.full}</h1>
              {employee.legalName.preferred ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600" aria-label="Legal name">
                  {employee.legalName.full}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-slate-600">{employee.jobTitle}</p>
            <p className="text-sm text-slate-500">
              {employee.department ? `${employee.department} • ` : ''}
              {employee.location ?? 'Location pending'}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
              <span><span className="font-medium text-slate-700">Position ID:</span> {employee.positionId ?? 'Pending'}</span>
              <span>
                <span className="font-medium text-slate-700">Cost Code:</span> {employee.costCodeSummary ?? 'Unassigned'}
              </span>
              <span><span className="font-medium text-slate-700">Status:</span> {formatStatus(employee.status)}</span>
              <span><span className="font-medium text-slate-700">Hire Date:</span> {formatDate(employee.hireDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={onGenerateDocument}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" aria-hidden="true" /> Generate Document
          </button>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
              <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">More profile actions</span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={onExportPdf}
                        className={clsx('flex w-full items-center gap-2 px-4 py-2 text-sm', active ? 'bg-slate-100 text-slate-900' : 'text-slate-700')}
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" aria-hidden="true" /> Export Profile PDF
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={onViewHistory}
                        className={clsx('flex w-full items-center gap-2 px-4 py-2 text-sm', active ? 'bg-slate-100 text-slate-900' : 'text-slate-700')}
                      >
                        <ClockIcon className="h-4 w-4" aria-hidden="true" /> View History
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
}
